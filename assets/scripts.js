// 陆嵩元 · 个人站点 公共脚本
// 章节大标题逐字 fade-up + hero 数字 0→目标值计数 + reveal 滚动揭示
// 从原 index.template.html 抽出，逻辑不变，多页通用。

// —— 渠道来源保留：让 ?from=boss / UTM 在站内浏览和简历下载中延续 ——
(function preserveSourceParams() {
  const trackedParams = ["from", "utm_source", "utm_medium", "utm_campaign"];
  const currentUrl = new URL(window.location.href);
  const sourceParams = new URLSearchParams();

  function getStoredSource(name) {
    try {
      return sessionStorage.getItem("site_source_" + name);
    } catch (err) {
      return "";
    }
  }

  function setStoredSource(name, value) {
    try {
      sessionStorage.setItem("site_source_" + name, value);
    } catch (err) {
      // Browsing can continue without session storage.
    }
  }

  trackedParams.forEach(name => {
    const value = currentUrl.searchParams.get(name) || getStoredSource(name);
    if (!value) return;
    sourceParams.set(name, value);
    setStoredSource(name, value);
  });

  if ([...sourceParams.keys()].length === 0) return;

  document.querySelectorAll("a[href]").forEach(link => {
    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) return;

    const url = new URL(rawHref, window.location.href);
    const isInternal = url.origin === window.location.origin;
    const isResumePdf = url.pathname === "/assets/resume.pdf";
    if (!isInternal && !isResumePdf) return;

    sourceParams.forEach((value, name) => {
      if (!url.searchParams.has(name)) url.searchParams.set(name, value);
    });

    link.href = url.toString();
  });
})();

// —— 章节大标题：拆成单字 span，错峰 fade-up ——
document.querySelectorAll(".chapter-head h2").forEach(h => {
  const text = h.textContent;
  h.textContent = "";
  [...text].forEach((c, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = c;
    s.style.transitionDelay = (i * 80) + "ms";
    h.appendChild(s);
  });
});

// —— 数字计数动画（easeOutCubic）——
function animateCount(el) {
  const to = parseFloat(el.dataset.to);
  const decimals = parseInt(el.dataset.decimals || "0", 10);
  const dur = 1400;
  const t0 = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (to * eased).toFixed(decimals);
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = to.toFixed(decimals);
  }
  requestAnimationFrame(tick);
}

// —— 滚动揭示：进入视口时点亮 + 触发计数 ——
const io = new IntersectionObserver((es) => {
  es.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("on");
      e.target.querySelectorAll(".count").forEach(animateCount);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
