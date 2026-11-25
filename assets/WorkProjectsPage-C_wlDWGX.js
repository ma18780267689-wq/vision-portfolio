import {
  c as e,
  d as t,
  f as n,
  h as r,
  i,
  l as a,
  m as o,
  n as s,
  p as c,
  r as l,
  t as u,
  u as d
} from "./index-DApnoxmj.js";
var f = r(o(), 1),
  p = c(),
  m = n();

function h(e, t) {
  return t === `zh` && e === `一些持续在做的项目。` ? (0, m.jsxs)(m.Fragment, {
    children: [(0, m.jsx)(`span`, {
      children: `一些持续在做`
    }), (0, m.jsx)(`span`, {
      children: `的项目。`
    })]
  }) : e
}
var g = [{
    span: 3,
    size: `tall`
  }, {
    span: 2,
    size: `tall`
  }, {
    span: 2,
    size: `medium`
  }, {
    span: 3,
    size: `medium`
  }, {
    span: 3,
    size: `medium`
  }, {
    span: 2,
    size: `medium`
  }, {
    span: 2,
    size: `compact`
  }, {
    span: 3,
    size: `compact`
  }, {
    span: 3,
    size: `compact`
  }, {
    span: 2,
    size: `compact`
  }, {
    span: 2,
    size: `compact`
  }, {
    span: 3,
    size: `compact`
  }],
  _ = {
    "project-01": {
      type: `devices`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      secondary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      tertiary: `/vision-portfolio/assets/content/unravel-still-life.png`
    },
    "project-02": {
      type: `devices`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      secondary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      tertiary: `/vision-portfolio/assets/content/unravel-still-life.png`
    },
    "project-03": {
      type: `devices`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      secondary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      tertiary: `/vision-portfolio/assets/content/unravel-still-life.png`
    },
    "project-04": {
      type: `devices`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      secondary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      tertiary: `/vision-portfolio/assets/content/unravel-still-life.png`
    },
    "project-05": {
      type: `devices`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      secondary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      tertiary: `/vision-portfolio/assets/content/unravel-still-life.png`
    },
    "project-06": {
      type: `devices`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      secondary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      tertiary: `/vision-portfolio/assets/content/unravel-still-life.png`
    },
    "project-07": {
      type: `devices`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      secondary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      tertiary: `/vision-portfolio/assets/content/unravel-still-life.png`
    },
    "project-08": {
      type: `browser`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      imageClassName: `is-top`
    },
    "project-09": {
      type: `browser`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      imageClassName: `is-center`
    },
    "project-10": {
      type: `browser`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      imageClassName: `is-top`
    },
    "project-11": {
      type: `browser`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      imageClassName: `is-center`
    },
    "project-12": {
      type: `browser`,
      primary: `/vision-portfolio/assets/content/unravel-still-life.png`,
      imageClassName: `is-center`
    }
  };

function v(...e) {
  return e.filter(Boolean).join(` `)
}

function y({
  item: e
}) {
  let t = _[e.id];
  return t ? t.type === `browser` ? (0, m.jsxs)(`div`, {
    className: `work-project-browser-shell`,
    "aria-hidden": `true`,
    children: [(0, m.jsxs)(`div`, {
      className: `work-project-browser-top`,
      children: [(0, m.jsx)(`span`, {}), (0, m.jsx)(`span`, {}), (0, m.jsx)(`span`, {})]
    }), (0, m.jsx)(`div`, {
      className: `work-project-browser-body`,
      children: (0, m.jsx)(`img`, {
        loading: `lazy`,
        src: t.primary,
        alt: ``,
        className: v(`work-project-browser-image`, t.imageClassName),
        decoding: `async`
      })
    })]
  }) : (0, m.jsx)(`div`, {
    className: `work-project-devices`,
    "aria-hidden": `true`,
    children: [{
      key: `secondary`,
      className: `is-secondary`
    }, {
      key: `primary`,
      className: `is-primary`
    }, {
      key: `tertiary`,
      className: `is-tertiary`
    }].filter(({
      key: e
    }) => t[e]).map(({
      key: e,
      className: n
    }) => (0, m.jsx)(`div`, {
      className: v(`work-project-device`, n),
      children: (0, m.jsx)(`img`, {
        loading: `lazy`,
        src: t[e],
        alt: ``,
        className: `work-project-device-image`,
        decoding: `async`
      })
    }, e))
  }) : (0, m.jsx)(`div`, {
    className: `work-project-preview-fallback`,
    "aria-hidden": `true`
  })
}

function b({
  item: e,
  index: t,
  openLabel: n,
  onOpen: r
}) {
  let i = g[t % g.length];
  return (0, m.jsxs)(d.article, {
    role: `button`,
    tabIndex: 0,
    "aria-label": n + `: ` + e.name,
    className: v(`work-project-card`, e.id, `is-span-${i.span}`, `is-${i.size}`),
    style: {
      "--work-card-accent": e.accent,
      "--work-card-soft": e.accentSoft
    },
    onClick: e => r(e.currentTarget),
    onKeyDown: e => {
      e.key !== `Enter` && e.key !== ` ` || (e.preventDefault(), r(e.currentTarget))
    },
    initial: {
      opacity: 0,
      y: 18,
      scale: .985,
      filter: `blur(5px)`
    },
    whileInView: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: `blur(0px)`
    },
    viewport: {
      once: !0,
      amount: .18
    },
    transition: {
      delay: t % 4 * .04,
      duration: .64,
      ease: [.22, .61, .36, 1]
    },
    whileHover: {
      y: -5,
      scale: 1.01
    },
    children: [(0, m.jsx)(`div`, {
      className: `work-project-card-media`,
      children: (0, m.jsx)(y, {
        item: e
      })
    }), (0, m.jsx)(`div`, {
      className: `work-project-card-overlay`
    }), (0, m.jsxs)(`div`, {
      className: `work-project-card-meta`,
      children: [(0, m.jsx)(`span`, {
        className: `work-project-card-tag`,
        children: e.modalTag
      }), (0, m.jsx)(`span`, {
        className: `work-project-card-index`,
        children: e.dotsLabel
      })]
    }), (0, m.jsxs)(`div`, {
      className: `work-project-card-copy`,
      children: [(0, m.jsx)(`p`, {
        className: `work-project-card-category`,
        children: e.category
      }), (0, m.jsx)(`h2`, {
        className: `work-project-card-title`,
        children: e.name
      }), (0, m.jsx)(`p`, {
        children: e.hoverSubtitle
      })]
    }), (0, m.jsx)(`span`, {
      className: `work-project-card-action`,
      children: n
    })]
  })
}

