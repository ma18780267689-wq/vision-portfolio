import {m as reactFactory,i as SiteHeader,l as siteData,u as motion} from './index-DApnoxmj.js';
import {projectStories} from './project-stories.js';
import {projectJourneys,diagramStages,railStages,safetyDataCases} from './project-journeys.js';
import {CompactContact} from './home-curated.js';
const React=reactFactory(),h=React.createElement,ease=[.22,.61,.36,1];
const projects=[['aoi','施耐德断路器缺陷检测'],['safety','卷烟厂安全生产视频分析'],['rail','铁路关键部件与螺栓检测'],['weld','手持式焊缝质量检测'],['diagram','单线图智能解析与拓扑重建']];
function useReducedMotion(){
 const [reduced,setReduced]=React.useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);
 React.useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),change=()=>setReduced(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change);},[]);
 return reduced;
}
const reveal=(reduced,delay=0)=>({initial:reduced?false:{opacity:0,y:24,scale:.988,filter:'blur(6px)'},whileInView:{opacity:1,y:0,scale:1,filter:'blur(0px)'},viewport:{once:true,amount:.04},transition:{duration:reduced?0:.68,delay:reduced?0:delay,ease}});

function ReadingTabs({name,items,reduced,onImage,initialIndex=0,processCaption='处理流程示意'}){
 const [selected,setSelected]=React.useState(initialIndex),tabRefs=React.useRef([]),item=items[selected];
 const selectByKey=(event,index)=>{let next;if(event.key==='ArrowRight')next=(index+1)%items.length;if(event.key==='ArrowLeft')next=(index+items.length-1)%items.length;if(event.key==='Home')next=0;if(event.key==='End')next=items.length-1;if(next!==undefined){event.preventDefault();setSelected(next);tabRefs.current[next]?.focus();}};
 return h('div',{className:'case-reading-tabs'},
  h('div',{role:'tablist','aria-label':name,className:'case-tab-list'},...items.map((part,i)=>h('button',{key:part.title,ref:node=>tabRefs.current[i]=node,role:'tab',type:'button',id:`${name}-tab-${i}`,'aria-selected':i===selected,'aria-controls':`${name}-panel`,tabIndex:i===selected?0:-1,onClick:()=>setSelected(i),onKeyDown:event=>selectByKey(event,i)},
   i===selected&&h(motion.span,{className:'case-tab-indicator',layoutId:reduced?undefined:`${name}-indicator`,transition:{type:'spring',stiffness:380,damping:34},'aria-hidden':true}),h('span',null,part.title)))),
  h(motion.div,{key:selected,role:'tabpanel',id:`${name}-panel`,'aria-labelledby':`${name}-tab-${selected}`,className:`case-tab-panel ${item.file?'has-image':'is-process'}`,initial:reduced?false:{opacity:0,y:12,filter:'blur(3px)'},animate:{opacity:1,y:0,filter:'blur(0px)'},transition:{duration:reduced?0:.35,ease}},
   item.file?h('figure',null,h(motion.button,{type:'button',className:'story-image-button','aria-label':'放大：'+item.title+'资料图',whileHover:reduced?undefined:{scale:1.012},whileTap:reduced?undefined:{scale:.99},onClick:event=>onImage(event,{file:item.file,alt:item.title+'资料图',caption:item.caption})},h('img',{src:'/vision-portfolio/assets/content/'+item.file,alt:item.title+'资料图',decoding:'async'}),h('span',null,'查看原图 ↗')),h('figcaption',null,item.caption)):
    h('div',{className:'case-event-process'},h('p',{className:'story-caption'},processCaption),h('ol',null,...item.steps.map((step,i)=>h(motion.li,{key:step,initial:reduced?false:{opacity:0,x:-12},animate:{opacity:1,x:0},transition:{duration:reduced?0:.35,delay:reduced?0:i*.08}},h('span',null,String(i+1).padStart(2,'0')),step)))),
   h('div',{className:'case-tab-copy'},h('p',{className:'story-scope'},'0'+(selected+1)+' / '+name),h('h3',null,item.title),h('p',null,item.body)))
 );
}

function DiagramDemo({demo}){
 const [playing,setPlaying]=React.useState(false);
 return h('figure',{className:'case-operation-demo'},h('h3',null,demo.title),h('img',{src:'/vision-portfolio/assets/content/'+(playing?demo.file:demo.poster),alt:playing?'单线图绘图软件的真实操作动图':'单线图绘图软件真实录屏的静态预览',width:1920,height:1080,loading:'lazy',decoding:'async'}),h('button',{type:'button',className:'contact-button is-primary','aria-pressed':playing,onClick:()=>setPlaying(!playing)},playing?'停止播放':'播放实际操作'),h('figcaption',null,demo.caption));
}

