import {
  c as e,
  d as t,
  f as n,
  h as r,
  i,
  l as a,
  m as o,
  p as c,
  r as l,
  t as d,
  u as f
} from "./index-DApnoxmj.js";
var p = r(o(), 1),
  m = c(),
  h = n(),
  g = {
    initial: {
      opacity: 0,
      y: 28,
      scale: .99,
      filter: `blur(8px)`
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
      duration: .78,
      ease: [.22, .61, .36, 1]
    }
  };

function _(...e) {
  return e.filter(Boolean).join(` `)
}
var v = {};

function y({
  item: e,
  badge: t,
  onOpen: n,
  featured: r = !1,
  actionLabel: i
}) {
  return (0, h.jsxs)(f.button, {
    type: `button`,
    className: _(`notes-card`, r && `is-featured`, `theme-${e.theme}`),
    onClick: e => n(e.currentTarget),
    initial: {
      opacity: 0,
      y: 18,
      scale: .985,
      filter: `blur(4px)`
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
      duration: .64,
      ease: [.22, .61, .36, 1]
    },
    whileHover: {
      y: -4
    },
    children: [(0, h.jsxs)(`div`, {
      className: `notes-card-head`,
      children: [(0, h.jsx)(`span`, {
        className: `notes-card-pill`,
        children: t
      }), (0, h.jsx)(`span`, {
        className: `notes-card-meta`,
        children: e.meta
      })]
    }), (0, h.jsxs)(`div`, {
      className: `notes-card-copy`,
      children: [(0, h.jsx)(`h3`, {
        children: e.title
      }), (0, h.jsx)(`p`, {
        children: e.subtitle
      })]
    }), (0, h.jsxs)(`div`, {
      className: `notes-card-foot`,
      children: [(0, h.jsx)(`span`, {
        className: `notes-card-tag`,
        children: e.tag
      }), (0, h.jsx)(`span`, {
        className: `notes-card-action`,
        children: i
      })]
    })]
  })
}

function b({
  language: n,
  onLanguageChange: r
}) {
  let o = a[n],
    s = o.notesPage,
    c = o.otherThings.writingCard.items,
    [x, S] = (0, p.useState)(null),
    C = x ? v[x.id] ?? null : null,
    {
      captureTrigger: w,
      completeClose: T,
      setDialogNode: E,
      setInitialFocusNode: D
    } = e({
      isOpen: !!x,
      onClose: () => S(null)
    });
  return (0, h.jsxs)(`div`, {
    className: `notes-page`,
    children: [(0, h.jsx)(`div`, {
      className: `notes-page-glow is-left`
    }), (0, h.jsx)(`div`, {
      className: `notes-page-glow is-right`
    }), (0, h.jsxs)(`main`, {
      className: `notes-page-home`,
      children: [(0, h.jsx)(i, {
        language: n,
        navItems: o.navItems,
        name: o.hero.name,
        onLanguageChange: r,
        activeKey: `notes`,
        className: `notes-page-header`
      }), (0, h.jsxs)(f.section, {
        className: `notes-page-hero`,
        ...g,
        children: [(0, h.jsxs)(`div`, {
          className: `notes-page-hero-copy`,
          children: [(0, h.jsx)(`p`, {
            className: `notes-page-kicker`,
            children: s.kicker
          }), (0, h.jsx)(`h1`, {
            children: s.title
          })]
        }), (0, h.jsxs)(`div`, {
          className: `notes-page-hero-text`,
          children: [(0, h.jsx)(`p`, {
            children: s.intro
          }), (0, h.jsx)(`p`, {
            children: s.note
          })]
        })]
      }), (0, h.jsxs)(f.section, {
        className: `notes-page-section`,
        ...g,
        children: [(0, h.jsxs)(`div`, {
          className: `notes-page-section-head`,
          children: [(0, h.jsxs)(`div`, {
            className: `notes-page-section-heading`,
            children: [(0, h.jsx)(`p`, {
              className: `notes-page-section-kicker`,
              children: s.writingBadge
            }), (0, h.jsx)(`h2`, {
              children: s.writingTitle
            })]
          }), (0, h.jsx)(`div`, {
            className: `notes-page-section-intro`,
            children: (0, h.jsx)(`p`, {
              children: s.writingIntro
            })
          })]
        }), (0, h.jsx)(`div`, {
          className: `notes-writing-grid`,
          children: c.map(e => (0, h.jsx)(y, {
            item: e,
            badge: s.writingBadge,
            actionLabel: s.openLabel,
            onOpen: t => {
              w(t), S(e)
            }
          }, e.id))
        })]
      }), (0, h.jsx)(l, {
        footer: o.footer
      })]
    }), typeof document < `u` ? (0, m.createPortal)((0, h.jsx)(t, {
      onExitComplete: T,
      children: x ? (0, h.jsx)(f.div, {
        className: `notes-modal-backdrop`,
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
          duration: .22,
          ease: [.22, .61, .36, 1]
        },
        onClick: () => S(null),
        children: (0, h.jsxs)(f.div, {
          className: _(`notes-modal`, `theme-${x.theme}`),
          initial: {
            opacity: 0,
            y: 18,
            scale: .94
          },
          animate: {
            opacity: 1,
            y: 0,
            scale: 1
          },
          exit: {
            opacity: 0,
            y: 18,
            scale: .94
          },
          transition: {
            duration: .28,
            ease: [.22, .61, .36, 1]
          },
          onClick: e => e.stopPropagation(),
          ref: E,
          role: `dialog`,
          "aria-modal": `true`,
          "aria-labelledby": `notes-modal-${x.id}`,
          "aria-describedby": `notes-modal-${x.id}-description`,
          children: [(0, h.jsx)(`button`, {
            type: `button`,
            className: `notes-modal-close`,
            "aria-label": s.closeLabel,
            ref: D,
            onClick: () => S(null),
            children: (0, h.jsx)(d, {})
          }), (0, h.jsxs)(`div`, {
            className: `notes-modal-hero`,
            children: [C ? (0, h.jsx)(`div`, {
              className: `notes-modal-cover`,
              children: (0, h.jsx)(`img`, {
                loading: `lazy`,
                src: C,
                alt: ``,
                "aria-hidden": `true`
              })
            }) : null, (0, h.jsxs)(`div`, {
              className: `notes-modal-badges`,
              children: [(0, h.jsx)(`span`, {
                children: x.meta
              }), (0, h.jsx)(`span`, {
                children: x.tag
              })]
            }), (0, h.jsx)(`h3`, {
              id: `notes-modal-${x.id}`,
              children: x.title
            }), (0, h.jsx)(`p`, {
              id: `notes-modal-${x.id}-description`,
              children: x.subtitle
            })]
          }), (0, h.jsx)(`div`, {
            className: `notes-modal-sections`,
            children: x.sections.map(e => (0, h.jsxs)(`section`, {
              className: `notes-modal-section`,
              children: [(0, h.jsx)(`span`, {
                children: e.heading
              }), (0, h.jsx)(`p`, {
                children: e.body
              })]
            }, e.heading))
          })]
        })
      }) : null
    }), document.body) : null]
  })
}
export {
  b as NotesPage
};