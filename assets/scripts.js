// 陆嵩元 · 个人站点 公共脚本
// 章节大标题逐字 fade-up + hero 数字 0→目标值计数 + reveal 滚动揭示
// 从原 index.template.html 抽出，逻辑不变，多页通用。

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