function x({
  language: n,
  onLanguageChange: r
}) {
  let o = a[n],
    c = o.workProjectsPage,
    g = o.otherThings.projectCard.items,
    [_, y] = (0, f.useState)(null),
    x = g.find(e => e.id === _) ?? null,
    {
      captureTrigger: S,
      completeClose: C,
      setDialogNode: w,
      setInitialFocusNode: T
    } = e({
      isOpen: !!x,
      onClose: () => y(null)
    });
  return (0, m.jsxs)(`div`, {
    className: `work-projects-page`,
    children: [(0, m.jsx)(`div`, {
      className: `work-projects-glow is-left`
    }), (0, m.jsx)(`div`, {
      className: `work-projects-glow is-right`
    }), (0, m.jsxs)(`main`, {
      className: `work-projects-home`,
      children: [(0, m.jsx)(i, {
        language: n,
        navItems: o.navItems,
        name: o.hero.name,
        onLanguageChange: r,
        activeKey: `work`,
        className: `work-projects-header`
      }), (0, m.jsxs)(`section`, {
        className: `work-projects-panel`,
        children: [(0, m.jsxs)(`div`, {
          className: `work-projects-heading`,
          children: [(0, m.jsxs)(`div`, {
            className: `work-projects-heading-copy`,
            children: [(0, m.jsx)(`p`, {
              className: `work-projects-kicker`,
              children: c.kicker
            }), (0, m.jsx)(`h1`, {
              className: `work-projects-title`,
              children: h(c.title, n)
            })]
          }), (0, m.jsxs)(`div`, {
            className: `work-projects-intro`,
            children: [(0, m.jsx)(`p`, {
              children: c.intro
            }), (0, m.jsx)(`p`, {
              children: c.note
            })]
          })]
        }), (0, m.jsx)(`div`, {
          className: `work-projects-grid`,
          children: g.map((e, t) => (0, m.jsx)(b, {
            item: e,
            index: t,
            openLabel: c.openLabel,
            onOpen: t => {
              S(t), y(e.id)
            }
          }, e.id))
        })]
      }), (0, m.jsx)(l, {
        footer: o.footer
      })]
    }), typeof document < `u` ? (0, p.createPortal)((0, m.jsx)(t, {
      onExitComplete: C,
      children: x ? (0, m.jsx)(d.div, {
        className: `other-writing-modal-backdrop`,
        initial: {
          opacity: 0
        },
        animate: {
          opacity: 1
        },
        exit: {
          opacity: 0
        },
        transition: {
          duration: .24,
          ease: [.22, .61, .36, 1]
        },
        onClick: () => y(null),
        children: (0, m.jsxs)(d.div, {
          className: v(`other-writing-modal`, `other-project-modal`),
          initial: {
            opacity: 0,
            y: 18,
            scale: .9
          },
          animate: {
            opacity: 1,
            y: 0,
            scale: 1
          },
          exit: {
            opacity: 0,
            y: 18,
            scale: .9
          },
          transition: {
            duration: .28,
            ease: [.22, .61, .36, 1]
          },
          onClick: e => e.stopPropagation(),
          ref: w,
          role: `dialog`,
          "aria-modal": `true`,
          "aria-labelledby": `work-project-modal-${x.id}`,
          "aria-describedby": `work-project-modal-${x.id}-description`,
          children: [(0, m.jsx)(`button`, {
            type: `button`,
            className: `other-writing-modal-close`,
            "aria-label": c.closeLabel,
            ref: T,
            onClick: () => y(null),
            children: (0, m.jsx)(u, {})
          }), (0, m.jsx)(`div`, {
            className: v(`other-writing-modal-hero`, `other-project-modal-hero`),
            children: (0, m.jsx)(s, {
              item: x
            })
          }), (0, m.jsxs)(`div`, {
            className: v(`other-writing-modal-content`, `other-project-modal-content`),
            children: [(0, m.jsxs)(`div`, {
              className: `other-writing-modal-heading`,
              children: [(0, m.jsx)(`h4`, {
                id: `work-project-modal-${x.id}`,
                children: x.name
              }), (0, m.jsx)(`p`, {
                id: `work-project-modal-${x.id}-description`,
                children: x.modalIntro
              })]
            }), (0, m.jsx)(`div`, {
              className: `other-writing-modal-sections`,
              children: x.modalSections.map(e => (0, m.jsxs)(`section`, {
                className: `other-writing-modal-section`,
                children: [(0, m.jsx)(`span`, {
                  children: e.heading
                }), (0, m.jsx)(`p`, {
                  children: e.body
                })]
              }, e.heading))
            })]
          })]
        })
      }) : null
    }), document.body) : null]
  })
}
export {
  x as WorkProjectsPage
};