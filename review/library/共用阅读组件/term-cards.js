/* Shared offline reader. Domain dictionaries load before this deferred script. */
(() => {
  const terms = Object.assign({}, ...(window.kbTermSets || []));
  if (!Object.keys(terms).length) return;
  const panel = document.createElement('div'), title = document.createElement('strong'),
    body = document.createElement('span'), img = document.createElement('img'), link = document.createElement('a');
  panel.id = 'yolo-term-card'; panel.className = 'term-card'; panel.hidden = true;
  img.alt = ''; // The definition describes the main relation; full SVGs carry titles and descriptions.
  link.className = 'term-open-image'; link.textContent = '单独查看大图 ↗'; link.target = '_blank'; link.rel = 'noopener';
  panel.append(title,body); document.body.append(panel);
  document.documentElement.classList.add('has-term-cards');
  let active = null, pinned = false, timer;
  function close() {
    clearTimeout(timer);
    if (active) {active.setAttribute('aria-expanded','false');active.removeAttribute('aria-describedby')}
    active=null; pinned=false; panel.hidden=true;
  }
  function place() {
    if (!active) return;
    const r=active.getBoundingClientRect(), w=panel.offsetWidth, h=panel.offsetHeight;
    if (!active.isConnected || !r.width || r.bottom<0 || r.top>innerHeight) return close();
    const below=innerHeight-r.bottom;
    const y=below>=h+12 || below>=r.top ? r.bottom+5 : r.top-h-5;
    panel.style.top=Math.max(8,Math.min(y,innerHeight-h-8))+'px';
    panel.style.left=Math.max(8,Math.min(r.left,innerWidth-w-8))+'px';
  }
  function open(b,pin=false) {
    clearTimeout(timer);
    if (pinned && !pin && active!==b) return;
    if (active!==b) {
      close(); active=b;
      const t=terms[b.dataset.term]; title.textContent=t.title; body.textContent=t.body;
      if (t.image) {img.src=t.image;link.href=t.image;panel.append(img,link)}
      else {img.remove();link.remove()}
    }
    pinned ||= pin; link.hidden=!pinned;
    panel.setAttribute('role',pinned?'region':'tooltip');
    if(pinned) panel.setAttribute('aria-label',title.textContent); else panel.removeAttribute('aria-label');
    panel.hidden=false;b.setAttribute('aria-expanded','true');b.setAttribute('aria-describedby',panel.id);place();
  }
  function leave(){if (!pinned) {clearTimeout(timer);timer=setTimeout(close,220)}}
  function keyButton(id,label) {
    const b=document.createElement('button');b.type='button';b.className='term-key';
    b.dataset.term=id;b.textContent=label;b.setAttribute('aria-controls',panel.id);b.setAttribute('aria-expanded','false');
    b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')open(b)});
    b.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')leave()});
    b.addEventListener('focus',()=>{if(b.matches(':focus-visible'))open(b)});
    b.addEventListener('blur',e=>{if(active===b && !panel.contains(e.relatedTarget)){if(pinned && e.relatedTarget)close();else leave()}});
    b.addEventListener('click',()=>{if(active===b && pinned)close();else open(b,true)});
    b.addEventListener('keydown',e=>{
      if(e.key==='Tab' && !e.shiftKey && pinned && active===b && link.isConnected) {e.preventDefault();link.focus()}
    });
    return b;
  }
  link.addEventListener('keydown',e=>{
    if(e.key==='Tab' && active){const b=active;b.focus({preventScroll:true});if(e.shiftKey)e.preventDefault();close()}
  });
  panel.addEventListener('pointerenter',()=>clearTimeout(timer));panel.addEventListener('pointerleave',leave);
  img.addEventListener('load',place);
  document.addEventListener('pointerdown',e=>{if(active && !active.contains(e.target) && !panel.contains(e.target))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape' && active){if(panel.contains(document.activeElement))active.focus({preventScroll:true});close()}});
  window.addEventListener('resize',place);window.addEventListener('scroll',place,{capture:true,passive:true});

  // Match whole technical names. Longer aliases win (e.g. NMS-free before NMS and C3k2 before C3).
  const aliases=new Map();
  for (const [id,t] of Object.entries(terms)) for (const alias of t.aliases) aliases.set(alias.toLowerCase(),id);
  const escape=s=>s.replace(/[.*+?^$(){}|[\]\\]/g,'\\$&');
  const pattern=[...aliases.keys()].sort((a,b)=>b.length-a.length).map(s=>
    (/^[a-z0-9_]/i.test(s)?'(?<![a-z0-9_])':'')+escape(s)+(/[a-z0-9_]$/i.test(s)?'(?![a-z0-9_])':'')).join('|');
  const re=new RegExp(pattern,'gi');
  // In article prose every occurrence is useful, including adjacent synonyms. Native controls,
  // navigational links, formulas and live announcements must keep their original semantics.
  const excluded='a,button,input,select,textarea,label,summary,nav,aside,.mobile-toc,.toc,.term-help,.term-card,code,pre,svg,math,script,style,template,noscript,output,[contenteditable="true"],[role="button"],[aria-live],.formula,.math-formula,.equation,.branch-equation,.mode-equation,.count-formula,.eyebrow,.chapter-number';
  const roots=[...document.querySelectorAll('main,.hero,.intro,.topic-hero')].filter(el=>!el.parentElement.closest('main,.hero,.intro,.topic-hero'));
  function annotateText(node) {
    const el=node.parentElement;
    if(!el || !node.isConnected || !node.data.trim() || el.closest(excluded))return;
    const explicit=el.closest('span[data-term]');
    if(explicit && terms[explicit.dataset.term]){
      explicit.replaceWith(keyButton(explicit.dataset.term,explicit.textContent));return;
    }
    const value=node.data;
    let end=0,frag=null;
    re.lastIndex=0;
    for(let m;(m=re.exec(value));){
      frag ||= document.createDocumentFragment();
      frag.append(value.slice(end,m.index),keyButton(aliases.get(m[0].toLowerCase()),m[0]));
      end=m.index+m[0].length;
    }
    if(frag){frag.append(value.slice(end));node.replaceWith(frag)}
  }
  function annotate(root) {
    if(root.nodeType===Node.TEXT_NODE){annotateText(root);return}
    if(root.nodeType!==Node.ELEMENT_NODE || root.closest(excluded))return;
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    for(const node of nodes)annotateText(node);
  }
  function start() {
    for(const root of roots)annotate(root);
    // Observe prose replaced by an example or a comparison. Scan only changed nodes,
    // and disconnect while wrapping them so our own buttons never schedule a second pass.
    const observe=()=>{for(const root of roots)observer.observe(root,{subtree:true,childList:true,characterData:true})};
    const observer=new MutationObserver(records=>{
      observer.disconnect();
      if(active && !active.isConnected)close();
      for(const rec of records){
        if(rec.type==='characterData')annotateText(rec.target);
        else for(const node of rec.addedNodes)if(node.isConnected)annotate(node);
      }
      observe();
    });
    observe();
    if(!document.querySelector('.term-help')){
      const term=document.querySelector('main .term-key,.hero .term-key');
      const home=(term && term.closest('section,.hero,.topic-hero')) || roots[0];
      const near=home?.querySelector('h1,h2');
      if(near){const hint=document.createElement('p');hint.className='term-help';hint.textContent='带点线的词可悬停看释义，点按可固定；有配图时可单独查看大图。';near.after(hint)}
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