export function ProjectCase({projectKey,language='zh',onLanguageChange=()=>{},onBackHref='#work'}){
 const story=projectStories[projectKey],journey=projectJourneys[projectKey],outline=journey.sections,index=projects.findIndex(([key])=>key===projectKey),title=projects[index][1];
 const reduced=useReducedMotion(),[active,setActive]=React.useState(outline[0][0]),[zoom,setZoom]=React.useState(null);
 const dialog=React.useRef(null),imageTrigger=React.useRef(null);
 React.useEffect(()=>{
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)setActive(entry.target.dataset.section);},{rootMargin:'-18% 0px -55% 0px',threshold:0});
  for(const [id] of outline){const node=document.getElementById(`story-${projectKey}-${id}`);if(node)observer.observe(node);}
  return()=>observer.disconnect();
 },[projectKey,outline]);
 React.useEffect(()=>{if(!zoom)return;const previous=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current.showModal();return()=>{document.body.style.overflow=previous;imageTrigger.current?.focus();};},[zoom]);
 const onImage=(event,item)=>{imageTrigger.current=event.currentTarget;setZoom(item);};
 const go=id=>{setActive(id);document.getElementById(`story-${projectKey}-${id}`)?.scrollIntoView({behavior:reduced?'auto':'smooth'});};
 const images=(items,placement)=>items?.length?h('div',{className:`story-images ${items.length>1?'is-pair':''}`,key:placement},...items.map((item,i)=>h(motion.figure,{key:item.file,...reveal(reduced,i*.06)},
  h(motion.button,{type:'button',className:'story-image-button','aria-label':'放大：'+item.alt,whileHover:reduced?undefined:{y:-5,scale:1.008},whileTap:reduced?undefined:{scale:.99},transition:{duration:.24,ease},onClick:event=>onImage(event,item)},h('img',{src:'/vision-portfolio/assets/content/'+item.file,alt:item.alt,loading:'lazy',decoding:'async'}),h('span',null,'查看原图 ↗')),h('figcaption',null,item.caption)))):null;
 const section=(id,...children)=>{const entry=outline.find(x=>x[0]===id);return h(motion.section,{id:`story-${projectKey}-${id}`,'data-section':id,className:'story-section','aria-labelledby':`story-heading-${id}`,...reveal(reduced)},h('header',{className:'story-section-heading'},h('h2',{id:`story-heading-${id}`},entry[1]),h('p',{className:'diagram-section-deck'},entry[2])),...children);};
 const context=()=>section('context',h('div',{className:'story-prose'},...story.background.map(p=>h('p',{key:p},p))),h('aside',{className:'diagram-role-summary'},h('h3',null,'我的职责'),h('p',null,story.roleSummary)));
 const results=()=>section('results',h('p',{className:'case-section-intro'},projectKey==='diagram'?'完成结构恢复与软件适配后，解析结果进入现场检验流程。我组织质量指标、样本回放与版本验证，分别检查对象识别、位置还原和连接效果。':story.resultIntro),h('div',{className:'case-result-grid'},...story.outcomes.map(([heading,body],i)=>h(motion.article,{key:heading,...reveal(reduced,i*.07),whileHover:reduced?undefined:{y:-5}},h('h3',null,heading),h('p',null,body)))),
  projectKey==='diagram'&&images(story.productImages,'product-application'),projectKey==='diagram'&&h(DiagramDemo,{demo:story.demo}),
  story.metrics&&h('div',{className:'story-metric-block'},h('p',{className:'story-metric-note'},story.metrics.note),h('dl',{className:'story-metrics'},...story.metrics.items.map(([value,label],i)=>h(motion.div,{key:label,...reveal(reduced,i*.05)},h('dt',null,label),h('dd',null,value))))),
  projectKey!=='diagram'&&h('p',{className:'story-collaboration'},'协作分工：'+story.collaboration),h('p',{className:'story-limits'},story.limits));
 let body;
 if(projectKey==='diagram')body=[
  section('context',h('div',{className:'story-prose'},...story.background.map(p=>h('p',{key:p},p))),
   h('div',{className:'diagram-workflow'},h('h3',null,'图纸转换与使用流程'),h('ol',{'aria-label':'图纸转换与使用流程'},...story.workflow.map((step,i)=>h(motion.li,{key:step.title,...reveal(reduced,i*.06)},h('small',null,step.actor),h('strong',null,step.title),h('p',null,step.body),i<story.workflow.length-1&&h('span',{className:'diagram-flow-arrow','aria-hidden':true},'→'))))),
   h('aside',{className:'diagram-role-summary'},h('h3',null,'我的职责'),h('p',null,story.roleSummary))),
  section('challenge',h('div',{className:'story-prose'},h('p',null,story.challenges[0][1]),h('p',null,story.challenges[1][1])),
   h('div',{className:'diagram-gap-comparison'},h('article',null,h('h3',null,'识别结果'),h('p',null,'图上有什么，各自在哪里。')),h('span',{'aria-hidden':true},'→'),h('article',null,h('h3',null,'可编辑结构'),h('p',null,'对象怎样连接，整张管网如何组织。'))),images(story.challengeImages,'disconnected-detection-illustration')),
  section('solution',h('p',{className:'case-section-intro'},story.solutions[0].body),
   h('article',{className:'diagram-contribution'},h('h3',null,story.solutions[1].title),h('p',null,story.solutions[1].body),h(ReadingTabs,{name:'连接恢复示例',items:diagramStages,reduced,onImage})),
   h('article',{className:'diagram-contribution'},h('h3',null,story.solutions[2].title),h('p',null,story.solutions[2].body),images([...story.solutions[2].images,...story.resultImages],'structure-and-editor')),
   h('p',{className:'story-collaboration'},'协作分工：检测模型、OCR及详细协议适配由同事分工，客户端、测试与实施由团队共同完成。')),
  results()
 ];
 if(projectKey==='weld')body=[context(),section('chain',h('p',{className:'case-section-intro'},story.solutions[0].body),images(story.solutions[0].images,'mapping')),section('measurements',h('p',{className:'case-section-intro'},'找到区域后，还要确定相对什么基准测量。以下三个案例分别说明表面缺陷与筒体形变的处理方式。'),h(ReadingTabs,{name:'测量任务',reduced,onImage,items:story.measurements})),results()];
 if(projectKey==='aoi')body=[context(),section('diagnosis',h('p',{className:'case-section-intro'},'十字件与指针的合格要求是：指针位于十字件短边指向的一侧。我对照失败样本追查旧代码，发现它用对象间的距离代替方向关系，无法完整表达这条标准。'),h('div',{className:'case-rule-comparison'},...[[ '原有条件','比较距离','位置变化可能导致误报，方向错误也可能被放过。'],['整改方案','比较向量夹角','分别构建短边与箭头方向向量，通过余弦相似度计算夹角。']].map(([label,heading,copy],i)=>h(motion.article,{key:label,...reveal(reduced,i*.08),whileHover:reduced?undefined:{y:-6,scale:1.008}},h('span',null,label),h('h3',null,heading),h('p',null,copy)))),h('article',{className:'diagram-contribution'},h('h3',null,story.solutions[1].title),h('p',null,story.solutions[1].body),h('div',{className:'case-aoi-evidence'},...story.solutions[1].stages.map((stage,i)=>h(motion.article,{key:stage.title,className:'case-evidence-step',...reveal(reduced,i*.06)},h('h4',null,stage.title),images(stage.images,'cross-key-stage-'+i)))))),section('strategy',h('p',{className:'case-section-intro'},'方向误判是其中一个检测项。面对多型号、多缺陷的系统，其余问题也需要逐项追溯，分别选择处理方式。'),h('p',null,story.solutions[2].body)),results()];
 if(projectKey==='rail')body=[context(),section('pipeline',h('p',{className:'case-section-intro'},'我将任务拆为位置定位、局部特征处理和几何比较。先保证比较的是对应位置的螺栓，再处理影响顶点提取的暗光与油污，最后将关键点转为角度信息。'),h('div',{className:'case-algorithm-flow'},h('h3',null,'螺栓旋转判断流程'),h('ol',null,...['定位并裁出螺栓','增强轮廓与提取关键点','建立对应并比较角度'].map((step,i)=>h('li',{key:step},step,i<2&&h('span',{'aria-hidden':true},'→'))))),h(ReadingTabs,{name:'定位与几何',items:railStages,reduced,onImage})),results()];
 if(projectKey==='safety')body=[context(),section('labels',h('p',{className:'case-section-intro'},story.solutions[1].body),h('div',{className:'case-rule-comparison'},...[[ '原标注','整辆升高车','模型学习整车外观，后方视角与夹包车相似。'],['调整后','升高车工作区域','将标注落到作业部件，为人员站立位置判断提供依据。']].map(([label,heading,copy],i)=>h(motion.article,{key:label,...reveal(reduced,i*.08),whileHover:reduced?undefined:{y:-6}},h('span',null,label),h('h3',null,heading),h('p',null,copy)))),h('p',{className:'story-caption'},'标注对象调整示意，依据项目中的实际处理思路整理。')),section('data',h('p',{className:'case-section-intro'},'这次调整将安全要求落实到了标注对象。其他误报与训练异常，也需要回到样本和数据处理流程，检查缺少了哪些信息。'),h(ReadingTabs,{name:'数据优化',items:safetyDataCases,initialIndex:2,reduced,onImage,processCaption:'数据处理步骤示意'})),results()];
 const next=projects[(index+1)%projects.length];
 return h('div',{className:`project-story-page case-${projectKey}`,'data-motion':reduced?'reduced':'full'},
  h(SiteHeader,{className:'story-site-header',language,navItems:(siteData[language]??siteData.zh).navItems,name:'马志成',onLanguageChange,activeKey:'work'}),
  h('main',{className:'story-main'},h('a',{href:onBackHref,className:'story-back'},'← 返回代表项目'),
   h('header',{className:'case-experience-hero'},h('div',null,h(motion.p,{className:'story-scope',initial:reduced?false:{opacity:0,y:16},animate:{opacity:1,y:0},transition:{duration:reduced?0:.5,ease}},title),h(motion.h1,{initial:reduced?false:{opacity:0,y:24,filter:'blur(6px)'},animate:{opacity:1,y:0,filter:'blur(0px)'},transition:{duration:reduced?0:.72,delay:reduced?0:.05,ease}},journey.headline[0],h('br'),journey.headline[1]),h(motion.p,{className:'story-lead',initial:reduced?false:{opacity:0,y:18},animate:{opacity:1,y:0},transition:{duration:reduced?0:.6,delay:reduced?0:.14,ease}},story.lead)),
    h(motion.figure,{className:'case-hero-cover',initial:reduced?false:{opacity:0,y:28,scale:.975,filter:'blur(6px)'},animate:{opacity:1,y:0,scale:1,filter:'blur(0px)'},transition:{duration:reduced?0:.78,delay:reduced?0:.1,ease}},h('button',{type:'button',className:'case-hero-cover-button','aria-label':'放大：'+title+'项目封面',onClick:event=>onImage(event,{file:journey.cover,alt:title+'项目封面',caption:journey.coverCaption})},h('img',{src:'/vision-portfolio/assets/content/'+journey.cover,alt:title+'项目封面',width:1600,height:900})),h('figcaption',null,journey.coverCaption)),story.highlights&&h(motion.section,{className:'case-key-metrics','aria-label':story.highlights.heading,...reveal(reduced)},h('h2',null,story.highlights.heading),h('dl',null,...story.highlights.items.map(item=>h('div',{key:item.label},h('dt',null,item.label),h('dd',null,h('strong',{className:'case-metric-number'},item.prefix&&h('span',{className:'case-metric-prefix'},item.prefix),item.value,h('span',{className:'case-metric-unit'},item.unit)),h('span',{className:'case-metric-detail'},item.detail))))),h('p',{className:'case-metric-scope'},story.highlights.note)),h('dl',{className:'case-overview'+(story.highlights?' has-metrics':''),'aria-label':'项目速览'},!story.highlights&&h('div',{className:'case-overview-result'},h('dt',null,'已达成的效果'),h('dd',null,h('strong',null,story.overview.result),h('span',null,story.overview.resultNote))),...[["purpose","项目用途"],["challenge","关键难点"]].map(([key,label])=>h('div',{key},h('dt',null,label),h('dd',null,story.overview[key]))))),
   h('nav',{className:'story-outline','aria-label':'项目阅读目录'},...outline.map(([id,label])=>h('button',{key:id,type:'button','aria-current':active===id?'location':undefined,onClick:()=>go(id)},active===id&&h(motion.span,{className:'case-nav-indicator',layoutId:reduced?undefined:`case-${projectKey}-nav`,transition:{type:'spring',stiffness:380,damping:34},'aria-hidden':true}),h('span',null,label)))),
   ...body,h('nav',{className:'story-end-nav','aria-label':'继续阅读'},h('a',{href:'#work'},'← 所有代表项目'),h('a',{href:'#case-study-'+next[0]},'下一个：'+next[1]+' →')),h(CompactContact,{react:React})),
  h('footer',{className:'story-footer'},h('span',null,'马志成 · 计算机视觉算法工程师')),
  h('dialog',{ref:dialog,className:'story-lightbox','aria-label':'项目原图',onClose:()=>setZoom(null),onClick:event=>{if(event.target===event.currentTarget)dialog.current.close();}},zoom&&h(motion.div,{initial:reduced?false:{opacity:0,scale:.975,y:12},animate:{opacity:1,scale:1,y:0},transition:{duration:reduced?0:.28,ease}},h('button',{type:'button',className:'story-lightbox-close',onClick:()=>dialog.current.close(),autoFocus:true},'关闭 ×'),h('img',{src:'/vision-portfolio/assets/content/'+zoom.file,alt:zoom.alt}),h('p',null,zoom.caption)))
 );
}
