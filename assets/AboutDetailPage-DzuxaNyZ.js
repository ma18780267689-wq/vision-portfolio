import {PatentAchievements} from "./patents.js";
import {openContact} from "./contact.js";
import {
  a as e,
  f as t,
  i as n,
  l as r,
  r as i,
  u as a
} from "./index-DApnoxmj.js";
var o = t(),
  s = {
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
      duration: .76,
      ease: [.22, .61, .36, 1]
    }
  },
  c = new Set([`，`, `。`, `、`, `：`, `；`, `！`, `？`]);

function l(e) {
  return e.split(/([，。：；！？、])/).filter(Boolean).map((e, t) => c.has(e) ? (0, o.jsx)(`span`, {
    className: `about-detail-title-punctuation`,
    "aria-hidden": `true`,
    children: e
  }, `${e}-${t}`) : e)
}
var u = {"zh":{"hero":{"kicker":"关于 / 马志成","titlePrimary":"先理解问题，","titleSecondary":"在实践中积累。","lead":"自2021年起从事计算机视觉研发，经验以二维工业视觉为主，也做过二维图像与三维点云结合的检测项目。","meta":["成都","计算机视觉研发","工业检测 / 图纸结构化"],"paragraphs":["工作中，我会先理解场景依据什么区分合格与不合格，再分析数据和失败样本，判断算法需要获取什么信息。","项目经历包括施耐德检测系统整改、单线图拓扑重建和焊缝测量，工作涉及算法实现、软件对接与现场验证。"],"primaryCtaLabel":"查看简历","primaryCtaHref":"/vision-portfolio/assets/content/resume-cv.pdf","secondaryCtaLabel":"去联系我","secondaryCtaHref":"#contact","imageSrc":"/vision-portfolio/assets/content/about-study-still-life.png","imageAlt":"米白纸张、笔记本与墨绿放大镜的分析主题静物配图","roleEyebrow":"最近一段经历","roleTitle":"工业视觉与图纸解析","roleBody":"2024年5月至2026年4月，任职于安格利（成都）仪器设备有限公司；实际离职日期为2026年4月2日。","highlights":[["2021起","从事计算机视觉研发"],["3项","已授权发明专利"],["二维为主","结合三维测量协作"]]},"journey":{"eyebrow":"经历","title":"经历与积累","intro":"以工作经历和实际承担的项目为线索。","steps":[{"phase":"2021—2022","title":"优创新港 · 图像算法","body":"铁路关键部件与卷烟厂安全视频分析。"},{"phase":"2022—2024","title":"中科创达 · 算法研发","body":"工业检测、既有系统诊断与现场整改。"},{"phase":"2024—2026","title":"安格利 · 算法侧职责","body":"单线图解析与拓扑恢复，以及手持焊缝检测中的算法工作。"}],"closing":"工业视觉是主要积累方向，Agent与个人工具是补充实践。"},"values":{"eyebrow":"价值观","title":"我希望坚持的工作原则。","intro":"从工业视觉与图纸解析实践中形成的工作原则。","items":[{"index":"01","title":"先明确判定","body":"先问清楚什么算合格、什么结果真正可用。施耐德与单线图的经历都让我重视这一步。"},{"index":"02","title":"让结果能被检查","body":"用清楚的指标、样本和版本说明支撑结论，也保留当前不支持的范围。"},{"index":"03","title":"让反馈改变判断","body":"从现场使用与失败案例获得反馈，继续修正任务、数据与方案。这些是工作方式自述，待本人确认。"}],"hidden":true},"life":{"eyebrow":"工作之外","title":"工作之外，也留一点空间。","intro":"这一部分保留参考站的照片与生活拼贴布局。兴趣内容和个人照片尚未选择，当前插画只作版式占位。","notes":[{"title":"个人兴趣 · 待确认","body":"希望放入真实而且愿意公开的内容；不将原作者的徒步、摄影或个人偏好作为我的经历。"},{"title":"个人照片 · 待选择","body":"希望放入真实而且愿意公开的内容；不将原作者的徒步、摄影或个人偏好作为我的经历。"}],"photos":[{"className":"is-tall","src":"/vision-portfolio/assets/content/about-study-still-life.png","alt":"待补个人照片 · 同风格插画占位","caption":"待补本人照片与场景说明。"},{"className":"is-wide","src":"/vision-portfolio/assets/content/about-study-still-life.png","alt":"待补个人照片 · 同风格插画占位","caption":"待补本人照片与场景说明。"}],"hidden":true},"closing":{"eyebrow":"正在求职","title":"从一个具体问题，开始交流。","body":"欢迎围绕工业视觉、图纸识别与算法研发工作联系我。","note":"邮箱与微信可在原个人网站查看。","primaryLabel":"联系我","primaryHref":"#contact","secondaryLabel":"查看简历","secondaryHref":"/vision-portfolio/assets/content/resume-cv.pdf","imageSrc":"/vision-portfolio/assets/content/contact-still-life.png","imageAlt":"纸张、笔记本与墨绿钢笔组成的交流主题静物配图"}},"en":{"hero":{"kicker":"关于 / 马志成","titlePrimary":"先理解问题，","titleSecondary":"在实践中积累。","lead":"自2021年起从事计算机视觉研发，经验以二维工业视觉为主，也做过二维图像与三维点云结合的检测项目。","meta":["成都","计算机视觉研发","工业检测 / 图纸结构化"],"paragraphs":["工作中，我会先理解场景依据什么区分合格与不合格，再分析数据和失败样本，判断算法需要获取什么信息。","项目经历包括施耐德检测系统整改、单线图拓扑重建和焊缝测量，工作涉及算法实现、软件对接与现场验证。"],"primaryCtaLabel":"查看简历","primaryCtaHref":"/vision-portfolio/assets/content/resume-cv.pdf","secondaryCtaLabel":"去联系我","secondaryCtaHref":"#contact","imageSrc":"/vision-portfolio/assets/content/about-study-still-life.png","imageAlt":"米白纸张、笔记本与墨绿放大镜的分析主题静物配图","roleEyebrow":"最近一段经历","roleTitle":"工业视觉与图纸解析","roleBody":"2024年5月至2026年4月，任职于安格利（成都）仪器设备有限公司；实际离职日期为2026年4月2日。","highlights":[["2021起","从事计算机视觉研发"],["3项","已授权发明专利"],["二维为主","结合三维测量协作"]]},"journey":{"eyebrow":"经历","title":"经历与积累","intro":"以工作经历和实际承担的项目为线索。","steps":[{"phase":"2021—2022","title":"优创新港 · 图像算法","body":"铁路关键部件与卷烟厂安全视频分析。"},{"phase":"2022—2024","title":"中科创达 · 算法研发","body":"工业检测、既有系统诊断与现场整改。"},{"phase":"2024—2026","title":"安格利 · 算法侧职责","body":"单线图解析与拓扑恢复，以及手持焊缝检测中的算法工作。"}],"closing":"工业视觉是主要积累方向，Agent与个人工具是补充实践。"},"values":{"eyebrow":"价值观","title":"我希望坚持的工作原则。","intro":"从工业视觉与图纸解析实践中形成的工作原则。","items":[{"index":"01","title":"先明确判定","body":"先问清楚什么算合格、什么结果真正可用。施耐德与单线图的经历都让我重视这一步。"},{"index":"02","title":"让结果能被检查","body":"用清楚的指标、样本和版本说明支撑结论，也保留当前不支持的范围。"},{"index":"03","title":"让反馈改变判断","body":"从现场使用与失败案例获得反馈，继续修正任务、数据与方案。这些是工作方式自述，待本人确认。"}],"hidden":true},"life":{"eyebrow":"工作之外","title":"工作之外，也留一点空间。","intro":"这一部分保留参考站的照片与生活拼贴布局。兴趣内容和个人照片尚未选择，当前插画只作版式占位。","notes":[{"title":"个人兴趣 · 待确认","body":"希望放入真实而且愿意公开的内容；不将原作者的徒步、摄影或个人偏好作为我的经历。"},{"title":"个人照片 · 待选择","body":"希望放入真实而且愿意公开的内容；不将原作者的徒步、摄影或个人偏好作为我的经历。"}],"photos":[{"className":"is-tall","src":"/vision-portfolio/assets/content/about-study-still-life.png","alt":"待补个人照片 · 同风格插画占位","caption":"待补本人照片与场景说明。"},{"className":"is-wide","src":"/vision-portfolio/assets/content/about-study-still-life.png","alt":"待补个人照片 · 同风格插画占位","caption":"待补本人照片与场景说明。"}],"hidden":true},"closing":{"eyebrow":"正在求职","title":"从一个具体问题，开始交流。","body":"欢迎围绕工业视觉、图纸识别与算法研发工作联系我。","note":"邮箱与微信可在原个人网站查看。","primaryLabel":"联系我","primaryHref":"#contact","secondaryLabel":"查看简历","secondaryHref":"/vision-portfolio/assets/content/resume-cv.pdf","imageSrc":"/vision-portfolio/assets/content/contact-still-life.png","imageAlt":"纸张、笔记本与墨绿钢笔组成的交流主题静物配图"}}};

