import {contact as publicContact,openContact} from './contact.js';
// Homepage selections share the same factual content as the full project and notes pages.
export function CuratedHome({react:React,data}) {
 const h=React.createElement,[selection,setSelection]=React.useState(null),dialog=React.useRef(null);
 const trigger=React.useRef(null);
 React.useEffect(()=>{
  if(!selection)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  dialog.current.showModal();
  return()=>{document.body.style.overflow=previous;trigger.current?.focus();};
 },[selection]);
 const open=(event,item,kind)=>{trigger.current=event.currentTarget;setSelection({item,kind});};
 const close=()=>dialog.current.close();
 const item=selection?.item;
 return h(React.Fragment,null,
  h('div',{className:'curated-home',id:'fun'},
   data.showThoughts!==false&&h('section',{className:'curated-section',id:'selected-thoughts','aria-labelledby':'selected-thoughts-title'},
    h('header',{className:'curated-heading'},h('h2',{id:'selected-thoughts-title'},data.thoughtsTitle),h('p',null,data.thoughtsIntro)),
    h('div',{className:'thoughts-grid'},...data.writingCard.items.map((note,index)=>h('button',{type:'button',className:'thought-card',key:note.id,onClick:event=>open(event,note,'note')},
     h('span',{className:'curated-eyebrow'},'0'+(index+1)+' / '+note.subtitle),h('h3',null,note.title),
     h('p',null,note.sections[1].body),h('span',{className:'curated-card-action'},'阅读思考 →'))))
   ),
   h('section',{className:'curated-section',id:'fun-projects','aria-labelledby':'selected-practice-title'},
    h('header',{className:'curated-heading'},h('h2',{id:'selected-practice-title'},data.title),h('p',null,data.introLines[0])),
    h('div',{className:'practice-grid'},...data.projectCard.items.map(project=>h('article',{className:'practice-card',key:project.id},
     project.previewSrc?(project.href?h('a',{href:project.href,className:'practice-preview-link','aria-label':'打开 '+project.name},h('img',{className:'practice-preview',src:project.previewSrc,alt:project.previewAlt??project.name+'项目预览',width:1280,height:720,loading:'lazy'})):h('figure',{className:'practice-preview-figure'},h('img',{className:'practice-preview',src:project.previewSrc,alt:project.previewAlt,loading:'lazy'}),h('figcaption',null,'主题配图 · 非运行界面'))):
      h('div',{className:'practice-concept','aria-label':'Unravel 设计方向示意，非运行界面'},h('span',{className:'practice-wordmark'},'Unravel'),h('div',{className:'practice-stages'},h('span',null,'理解目标'),h('span',{'aria-hidden':true},'→'),h('span',null,'组织阶段'),h('span',{'aria-hidden':true},'→'),h('span',null,'检查产物')),h('small',null,'设计方向示意 · 演示待补')),
     h('div',{className:'practice-copy'},h('span',{className:'curated-eyebrow'},project.status),h('h3',null,project.name),h('p',null,project.modalIntro),
      project.href?h('a',{className:'curated-text-action',href:project.href},project.action):h('button',{type:'button',className:'curated-text-action',onClick:event=>open(event,project,'project')},project.action)))))
   )
  ),
  h('dialog',{ref:dialog,className:'curated-dialog','aria-labelledby':'curated-dialog-title',onClose:()=>setSelection(null),onClick:event=>{if(event.target===event.currentTarget)close();}},
   h('button',{type:'button',className:'curated-dialog-close',onClick:close,autoFocus:true,'aria-label':'关闭内容'},'关闭 ×'),
   item&&h('div',{className:'curated-dialog-content'},h('p',{className:'curated-eyebrow'},selection.kind==='note'?item.meta:item.status),h('h2',{id:'curated-dialog-title'},item.title??item.name),h('p',{className:'curated-dialog-intro'},item.subtitle??item.modalIntro),
    ...(item.sections??item.modalSections).map(part=>h('section',{key:part.heading},h('h3',null,part.heading),h('p',null,part.body))),
    item.relatedHref&&h('a',{className:'curated-text-action',href:item.relatedHref,onClick:close},'查看相关项目：'+item.relatedLabel+' →')))
 );
}

export function CompactContact({react:React,contact=publicContact}) {
 const h=React.createElement;
 return h('section',{id:'contact',className:'compact-contact','aria-labelledby':'compact-contact-title'},
  h('div',null,h('h2',{id:'compact-contact-title'},'从一个具体问题开始聊聊。'),h('p',null,'如果你的团队正在解决工业视觉或图纸解析中的实际问题，欢迎进一步交流。')),
  h('div',{className:'compact-contact-actions'},
   h('a',{href:contact.resumeHref,target:'_blank',rel:'noreferrer',className:'contact-button is-primary'},'查看简历 ↗'),
   h('button',{type:'button',className:'contact-button',onClick:event=>openContact(event.currentTarget)},'邮箱与微信'))
 );
}
