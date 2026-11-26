/* Teaching data and drawings: not outputs from a trained model. No external dependencies. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const candidates = [
    {id:'A', score:.94, stride:8, box:[150,175,290,315]},
    {id:'B', score:.87, stride:8, box:[158,180,298,320]},
    {id:'C', score:.79, stride:16, box:[145,168,295,318]},
    {id:'D', score:.82, stride:8, box:[418,398,464,444]},
    {id:'E', score:.18, stride:32, box:[78,430,134,486]}
  ];
  const infer = [
    {label:'输入图像', title:'先把图像交给同一个检测网络', core:'输入是一张完整图像。预处理把它变成网络接受的张量，目标的类别与位置仍然未知。', detail:[['这一步做什么','常见流程包括尺寸调整、必要的填充、通道与数值处理。本例固定为 640 × 640。'],['交给下一步什么','带有空间结构的像素张量；还不是目标列表，也没有按小、中、大目标切开图片。']], boundary:'“一次看完整图像”不表示整个模型只有一层，也不表示后续不能做多尺度预测。', visual:'输入：两颗不同大小的螺丝', caption:'大、小螺丝只是为了说明尺度差异；模型还不知道这里有两个目标。', kind:'input'},
    {label:'提取特征',title:'Backbone：把像素变成可用于判断的特征',core:'目标的类别和位置不能直接从像素数值中读出。主干网络通过可学习的变换，形成不同层级的特征。',detail:[['为什么分层','通常越往后空间分辨率越低、感受野越大；较高分辨率保留更多空间细节，较深特征往往具备更强的语义表达。'],['交给下一步什么','多个层级的特征张量。本例用 stride 8 / 16 / 32，示意 80 × 80、40 × 40、20 × 20 的特征图。每层还有多个通道。']],boundary:'特征图不是把原图简单缩小。这里的纹理只是层级与空间分辨率示意，不是卷积的真实激活。',visual:'同一张图 → 多个层级的特征',caption:'图中网格已稀疏绘制，标出的 80 / 40 / 20 才是示例特征尺寸。未绘出通道维度。',kind:'backbone'},
    {label:'融合特征',title:'Neck：让细节与语义相互补充',core:'单看高分辨率特征，可能缺少足够的语义信息；只看较低分辨率特征，又可能损失小目标细节。特征融合把不同层级的信息组织到一起。',detail:[['为什么还需要这一环','FPN 式路径向高分辨率特征传递深层信息；PAN 式路径再聚合不同层级的特征。具体连接方式随模型变化。'],['交给下一步什么','融合后的多尺度特征。本例仍在三个尺度预测，并不是融合成一张图后只预测一次。']],boundary:'高分辨率层通常更有利于小目标，但“小、中、大目标各自只能由某一层检测”不是严格规则。',visual:'跨层融合，而不是三次独立看原图',caption:'箭头示意跨层信息传递。实际模型还需上、下采样和通道变换，不是直接相加不同尺寸的张量。',kind:'neck'},
    {label:'产生预测',title:'Head：在很多位置，分别提出目标预测',core:'检测头把特征变成具体的预测信息。以 YOLOX 为例，每个预测位置输出框参数、objectness 和类别分数。',detail:[['预测机会来自哪里','三层共有 80² + 40² + 20² = 8,400 个空间位置。YOLOX 式每个位置一组预测；并不是只在已经知道有目标的位置预测。'],['为什么会出现 A、B、C','相邻位置可能预测到同一颗螺丝，不同层也可能覆盖它。A、B 在同一层，C 在另一层；多尺度不是重复预测的唯一来源。']],boundary:'解耦头区分分类与定位的预测分支；Anchor-free 去掉预设宽高的先验框。两者都不直接保证一物一框。',visual:'密集预测：先有预测位置，再判断目标',caption:'只抽出五个位置作为 A–E。此时输出仍是预测参数与分数，尚未画成原图坐标下的检测框。',kind:'head'},
    {label:'坐标解码',title:'把检测头的预测，转换成图像里的框',core:'检测头输出的框参数需要按该模型的定义解码。解码建立预测张量与输入图像坐标之间的对应关系。',detail:[['以 YOLOX 为例','用网格位置、步长和预测偏移恢复框中心，用预测的尺度参数与步长恢复宽高。分类与 objectness 共同参与检测分数计算。'],['此时得到了什么','一批具有坐标、类别和分数的候选框。图上 A、B、C 指向同一颗大螺丝，D 指向小螺丝，E 是背景上的低分误检。']],boundary:'“解码”不负责判定重复目标；不同版本可采用 Anchor 偏移、边距或分布回归等表达，不能混用解码公式。',visual:'解码后：候选框并不等于最终目标',caption:'A / B / C 是同一真实目标的重复预测，D 是另一目标；E 演示背景误检。框均为假设数据。',kind:'decode'},
    {label:'筛选去重',title:'过滤低分，再抑制重复预测',core:'分数阈值先过滤不够可信的预测，NMS 再按分数与重叠程度抑制重复框，得到需要交付的检测结果。',detail:[['为什么还需要 NMS','这类模型训练出的高分预测可能包含重复目标，不能把每个高分框都直接计为一个真实物体。'],['怎样回到原始图像','若预处理做过缩放和填充，最终框还需要映射回原始图像。这里输入与展示同坐标，省略这一步计算。']],boundary:'NMS-free 要改变训练与输出的组织方式。它不是在同一个旧模型上取消这一步，也不表示推理完全没有解码、分数阈值或 Top-k 选择。',visual:'当前阈值下的最终保留框',caption:'向下调整阈值，可看到真正执行的过滤与 NMS 结果。被抑制框用虚线淡显，保留框用实线标出。',kind:'final'}
  ];
  const train = [
    {label:'前向预测',title:'训练也先运行同一个预测网络',core:'训练图像经过 Backbone、Neck 和 Head，得到预测。额外提供的标注告诉系统：真实目标是什么、位于哪里。',detail:[['比推理多了什么','本例的真实标注包含两颗螺丝的类别和边界框。标注只在训练或评估时提供；部署推理不需要人先框出目标。'],['下一步的问题','模型有很多预测位置，标注却只有两个目标。必须确定哪些预测应该负责学习哪个目标。']],boundary:'橙色虚线是真实标注，绿色框是网络预测。标注不是经过 Backbone 生成的。',visual:'预测 + 独立提供的真实标注',caption:'实线为假设预测；橙色虚线为标注。真实标注单独进入监督路径。',kind:'training-forward'},
    {label:'标签分配',title:'先确定“谁负责学这个目标”',core:'标签分配建立真实目标与预测之间的监督对应关系。一对多分配可以让多个预测学习同一个目标。',detail:[['本图怎样示意','A、B、C 被示意为大螺丝的正样本，D 为小螺丝的正样本，E 对应背景。这只是职责示意，不复现 SimOTA 的候选筛选与动态匹配计算。'],['为什么与 NMS 有关','多个预测都被训练为同一目标的正样本，可能共同得到较高分数。这种监督本身没有要求最终仅一个预测胜出。']],boundary:'“每个位置预测几个框”和“一个真实目标分配几个正样本”是两回事。Anchor-free 也可以使用一对多标签分配。',visual:'真实目标 → 多个负责学习的预测',caption:'连接线表示监督对应关系，不表示推理时已经知道真实目标。分配发生在训练阶段。',kind:'assignment'},
    {label:'计算损失',title:'用损失说明：预测错在哪里',core:'分配确定了监督对应关系，损失函数再衡量分类、位置等预测与目标之间的差异。损失提供优化信号。',detail:[['为什么先分配再算相应监督','先知道某个预测负责哪个目标，才有对应的类别与框回归目标。以 YOLOX 为例，损失涉及分类、objectness 与定位；具体监督范围与权重有各自定义。'],['优化目标不是 NMS','常规训练不把贪心 NMS 当作标签分配，也不靠它给网络决定正样本。训练损失与推理后处理承担不同职责。']],boundary:'图中损失没有数值：未执行真实网络、损失函数或反向传播。不能从这个演示得出收敛或精度结论。',visual:'预测与监督目标 → 损失',caption:'用三个损失职责说明优化方向，不模拟其数值或各项权重。',kind:'loss'},
    {label:'更新参数',title:'通过梯度，改变下一次怎样预测',core:'反向传播计算可训练参数的梯度，优化器据此更新网络。重复这个过程，网络逐步形成更合适的特征与预测。',detail:[['改变的是哪里','改变 Backbone、Neck、Head 中参与训练的参数，而不是手工把某一个框拖到标注位置。之后的新图像也使用这些参数进行预测。'],['训练结束后留下什么','保留训练得到的模型参数与推理所需结构。标签、分配计算和训练损失通常不在部署推理路径中。']],boundary:'这条监督路径解释了为什么结构、分配和损失需要一起看。只改后处理，不能自动获得另一个训练目标对应的模型。',visual:'监督信号回到可训练网络',caption:'回传箭头只说明梯度作用方向，未绘制完整计算图。推理时不走标注、损失和参数更新路径。',kind:'update'}
  ];
  let mode = 'infer';
  let step = 0;
  function iou(a,b){
    const intersection=Math.max(0,Math.min(a[2],b[2])-Math.max(a[0],b[0]))*Math.max(0,Math.min(a[3],b[3])-Math.max(a[1],b[1]));
    return intersection/((a[2]-a[0])*(a[3]-a[1])+(b[2]-b[0])*(b[3]-b[1])-intersection);
  }
  function processCandidates(){
    const threshold=Number($('confidence').value), overlap=Number($('overlap').value), nms=$('use-nms').checked;
    const status=new Map();
    const kept=[];
    for(const c of [...candidates].sort((a,b)=>b.score-a.score)){
      if(c.score<threshold){status.set(c.id,{kind:'filtered',text:'低于分数阈值'});continue;}
      const suppressor=nms&&kept.find(k=>iou(c.box,k.box)>overlap);
      if(suppressor){status.set(c.id,{kind:'suppressed',text:`被 ${suppressor.id} 抑制`});continue;}
      kept.push(c);status.set(c.id,{kind:'kept',text:'保留'});
    }
    return {status,kept};
  }
  const text=(x,y,value,size=20,fill='var(--ink)',extra='')=>`<text class="scene-text" x="${x}" y="${y}" font-size="${size}" style="fill:${fill}" ${extra}>${value}</text>`;
  function defs(){return `<defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9ded6"/><stop offset=".5" stop-color="#89978c"/><stop offset="1" stop-color="#bdc8bb"/></linearGradient><pattern id="board-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#d9ddd2" stroke-width="1"/></pattern><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="var(--accent)"/></marker><marker id="warm-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="var(--warm)"/></marker></defs>`;}
  function screw(cx,cy,r){return `<g transform="translate(${cx} ${cy})"><circle r="${r}" fill="url(#metal)" stroke="#63766a" stroke-width="3"/><circle r="${r*.77}" fill="none" stroke="#dfe5d9" stroke-width="3"/><path d="M${-r*.42} 0H${r*.42}M0 ${-r*.42}V${r*.42}" stroke="#526457" stroke-width="${Math.max(4,r*.16)}"/></g>`;}
  function board(){return `<rect x="36" y="45" width="568" height="550" rx="20" fill="#f5f4e9" stroke="#c3cdbf"/><rect x="50" y="60" width="540" height="520" fill="url(#board-grid)"/><path d="M70 140H340V310H550M90 530H355V370H555" stroke="#bccbb6" stroke-width="10" fill="none"/><rect x="88" y="438" width="39" height="36" rx="3" fill="#c4b698"/>${screw(220,245,60)}${screw(441,421,20)}`;}
  function grid(x,y,size,n){let paths='';for(let j=1;j<n;j++){let o=size*j/n;paths+=`M${x+o} ${y}V${y+size}M${x} ${y+o}H${x+size}`;}return `<path d="${paths}" stroke="#a7bda3" stroke-width="1" fill="none"/>`;}
  function featureMaps(fused=false){
    const levels=[{x:72,y:85,s:212,n:10,label:'80 × 80',stride:8},{x:320,y:250,s:155,n:7,label:'40 × 40',stride:16},{x:460,y:432,s:104,n:5,label:'20 × 20',stride:32}];
    let out='';
    for(const [index,l] of levels.entries()){
      out+=`<rect x="${l.x+9}" y="${l.y-9}" width="${l.s}" height="${l.s}" rx="4" fill="#cad8c3"/><rect x="${l.x}" y="${l.y}" width="${l.s}" height="${l.s}" rx="4" fill="#e0e9d8" stroke="#75956e"/>${grid(l.x,l.y,l.s,l.n)}<circle cx="${l.x+l.s*.36}" cy="${l.y+l.s*.4}" r="${l.s*.16}" fill="#6f9265" opacity=".65"/><circle cx="${l.x+l.s*.72}" cy="${l.y+l.s*.77}" r="${Math.max(5,l.s*.05)}" fill="#6f9265" opacity=".65"/>${text(l.x,l.y+l.s+31,l.label,21)}${text(l.x,l.y+l.s+55,'stride '+l.stride,16)}`;
      if(index<2){const t=levels[index+1];out+=`<path d="M${l.x+l.s+20} ${l.y+l.s/2}H${t.x+t.s/2}V${t.y-25}" fill="none" stroke="var(--accent)" stroke-width="3" marker-end="url(#arrow)"/>`;}
    }
    if(fused)out+=`<path d="M460 484H300V210H195" fill="none" stroke="var(--warm)" stroke-width="4" marker-end="url(#warm-arrow)"/>${text(48,625,'跨层信息传递；尺寸由上 / 下采样对齐',17)}`;
    else out+=text(48,625,'空间尺寸在变，通道维度在图中省略',17);
    return out;
  }
  function boxes(status=null){return candidates.map(c=>{
    const s=status?.get(c.id)?.kind||'candidate';
    if(s==='filtered')return '';
    const [x,y,r,b]=c.box;const dashed=s==='suppressed';
    const offsets={A:[-4,-14],B:[100,25],C:[-5,176],D:[0,-13],E:[0,-13]};
    return `<g class="svg-box ${dashed?'suppressed':''}" data-candidate="${c.id}"><rect x="${x}" y="${y}" width="${r-x}" height="${b-y}" fill="none" stroke="${dashed?'var(--warm)':'var(--accent)'}" stroke-width="${s==='kept'?3:2}" ${dashed?'stroke-dasharray="6 5"':''}/>${text(x+offsets[c.id][0],y+offsets[c.id][1],c.id+' '+c.score.toFixed(2),20)}</g>`;
  }).join('');}
  function gt(){return `<rect x="153" y="178" width="134" height="134" fill="none" stroke="var(--warm)" stroke-width="3" stroke-dasharray="9 6"/><rect x="416" y="396" width="50" height="50" fill="none" stroke="var(--warm)" stroke-width="3" stroke-dasharray="9 6"/>${text(355,78,'橙虚线：真实标注',18)}`;}
  function headDrawing(){
    const points={A:[208,240,345,194],B:[224,256,380,258],C:[240,272,345,326],D:[440,424,500,458],E:[96,448,150,500]};
    return board()+`<g opacity=".45">${grid(36,45,550,16)}</g>`+candidates.map(c=>{
      const [x,y,lx,ly]=points[c.id];
      return `<path d="M${x} ${y}L${lx-12} ${ly-9}" fill="none" stroke="var(--accent)" stroke-width="2"/><circle cx="${x}" cy="${y}" r="7" fill="var(--accent)"/><rect x="${lx-6}" y="${ly-28}" width="38" height="38" rx="5" fill="#fffef9"/>${text(lx+13,ly,c.id,27,'var(--accent)','text-anchor="middle"')}`;
    }).join('')+`<rect x="55" y="72" width="500" height="76" rx="7" fill="#fffef9" stroke="#c3cdbf"/>${text(70,103,'每个位置：框参数 + objectness + 类别',19)}${text(70,132,'先得到预测张量，不是已经去重的目标集合',16)}`;
  }
  function assignmentDrawing(){return board()+gt()+candidates.slice(0,4).map((c,i)=>{
    const bx=c.id==='D'?441:220,by=c.id==='D'?421:245;
    const px=c.id==='D'?485:335,py=c.id==='D'?480:205+i*50;
    return `<path d="M${bx} ${by}L${px} ${py}" stroke="var(--warm)" stroke-width="2" marker-end="url(#warm-arrow)"/><circle cx="${px}" cy="${py}" r="18" fill="var(--accent)"/>${text(px,py+7,c.id,19,'var(--surface)','text-anchor="middle"')}`;
  }).join('')+text(65,553,'一个真实目标，可监督多个预测位置',20);}
  function block(x,y,w,h,title,sub){return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#e0e9d8" stroke="#a2b59b"/>${text(x+w/2,y+35,title,23,'var(--ink)','text-anchor="middle"')}${sub?text(x+w/2,y+66,sub,16,'var(--muted)','text-anchor="middle"'):''}`;}
  function lossDrawing(){return block(65,70,220,90,'预测','分类 / 框 / objectness')+block(355,70,220,90,'监督目标','由标注与分配得到')+`<path d="M465 170V220H320" stroke="var(--accent)" stroke-width="3" fill="none"/><path d="M175 170V220H320V265" stroke="var(--accent)" stroke-width="3" fill="none" marker-end="url(#arrow)"/>`+block(120,280,400,95,'损失：衡量差异','正样本与背景监督的范围各有定义')+text(320,448,'分类：目标属于哪一类',21,'var(--ink)','text-anchor="middle"')+text(320,491,'定位：框与目标相差多少',21,'var(--ink)','text-anchor="middle"')+text(320,534,'objectness：该预测是否对应目标',21,'var(--ink)','text-anchor="middle"');}
  function updateDrawing(){return block(80,70,480,85,'可训练网络','Backbone → Neck → Head')+`<path d="M320 165V225" stroke="var(--accent)" stroke-width="3" marker-end="url(#arrow)"/>`+block(175,240,290,85,'预测与损失','标注与分配提供监督')+`<path d="M320 335V395" stroke="var(--accent)" stroke-width="3" marker-end="url(#arrow)"/>`+block(175,410,290,90,'反向传播与优化器','梯度 → 参数更新')+`<path d="M165 455H45V112H70" stroke="var(--warm)" stroke-width="4" fill="none" marker-end="url(#warm-arrow)"/>`+text(320,560,'训练更新参数；推理使用参数',22,'var(--ink)','text-anchor="middle"');}
  function draw(kind){
    let content='';
    if(kind==='input')content=board()+text(60,625,'固定示例输入：640 × 640',18);
    if(kind==='backbone'||kind==='neck')content=featureMaps(kind==='neck');
    if(kind==='head')content=headDrawing();
    if(kind==='decode')content=board()+boxes();
    if(kind==='final')content=board()+boxes(processCandidates().status);
    if(kind==='training-forward')content=board()+boxes()+gt();
    if(kind==='assignment')content=assignmentDrawing();
    if(kind==='loss')content=lossDrawing();
    if(kind==='update')content=updateDrawing();
    $('scene').innerHTML=`<title id="scene-title">${(mode==='infer'?infer:train)[step].visual}</title><desc id="scene-desc">${(mode==='infer'?infer:train)[step].caption}</desc>${defs()}${content}`;
  }
  function updateNms(){
    const {status,kept}=processCandidates();
    $('confidence-value').value=Number($('confidence').value).toFixed(2);
    $('overlap-value').value=Number($('overlap').value).toFixed(2);
    const filtered=[...status.values()].filter(s=>s.kind==='filtered').length;
    const suppressed=[...status.values()].filter(s=>s.kind==='suppressed').length;
    $('nms-summary').textContent=`5 个示例候选 → 分数过滤 ${filtered} 个 → ${$('use-nms').checked?'NMS 抑制 '+suppressed+' 个':'不执行 NMS'} → 保留 ${kept.length} 个（${kept.map(c=>c.id).join('、')||'无'}）。`;
    $('candidate-rows').innerHTML=candidates.map(c=>`<tr><th scope="row">${c.id}</th><td>${c.score.toFixed(2)}</td><td>stride ${c.stride}</td><td>${c.id==='A'?'自身':iou(c.box,candidates[0].box).toFixed(2)}</td><td class="${status.get(c.id).kind}">${status.get(c.id).text}</td></tr>`).join('');
    if(mode==='infer'&&step===5)draw('final');
  }
  function updateCount(){
    const all=$('levels').value==='three', slots=Number($('slots').value), positions=all?8400:400;
    $('count-formula').textContent=`${all?'(80² + 40² + 20²)':'20²'} × ${slots} = ${(positions*slots).toLocaleString('en-US')} 组预测`;
    $('count-explanation').textContent=all?'数量是结构提供的预测机会，不是图中目标数。小目标通常更依赖高分辨率特征，但并没有一层只准检测一种尺寸的硬规则。':'只保留较粗网格会减少预测机会，也削弱细小目标的空间表达条件；它并不保证只输出一个目标一个框。这里不模拟重训后的检测表现。';
  }
  function render(updateHash=true){
    const items=mode==='infer'?infer:train, item=items[step];
    $('infer-mode').setAttribute('aria-pressed',String(mode==='infer'));
    $('train-mode').setAttribute('aria-pressed',String(mode==='train'));
    $('route-description').textContent=mode==='infer'?'部署时不需要真实标注。先沿着图像到检测结果的路径看一遍，点击任一步可定位。':'训练共享前向预测路径，再增加标注、分配、损失和参数更新；这些监督环节通常不进入部署推理。';
    $('steps').innerHTML=items.map((item,i)=>`<button type="button" data-step="${i}" ${i===step?'aria-current="step"':''}><span>${String(i+1).padStart(2,'0')}</span><span>${item.label}</span></button>`).join('');
    $('steps').dataset.mode=mode;
    $('step-count').textContent=`${mode==='infer'?'INFERENCE':'TRAINING'} / ${String(step+1).padStart(2,'0')}`;
    $('step-title').textContent=item.title;
    $('step-core').textContent=item.core;
    $('step-detail').innerHTML=item.detail.map(([title,body])=>`<dt>${title}</dt><dd>${body}</dd>`).join('');
    $('step-boundary').textContent=item.boundary;
    $('visual-title').textContent=item.visual;
    $('visual-caption').textContent=item.caption;
    $('step-progress').textContent=`${step+1} / ${items.length}`;
    $('previous').disabled=step===0;
    $('next').disabled=step===items.length-1;
    $('nms-lab').hidden=!(mode==='infer'&&step===5);
    $('other-route').textContent=mode==='infer'?'看看训练怎样影响这些预测 →':'回到图像如何变成检测结果 →';
    draw(item.kind);
    if(updateHash)history.replaceState(null,'',`#${mode}-${step}`);
  }
  function go(newMode,newStep){mode=newMode;step=newStep;render();}
  function parseHash(){
    const match=location.hash.match(/^#(infer|train)-(\d)$/);
    if(match&&Number(match[2])<(match[1]==='infer'?infer:train).length){mode=match[1];step=Number(match[2]);}
  }
  $('steps').addEventListener('click',event=>{const button=event.target.closest('[data-step]');if(button){go(mode,Number(button.dataset.step));$('steps').querySelector(`[data-step="${step}"]`).focus();}});
  $('steps').addEventListener('keydown',event=>{
    const button=event.target.closest('[data-step]');if(!button||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();const count=(mode==='infer'?infer:train).length;
    const index=event.key==='Home'?0:event.key==='End'?count-1:(step+(event.key==='ArrowRight'?1:-1)+count)%count;
    go(mode,index);$('steps').querySelector(`[data-step="${index}"]`).focus();
  });
  $('infer-mode').addEventListener('click',()=>go('infer',0));
  $('train-mode').addEventListener('click',()=>go('train',0));
  $('other-route').addEventListener('click',()=>{go(mode==='infer'?'train':'infer',0);$('explorer').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});});
  $('previous').addEventListener('click',()=>{if(step>0)go(mode,step-1);});
  $('next').addEventListener('click',()=>{if(step<(mode==='infer'?infer:train).length-1)go(mode,step+1);});
  for(const id of ['confidence','overlap','use-nms'])$(id).addEventListener('input',updateNms);
  for(const id of ['levels','slots'])$(id).addEventListener('change',updateCount);
  window.addEventListener('hashchange',()=>{if(/^#(infer|train)-\d$/.test(location.hash)){parseHash();render();}});
  parseHash();updateCount();updateNms();render(!location.hash||/^#(infer|train)-\d$/.test(location.hash));
})();
