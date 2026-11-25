// Bibliographic details come from the supplied grant publications.
// The contribution statement comes from the author's own confirmation.
export const patentContribution='专利成果源于公司与特检院的合作项目，发明人署名依据项目合作安排确定。技术方案研发、算法实现及专利技术文稿撰写均由本人完成。';
export const patents=[
 {title:'一种基于图像识别的拓扑图结构信息处理系统',number:'CN119741726B',application:'202510242804.0',date:'2025.05.13',summary:'从图像识别结果恢复对象与连接关系，形成可继续编辑和使用的拓扑结构。',file:'CN119741726B.pdf',preview:'patent-CN119741726B.png'},
 {title:'一种面向Cocos引擎的管线环感知线性化分解方法',number:'CN121330149B',application:'202511881918.6',date:'2026.03.06',summary:'处理包含嵌套环的复杂管线拓扑，将其转换为Cocos引擎可使用的线性绘图序列。',file:'CN121330149B.pdf',preview:'patent-CN121330149B.png'},
 {title:'一种面向特检行业的压力管道单线图迭代回溯分解方法',number:'CN121685751B',application:'202610179755.5',date:'2026.05.15',summary:'通过迭代回溯组织管网分解，将压力管道拓扑转换为满足图形引擎要求的线性数据。',file:'CN121685751B.pdf',preview:'patent-CN121685751B.png'}
];

export function PatentAchievements({jsx,motion,reveal}){
 const {jsx:h,jsxs:hs}=jsx;
 const animation=window.matchMedia('(prefers-reduced-motion: reduce)').matches?{initial:false}:reveal;
 return hs(motion.section,{id:'about-me-patents',className:'about-detail-section is-plain patent-achievements','aria-labelledby':'patent-achievements-title',...animation,children:[
  hs('header',{className:'about-detail-section-head',children:[h('p',{className:'about-detail-section-kicker',children:'技术成果'}),h('h2',{id:'patent-achievements-title',className:'about-detail-display-title',children:'发明专利'}),h('p',{className:'about-detail-section-copy',children:patentContribution})]}),
  h('div',{className:'patent-grid',children:patents.map(p=>hs('article',{className:'patent-card',children:[
   h('a',{className:'patent-preview',href:'/vision-portfolio/assets/content/'+p.file,target:'_blank',rel:'noopener noreferrer','aria-label':'查看授权公告原文：'+p.title,children:h('img',{src:'/vision-portfolio/assets/content/'+p.preview,alt:p.title+'授权公告首页',loading:'lazy',width:849,height:1200})}),
   hs('div',{className:'patent-card-copy',children:[h('span',{className:'patent-status',children:'发明专利 · 已授权'}),h('h3',{children:p.title}),h('p',{className:'patent-number',children:p.number}),h('p',{className:'patent-date',children:'授权公告日 '+p.date}),h('p',{className:'patent-summary',children:p.summary}),h('a',{className:'patent-document',href:'/vision-portfolio/assets/content/'+p.file,target:'_blank',rel:'noopener noreferrer','aria-label':'查看授权公告 PDF：'+p.title,children:'查看授权公告 PDF ↗'})]})
  ]},p.number))}),
  h('p',{className:'patent-source-note',children:'名称、号码和日期依据授权公告文献；官方原文保留完整发明人名单。'})
 ]});
}
