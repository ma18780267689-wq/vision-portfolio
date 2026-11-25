(() => {
  function mount(){
    if(document.querySelector('.kb-return'))return;
    const link=document.createElement('a');link.className='kb-return';link.href='/vision-portfolio/#fun-projects';link.textContent='← 返回个人站 · 独立实践';document.body.append(link);
  }
  mount();
  if(window.document$?.subscribe)window.document$.subscribe(mount);
})();
