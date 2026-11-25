window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"], ["$", "$"]],
    displayMath: [["\\[", "\\]"], ["$$", "$$"]],
    processEscapes: true,
    processEnvironments: true
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  },
  startup: {
    // 禁止 MathJax 自动渲染！
    // 原因：MathJax CDN 在 DOMContentLoaded 之前执行完毕,
    //       会先渲染公式(将 \[...\] 替换为 <mjx-container>),
    //       之后 auto-enhance.js 的 foldAllHeadings() 重组 DOM,
    //       再调用 typesetClear 会清掉已渲染的公式，导致公式消失。
    // 解决：由 auto-enhance.js 在 DOM 重组完成后统一触发渲染。
    typeset: false
  }
};
