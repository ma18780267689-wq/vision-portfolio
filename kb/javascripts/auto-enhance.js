// docs/javascripts/auto-enhance.js
// - 每次页面切换都执行（兼容 Material instant navigation）
// - 标题自动折叠：h1-h6 => <details><summary>...
// - 段落开头加粗（strong）=> callout
// - 新增：支持 #expand- 锚点自动展开知识块对应内容
(() => {
  const DEFAULT_OPEN_LEVEL = 1;

  function isHeading(el) { return el && el.nodeType === 1 && /^H[1-6]$/.test(el.tagName); }
  function getHeadingLevel(h) { return parseInt(h.tagName.substring(1), 10); }

  function alreadyEnhanced(article) {
    return article.querySelector(":scope > details.auto-fold") !== null;
  }

  function createDetailsForHeading(headingEl) {
    const level = getHeadingLevel(headingEl);
    const details = document.createElement("details");
    details.className = `auto-fold auto-fold-l${level}`;
    if (level <= DEFAULT_OPEN_LEVEL) details.open = true;
    const summary = document.createElement("summary");
    summary.className = `auto-fold-summary auto-fold-summary-l${level}`;
    headingEl.classList.add("auto-fold-heading");
    summary.appendChild(headingEl);
    const content = document.createElement("div");
    content.className = "auto-fold-content";
    details.appendChild(summary);
    details.appendChild(content);
    return { details, content, level };
  }

  function foldAllHeadings(article) {
    const nodes = Array.from(article.childNodes);
    article.innerHTML = "";
    const stack = [];
    function currentRoot() {
      if (stack.length === 0) return article;
      return stack[stack.length - 1].content;
    }
    for (const node of nodes) {
      if (node.nodeType === 1 && isHeading(node)) {
        const level = getHeadingLevel(node);
        while (stack.length > 0 && stack[stack.length - 1].level >= level) { stack.pop(); }
        const { details, content } = createDetailsForHeading(node);
        currentRoot().appendChild(details);
        stack.push({ level, content });
      } else {
        currentRoot().appendChild(node);
      }
    }
  }

  function isInside(el, selector) { return !!(el && el.closest && el.closest(selector)); }
  function firstMeaningfulChild(p) {
    for (const n of p.childNodes) {
      if (n.nodeType === 3) { if (n.textContent.trim() === "") continue; return n; }
      if (n.nodeType === 1) return n;
    }
    return null;
  }

  function convertBoldToCallout(root) {
    const elements = root.querySelectorAll("article.md-content__inner.md-typeset p, article.md-content__inner.md-typeset li");
    elements.forEach((el) => {
      if (isInside(el, "summary") || isInside(el, "table") || el.classList.contains("auto-tagged-line")) return;
      const first = firstMeaningfulChild(el);
      if (!first || first.nodeType !== 1 || first.tagName !== "STRONG") return;
      let titleText = first.textContent.trim();
      if (!titleText) return;
      const tag = document.createElement("span");
      tag.className = "auto-inline-tag";
      tag.textContent = titleText;
      first.replaceWith(tag);
      el.classList.add("auto-tagged-line");
    });
  }

  function trimParagraphEndings(root) {
    const paragraphs = root.querySelectorAll("article.md-content__inner.md-typeset p");
    paragraphs.forEach((p) => {
      while (p.lastChild) {
        if (p.lastChild.nodeType === 1 && p.lastChild.tagName === "BR") { p.removeChild(p.lastChild); }
        else if (p.lastChild.nodeType === 3) {
          const trimmed = p.lastChild.textContent.replace(/\s+$/, "");
          if (trimmed === "") { p.removeChild(p.lastChild); }
          else { p.lastChild.textContent = trimmed; break; }
        } else { break; }
      }
    });
  }

  // ─── MathJax 公式渲染触发器 ───
  // 修复1：auto-enhance.js 先于 MathJax CDN 执行，typesetPromise 不存在 → 重试
  // 修复2：公式在折叠的 <details> 内(display:none)，MathJax 无法计算尺寸
  //        → 渲染前临时展开所有折叠，渲染完毕后恢复原始状态
  // 修复3：用户手动展开折叠时，重新触发该折叠内公式的渲染
  let mathJaxRetryTimer = null;
  let mathToggleListenersBound = false;

  function triggerMathJax(retryCount) {
    retryCount = retryCount || 0;
    const maxRetries = 15;

    const mathElements = document.querySelectorAll('.arithmatex');
    if (mathElements.length === 0) return;

    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      if (mathJaxRetryTimer) { clearTimeout(mathJaxRetryTimer); mathJaxRetryTimer = null; }
      typesetWithOpenDetails();
      bindDetailsToggleForMath();
    } else if (retryCount < maxRetries) {
      var delay = Math.min(200 + retryCount * 200, 2000);
      mathJaxRetryTimer = setTimeout(function () {
        triggerMathJax(retryCount + 1);
      }, delay);
    }
  }

  // 临时展开所有折叠 → MathJax 渲染 → 恢复原状
  function typesetWithOpenDetails() {
    const allDetails = document.querySelectorAll('details.auto-fold');
    // 记录哪些 details 原本是关闭的
    const wasClosed = [];
    allDetails.forEach(function (d) {
      if (!d.open) {
        wasClosed.push(d);
        d.open = true;    // 临时展开
      }
    });

    // 等浏览器完成布局，确保公式可见后再让 MathJax 渲染
    requestAnimationFrame(function () {
      var mathEls = document.querySelectorAll('.arithmatex');
      // 清除可能残留的"已处理"标记（instant navigation 切换页面时可能有）
      if (mathEls.length > 0 && typeof MathJax.typesetClear === 'function') {
        MathJax.typesetClear(Array.from(mathEls));
      }
      MathJax.typesetPromise().then(function () {
        wasClosed.forEach(function (d) { d.open = false; });
      }).catch(function (err) {
        wasClosed.forEach(function (d) { d.open = false; });
        console.warn('[auto-enhance] MathJax typeset error:', err);
      });
    });
  }

  // 监听 details 展开事件，重新渲染其中的公式
  function bindDetailsToggleForMath() {
    if (mathToggleListenersBound) return;
    mathToggleListenersBound = true;

    document.addEventListener('toggle', function (e) {
      var details = e.target;
      if (!details.open || !details.classList.contains('auto-fold')) return;
      // 检查该折叠内是否有公式
      var innerMath = details.querySelectorAll('.arithmatex');
      if (innerMath.length === 0) return;
      // 清除并重新渲染
      if (typeof MathJax.typesetClear === 'function') {
        MathJax.typesetClear(Array.from(innerMath));
      }
      MathJax.typesetPromise().catch(function () { });
    }, true); // useCapture=true 捕获 toggle 事件
  }

  // 核心新增：自动根据 Hash 展开
  function handleHashExpand() {
    const hash = decodeURIComponent(window.location.hash);
    if (!hash.startsWith('#expand-')) return;
    const targetTitle = hash.replace('#expand-', '');

    // 寻找包含该标题内容的 headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let targetEl = null;
    for (const h of headings) {
      if (h.textContent.trim().includes(targetTitle)) {
        targetEl = h;
        break;
      }
    }

    if (targetEl) {
      // 向上查找所有 details 并展开
      let parent = targetEl.parentElement;
      while (parent) {
        if (parent.tagName === 'DETAILS') parent.setAttribute('open', '');
        parent = parent.parentElement;
      }
      // 滚动到该位置
      setTimeout(() => {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }

  function enhanceOnce() {
    if (document.getElementById('wm-fullpage')) return;
    const article = document.querySelector("article.md-content__inner.md-typeset");
    if (!article) return;

    if (!alreadyEnhanced(article)) {
      foldAllHeadings(article);
      injectExpandCollapseButtons(article);
    }
    convertBoldToCallout(document);
    trimParagraphEndings(document);

    // 触发 MathJax（修复：处理 MathJax CDN 尚未加载完成的情况）
    triggerMathJax();

    // 检查并处理自动展开
    setTimeout(handleHashExpand, 150);
  }

  function injectExpandCollapseButtons(article) {
    if (document.querySelector(".auto-expand-controls")) return;
    const controls = document.createElement("div");
    controls.className = "auto-expand-controls";
    const btnExpand = document.createElement("button");
    btnExpand.textContent = "全部展开"; btnExpand.className = "auto-expand-btn";
    btnExpand.onclick = () => toggleAll(true);
    const btnCollapse = document.createElement("button");
    btnCollapse.textContent = "全部折叠"; btnCollapse.className = "auto-expand-btn";
    btnCollapse.onclick = () => toggleAll(false);
    controls.appendChild(btnExpand); controls.appendChild(btnCollapse);
    article.insertBefore(controls, article.firstChild);
  }

  function toggleAll(open) {
    document.querySelectorAll("details.auto-fold").forEach(d => {
      if (open) d.setAttribute("open", ""); else d.removeAttribute("open");
    });
  }

  function hook() {
    enhanceOnce();
    if (window.document$ && window.document$.subscribe) {
      window.document$.subscribe(() => { enhanceOnce(); hideLoadingOverlay(); });
    } else {
      document.addEventListener("navigation:load", enhanceOnce);
    }
  }

  function createLoadingOverlay() {
    if (document.querySelector('.page-loading-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'page-loading-overlay';
    overlay.innerHTML = '<div class="loading-spinner"></div>';
    document.body.insertBefore(overlay, document.body.firstChild);
  }

  function hideLoadingOverlay() {
    const overlay = document.querySelector('.page-loading-overlay');
    if (overlay) { overlay.classList.add('hidden'); setTimeout(() => overlay.remove(), 300); }
  }

  createLoadingOverlay();
  document.addEventListener("DOMContentLoaded", () => {
    hook();
    setTimeout(hideLoadingOverlay, 100);
  });
  window.addEventListener("load", hideLoadingOverlay);
})();
