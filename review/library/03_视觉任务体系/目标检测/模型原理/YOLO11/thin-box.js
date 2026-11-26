(() => {
  const slider=document.getElementById('shift');
  const draw=()=>{
    const d=Number(slider.value);
    document.getElementById('delta').textContent=String(d);
    document.getElementById('horizontal').setAttribute('x',15+d);
    document.getElementById('vertical').setAttribute('y',24+d);
    const iou=(side)=>(side-d)/(side+d);
    document.getElementById('overlaps').textContent='横向 IoU：'+iou(80).toFixed(3)+'　｜　纵向 IoU：'+iou(8).toFixed(3);
  };
  slider.addEventListener('input',draw); slider.disabled=false; draw();
})();
