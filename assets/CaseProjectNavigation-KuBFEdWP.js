import {
  f as e,
  l as t
} from "./index-DApnoxmj.js";
var n = e(),
  r = [{
    id: `ams`,
    href: `#case-study-diagram`
  }, {
    id: `maxs-web`,
    href: `#case-study-weld`
  }, {
    id: `caui`,
    href: `#case-study-aoi`
  }, {
    id: `maxs-brand`,
    href: `#case-study-rail`
  }, {
    id: `wenchuan`,
    href: `#case-study-safety`
  }],
  i = {
    zh: {
      ariaLabel: `案例项目导航`,
      previous: `上一个项目`,
      back: `返回项目列表`,
      next: `下一个项目`
    },
    en: {
      ariaLabel: `Case study navigation`,
      previous: `Previous Project`,
      back: `Back to Work`,
      next: `Next Project`
    }
  };

function a(e, n) {
  return (t[e] ?? t.zh).recentWork.groups.flatMap(e => e.items).find(e => e.href === n)?.title ?? n
}

function o({
  direction: e,
  project: t,
  language: r,
  label: i
}) {
  return (0, n.jsxs)(`a`, {
    className: `ams-case-project-link is-${e}`,
    href: t.href,
    "aria-label": `${i}: ${a(r,t.href)}`,
    children: [(0, n.jsx)(`span`, {
      children: i
    }), (0, n.jsx)(`strong`, {
      children: a(r, t.href)
    })]
  })
}

function s({
  currentProjectId: e,
  backHref: t,
  language: a = `zh`
}) {
  let s = i[a] ?? i.zh,
    c = r.findIndex(t => t.id === e),
    l = c > 0 ? r[c - 1] : null,
    u = c >= 0 && c < r.length - 1 ? r[c + 1] : null;
  return (0, n.jsxs)(`nav`, {
    className: `ams-case-bottom-cta`,
    "aria-label": s.ariaLabel,
    children: [l ? (0, n.jsx)(o, {
      direction: `previous`,
      project: l,
      language: a,
      label: s.previous
    }) : (0, n.jsx)(`span`, {
      className: `ams-case-project-link-placeholder`,
      "aria-hidden": `true`
    }), (0, n.jsx)(`a`, {
      className: `ams-case-project-back`,
      href: t,
      children: s.back
    }), u ? (0, n.jsx)(o, {
      direction: `next`,
      project: u,
      language: a,
      label: s.next
    }) : (0, n.jsx)(`span`, {
      className: `ams-case-project-link-placeholder`,
      "aria-hidden": `true`
    })]
  })
}
export {
  s as t
};