function d({
  language: t,
  onLanguageChange: c
}) {
  let d = r[t] ?? r.zh,
    f = u[t] ?? u.zh,
    p = t => {
      t.preventDefault(), e(t.currentTarget)
    };
  return (0, o.jsxs)(`div`, {
    className: `about-detail-page is-${t}`,
    children: [(0, o.jsx)(`div`, {
      className: `about-detail-glow is-left`
    }), (0, o.jsx)(`div`, {
      className: `about-detail-glow is-right`
    }), (0, o.jsxs)(`div`, {
      className: `portfolio-home about-detail-home`,
      children: [(0, o.jsx)(n, {
        className: `about-detail-header`,
        language: t,
        navItems: d.navItems,
        name: d.hero.name,
        onLanguageChange: c,
        activeKey: `about`
      }), (0, o.jsxs)(`main`, {
        className: `about-detail-main`,
        children: [(0, o.jsxs)(a.section, {
          id: `about-me-intro`,
          className: `about-detail-hero`,
          ...s,
          children: [(0, o.jsxs)(`div`, {
            className: `about-detail-hero-copy`,
            children: [(0, o.jsx)(`p`, {
              className: `about-detail-kicker`,
              children: f.hero.kicker
            }), (0, o.jsxs)(`h1`, {
              className: `about-detail-title`,
              children: [(0, o.jsx)(`span`, {
                children: l(f.hero.titlePrimary)
              }), (0, o.jsx)(`span`, {
                children: l(f.hero.titleSecondary)
              })]
            }), (0, o.jsx)(`p`, {
              className: `about-detail-lead`,
              children: f.hero.lead
            }), (0, o.jsx)(`div`, {
              className: `about-detail-meta`,
              children: f.hero.meta.map(e => (0, o.jsx)(`span`, {
                className: `about-detail-meta-chip`,
                children: e
              }, e))
            }), (0,o.jsx)(`dl`,{className:`about-detail-facts`,children:f.hero.highlights.map(([value,label])=>(0,o.jsxs)(`div`,{children:[(0,o.jsx)(`dt`,{children:label}),(0,o.jsx)(`dd`,{children:value})]},label))}), (0, o.jsx)(`div`, {
              className: `about-detail-prose`,
              children: f.hero.paragraphs.map(e => (0, o.jsx)(`p`, {
                children: e
              }, e))
            }), (0, o.jsxs)(`div`, {
              className: `about-detail-actions`,
              children: [(0, o.jsx)(`a`, {
                className: `about-detail-button is-primary`,
                href: f.hero.primaryCtaHref,
                target: `_blank`,
                rel: `noreferrer`,
                children: f.hero.primaryCtaLabel
              }), (0, o.jsx)(`a`, {
                className: `about-detail-button is-secondary`,
                href: f.hero.secondaryCtaHref,
                onClick: p,
                children: f.hero.secondaryCtaLabel
              })]
            })]
          }), (0, o.jsxs)(`div`, {
            className: `about-detail-hero-media`,
            children: [(0, o.jsx)(`div`, {
              className: `about-detail-hero-figure`,
              children: (0, o.jsx)(`img`, {
                loading: `lazy`,
                className: `about-detail-hero-image`,
                src: f.hero.imageSrc,
                alt: f.hero.imageAlt
              })
            }), (0, o.jsxs)(`div`, {
              className: `about-detail-role-card`,
              children: [(0, o.jsx)(`span`, {
                children: f.hero.roleEyebrow
              }), (0, o.jsx)(`strong`, {
                children: f.hero.roleTitle
              }), (0, o.jsx)(`p`, {
                children: f.hero.roleBody
              })]
            })]
          })]
        }), (0, o.jsxs)(a.section, {
          id: `about-me-experience`,
          className: `about-detail-section is-white`,
          ...s,
          children: [(0, o.jsxs)(`div`, {
            className: `about-detail-section-head is-journey-head`,
            children: [(0, o.jsx)(`p`, {
              className: `about-detail-section-kicker`,
              children: f.journey.eyebrow
            }), (0, o.jsx)(`h2`, {
              className: `about-detail-display-title`,
              children: f.journey.title
            }), (0, o.jsx)(`p`, {
              className: `about-detail-section-copy`,
              children: f.journey.intro
            })]
          }), (0, o.jsx)(`div`, {
            className: `about-detail-journey-path`,
            children: f.journey.steps.map((e, t) => (0, o.jsxs)(`article`, {
              className: `about-detail-journey-pill is-step-${t+1}`,
              children: [(0, o.jsx)(`span`, {
                className: `about-detail-journey-phase`,
                children: e.phase
              }), (0, o.jsx)(`div`, {
                className: `about-detail-journey-pill-divider`
              }), (0, o.jsxs)(`div`, {
                className: `about-detail-journey-pill-copy`,
                children: [(0, o.jsx)(`strong`, {
                  children: e.title
                }), (0, o.jsx)(`p`, {
                  children: e.body
                })]
              })]
            }, e.title))
          }), (0, o.jsx)(`p`, {
            className: `about-detail-section-copy is-journey-closing`,
            children: f.journey.closing
          })]
        }), (0,o.jsx)(PatentAchievements,{jsx:o,motion:a,reveal:s}), !f.values.hidden && (0, o.jsxs)(a.section, {
          id: `about-me-values`,
          className: `about-detail-section is-plain`,
          ...s,
          children: [(0, o.jsxs)(`div`, {
            className: `about-detail-section-head`,
            children: [(0, o.jsx)(`p`, {
              className: `about-detail-section-kicker`,
              children: f.values.eyebrow
            }), (0, o.jsx)(`h2`, {
              className: `about-detail-display-title`,
              children: f.values.title
            }), (0, o.jsx)(`p`, {
              className: `about-detail-section-copy`,
              children: f.values.intro
            })]
          }), (0, o.jsx)(`div`, {
            className: `about-detail-values-list`,
            children: f.values.items.map(e => (0, o.jsxs)(`article`, {
              className: `about-detail-values-row`,
              children: [(0, o.jsx)(`span`, {
                className: `about-detail-values-index`,
                children: e.index
              }), (0, o.jsx)(`h3`, {
                children: e.title
              }), (0, o.jsx)(`p`, {
                children: e.body
              })]
            }, e.title))
          })]
        }), !f.life.hidden && (0, o.jsxs)(a.section, {
          id: `about-me-life`,
          className: `about-detail-section is-solid`,
          ...s,
          children: [(0, o.jsxs)(`div`, {
            className: `about-detail-section-head`,
            children: [(0, o.jsx)(`p`, {
              className: `about-detail-section-kicker`,
              children: f.life.eyebrow
            }), (0, o.jsx)(`h2`, {
              className: `about-detail-display-title`,
              children: f.life.title
            }), (0, o.jsx)(`p`, {
              className: `about-detail-section-copy`,
              children: f.life.intro
            })]
          }), (0, o.jsxs)(`div`, {
            className: `about-detail-life-layout`,
            children: [(0, o.jsx)(`div`, {
              className: `about-detail-life-notes`,
              children: f.life.notes.map(e => (0, o.jsxs)(`article`, {
                className: `about-detail-life-note`,
                children: [(0, o.jsx)(`h3`, {
                  children: e.title
                }), (0, o.jsx)(`p`, {
                  children: e.body
                })]
              }, e.title))
            }), (0, o.jsx)(`div`, {
              className: `about-detail-life-gallery`,
              children: f.life.photos.map(e => (0, o.jsxs)(`figure`, {
                className: `about-detail-life-photo ${e.className}`,
                children: [(0, o.jsx)(`img`, {
                  loading: `lazy`,
                  src: e.src,
                  alt: e.alt
                }), (0, o.jsx)(`figcaption`, {
                  children: e.caption
                })]
              }, e.src))
            })]
          })]
        }), (0, o.jsxs)(a.section, {
          id: `about-me-contact`,
          className: `about-detail-closing`,
          ...s,
          children: [(0, o.jsx)(`div`, {
            className: `about-detail-closing-media`,
            children: (0, o.jsx)(`img`, {
              loading: `lazy`,
              src: f.closing.imageSrc,
              alt: f.closing.imageAlt
            })
          }), (0, o.jsxs)(`div`, {
            className: `about-detail-closing-copy`,
            children: [(0, o.jsx)(`p`, {
              className: `about-detail-closing-kicker`,
              children: f.closing.eyebrow
            }), (0, o.jsx)(`h2`, {
              children: f.closing.title.split("，").map((line,index)=>(0,o.jsx)("span",{className:"about-contact-title-line",children:line+(index===0?"，":"")},index))
            }), (0, o.jsx)(`p`, {
              children: f.closing.body
            }), (0, o.jsx)(`p`, {
              children: f.closing.note
            }), (0, o.jsxs)(`div`, {
              className: `about-detail-actions is-dark`,
              children: [(0, o.jsx)(`a`, {
                className: `about-detail-button is-dark-primary`,
                href: f.closing.primaryHref, onClick:event=>{event.preventDefault();openContact(event.currentTarget);},
                children: f.closing.primaryLabel
              }), (0, o.jsx)(`a`, {
                className: `about-detail-button is-dark-secondary`,
                href: f.closing.secondaryHref,
                target: `_blank`,
                rel: `noreferrer`,
                children: f.closing.secondaryLabel
              })]
            })]
          })]
        })]
      }), (0, o.jsx)(i, {
        footer: d.footer
      })]
    })]
  })
}
export {
  d as AboutDetailPage
};