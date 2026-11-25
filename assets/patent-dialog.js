import {patents,patentContribution} from './patents.js';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const dialog=document.createElement('dialog');
dialog.className='patent-dialog';
dialog.setAttribute('aria-labelledby','patent-dialog-title');
dialog.innerHTML=`<header><div><small>MZC / INVENTIONS</small><h2 id="patent-dialog-title">专利与技术积累</h2></div><button type="button" aria-label="关闭专利成果">关闭 ×</button></header><p>${escape(patentContribution)}</p>${patents.map(p=>`<article><span class="patent-status">发明专利 · 已授权</span><h3>${escape(p.title)}</h3><p>${escape(p.number)} · 授权公告日 ${escape(p.date)}</p><p>${escape(p.summary)}</p><a class="patent-document" href="/vision-portfolio/assets/content/${escape(p.file)}" target="_blank" rel="noopener noreferrer" aria-label="查看授权公告 PDF：${escape(p.title)}">查看授权公告 PDF ↗</a></article>`).join('')}<p class="patent-source-note">名称、号码和日期依据授权公告文献；官方原文保留完整发明人名单。</p>`;
document.body.append(dialog);
let trigger,previousOverflow;
function open(target){
 if(dialog.open)return;
 trigger=target;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
 dialog.showModal();dialog.scrollTop=0;
}
dialog.querySelector('button').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;trigger?.focus();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
document.addEventListener('click',event=>{const link=event.target.closest('a[href="#patents"]');if(link){event.preventDefault();open(link);}},true);
window.addEventListener('hashchange',()=>{if(location.hash==='#patents')open();});
if(location.hash==='#patents')open();
