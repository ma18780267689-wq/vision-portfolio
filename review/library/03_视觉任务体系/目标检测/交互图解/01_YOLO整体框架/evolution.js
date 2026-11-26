/* Mechanism index, not benchmark data. Selected detection paths, checked 2026-11-03. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const models = {
    v1: {
      name: 'YOLOv1 · 原论文 VOC 配置',
      parts: [
        '448×448 整图经 24 个卷积层和 2 个全连接层，输出单个 7×7 网格；不是现代三尺度检测头。',
        '不使用预设宽高 Anchor；每格 2 组框与置信度共享 20 个类别输出，形状为 7×7×(2×5+20)。',
        '先按 GT 中心确定网格，再在该格两个当前框中选 IoU 更高者负责；同格多目标受到限制。',
        '加权平方误差；负责框学习中心、平方根宽高与 IoU 置信度，有目标网格学习类别，未负责框置信度压向零。',
        '一次整图前向得到 98 个候选框，用共享类别分数乘各框置信度，再过滤并使用 NMS。'
      ],
      note: '贡献是统一整图定位与分类。无预设 Anchor 不等于现代 Anchor-free 结构，一次前向不等于免 NMS；论文 B=2 与仓库后续配置也需区分。',
      sources: [['初代原理与 v2 / v3 衔接', '#yolov1'], ['原论文 §2', 'https://arxiv.org/html/1506.02640v5#S2']]
    },
    v3: {
      name: 'YOLOv3 · 原版',
      parts: [
        'Darknet-53 提取特征，并在三个尺度融合、输出预测。',
        'Anchor-based：相对先验框回归中心与宽高，另有目标置信度和类别输出。',
        '根据 GT 中心位置与先验框匹配确定负责预测；先验框聚类不等于提前完成每批数据的分配。',
        '使用框参数监督、目标置信度与类别损失；不是后来 DFL 的分布式框回归。',
        '常规推理过滤低分框，再使用 NMS 抑制重复预测。'
      ],
      note: '多尺度与先验框分别处理特征分辨率和框的参数化。相邻位置、不同先验框或尺度仍可能留下重复预测。',
      sources: [['原论文 §2', 'https://pjreddie.com/media/files/papers/YOLOv3.pdf']]
    },
    v5: {
      name: 'YOLOv5 · v6.1',
      parts: [
        'CSP 系列主干、快速空间金字塔池化 SPPF 与跨层特征聚合；限定 v6.1 口径。',
        'Anchor-based 常规检测头：相对先验框回归，另有目标置信度和类别输出。',
        '先按 GT 与先验框的宽高比例筛选，再扩展到符合条件的邻近网格；可为同一 GT 产生多个正样本。',
        '分类与目标置信度使用 BCE，框定位使用 CIoU；不使用 DFL。',
        '常规推理过滤低分框，再使用 NMS 抑制重复预测。'
      ],
      note: '需要区分 v5 的具体发布版本。几何匹配按本批标签和增广后的尺寸重新建立，不是训练前一次聚类后便固定全部正样本。',
      sources: [['经典 YOLOv5 专题', '../../模型原理/YOLOv5/index.html'], ['v6.1 分配与损失', 'https://github.com/ultralytics/yolov5/blob/v6.1/utils/loss.py']]
    },
    x: {
      name: 'YOLOX · 常规模型',
      parts: [
        '常用 CSPDarknet 主干与跨层路径聚合，仍在多个尺度预测；论文也比较其他主干。',
        'Anchor-free 解耦头；分别输出框、目标置信度与类别。不是对全部下采样层都预测。',
        'SimOTA 根据候选空间约束与匹配代价排序，用候选 IoU 的 Dynamic-k 估计本轮正样本数量。',
        '分类、目标置信度与定位分别监督；训练配方还可加入 L1 定位项。',
        '常规推理过滤低分框，再使用 NMS 抑制重复预测。'
      ],
      note: 'Anchor-free、分类定位解耦和 SimOTA 分别改变预测表示、预测分支与监督分配。论文另有端到端变体，此处不把它混入常规部署模型。',
      sources: [['原论文 §2', 'https://arxiv.org/html/2107.08430v2#S2'], ['SimOTA / TAL 拓展', '../05_SimOTA与TAL/SimOTA与TAL样本分配.html']]
    },
    v7: {
      name: 'YOLOv7 · 原版 P5',
      parts: [
        'ELAN 式多路径聚合保留不同深度的特征；标准 P5 在三层预测之前设置 RepConv。',
        'Anchor-based。每层用三种宽高模板，分别输出框、目标性与各类分数。',
        '原版 train.py 的 OTA 路径先用模板和邻格生成候选，再结合预测质量和代价动态选择正样本；与纯模板筛选不同。',
        '该路径对正样本计算 CIoU 框损失与类别监督，并在各层监督目标性。带辅助头的训练配方需另看型号。',
        '兼容的 RepConv 分支可在部署前折叠。常规预测仍按目标性和类别打分，再用 NMS 去重。'
      ],
      note: '变化集中在训练和特征的组织方式。能折叠的是兼容的线性分支；并不是整个多路径网络都能化成一层卷积，标准 P5 也没有所有扩展型号的辅助头。',
      sources: [['YOLOv7 专题', '../../模型原理/YOLOv7/index.html'], ['P5 训练配置', 'https://github.com/WongKinYiu/yolov7/blob/main/cfg/training/yolov7.yaml'], ['原版训练与分配', 'https://github.com/WongKinYiu/yolov7/blob/main/utils/loss.py']]
    },
    v8: {
      name: 'YOLOv8 · 常规检测',
      parts: [
        '以 C2f 卷积特征块组织主干与融合部分，配合 SPPF 和多尺度输出。',
        'Anchor-free 解耦头：输出类别与离散分布式框参数；没有 YOLOX 式独立目标置信度分支。',
        'TAL 结合分类与定位质量排序，按预设 Top-k 等规则选择正样本；预测变化时匹配位置仍可改变。',
        '类别监督、IoU 类定位损失与 DFL；不直接照搬 YOLOX 的三项损失表达。',
        '常规推理过滤低分框，再使用 NMS 抑制重复预测。'
      ],
      note: '同为 Anchor-free，并不代表与 YOLOX 使用同一框表示、分数定义或分配方法。TAL 的固定 k 也不等于静态匹配。',
      sources: [['YOLOv8 专题', '../../模型原理/YOLOv8/index.html'], ['v8.0.196 结构配置', 'https://github.com/ultralytics/ultralytics/blob/v8.0.196/ultralytics/cfg/models/v8/yolov8.yaml'], ['v8.0.196 损失实现', 'https://github.com/ultralytics/ultralytics/blob/v8.0.196/ultralytics/utils/loss.py']]
    },
    v9: {
      name: 'YOLOv9 · 原版 TAL 路径',
      parts: [
        'GELAN 负责高效特征组织；PGI 关注训练中的信息与梯度路径，不能只当成检测头改名。',
        '所列原版检测路径为 Anchor-free，使用类别输出与离散分布式框回归。',
        '原版 loss_tal_dual.py 使用 TAL；训练辅助路径也有自己的分配与损失，不是 v10 的一对多 / 一对一去重安排。',
        '分类、定位与 DFL 监督，并通过 PGI 等训练设计改善可用梯度信息；PGI 本身不是参数更新优化器。',
        '常规推理过滤低分框，再使用 NMS 抑制重复预测。'
      ],
      note: '核心是把 GELAN 的结构作用与 PGI 的训练作用分开。这里限定原作者仓库所列 TAL 路径，不能据此推断所有移植版或训练入口都完全相同。',
      sources: [['原论文', 'https://arxiv.org/abs/2402.13616'], ['原版 TAL 损失路径', 'https://github.com/WongKinYiu/yolov9/blob/main/utils/loss_tal_dual.py']]
    },
    v10: {
      name: 'YOLOv10 · 原版',
      parts: [
        '同时检查结构的效率与表达，改进分类头、下采样和特征块等环节；不只有免 NMS 一项设计。',
        'Anchor-free 双分支检测头，使用分布式框回归；训练有一对多和一对一输出。',
        '一致双重分配：一对多提供丰富监督，一对一面向推理；用一致匹配度量协调候选偏好。',
        '共同训练两条分支，使用分类、定位与 DFL 等监督；一对一输入的停止梯度需按实现理解。',
        '部署使用一对一分支支持免 NMS；仍需要解码、分数或数量等结果选择。'
      ],
      note: '把免 NMS 理解为训练出更接近一物一框的输出，不是在旧模型上直接关掉 NMS。结构效率优化是另一组贡献。',
      sources: [['原论文 §3', 'https://arxiv.org/html/2405.14458v2#S3'], ['YOLOv10 专题', '../02_YOLOv10/YOLOv10原理与演进.html']]
    },
    y11: {
      name: 'YOLO11 · 常规检测',
      parts: [
        '采用 C3k2 卷积特征块、C2PSA 部分特征注意力块与多尺度融合；结构表达和执行成本需要分别看。',
        'Anchor-free 解耦头：输出类别与离散分布式框参数；没有 YOLOX 式独立目标置信度分支。',
        'TAL 结合分类与定位质量排序，按预设 Top-k 等规则选择正样本；预测变化时匹配位置仍可改变。',
        '类别监督、IoU 类定位损失与 DFL；不直接照搬 YOLOX 的三项损失表达。',
        '常规推理过滤低分框，再使用 NMS 抑制重复预测。'
      ],
      note: '它值得单独阅读的是结构内部的取舍。常规检测仍使用 NMS，因此不是把 YOLOv10 的所有优点按编号继承下来。',
      sources: [['YOLO11 专题', '../../模型原理/YOLO11/index.html'], ['四版优劣对照', '../../模型原理/YOLO11/index.html#compare'], ['v8.3.0 模型配置', 'https://github.com/ultralytics/ultralytics/blob/v8.3.0/ultralytics/cfg/models/11/yolo11.yaml']]
    },
    y26: {
      name: 'YOLO26 · 论文与指定实现',
      parts: [
        '以 YOLO11 为结构基础，并对主干与特征融合作轻量调整；不等于逐层完全相同。',
        'Anchor-free 双分支；采用直接框回归，移除 DFL，不再输出该离散分布。',
        '双分支使用 TAL；STAL 先调整极小 GT 的空间候选资格，定位监督仍使用原始 GT。',
        '渐进组合一对多、一对一损失，使用 MuSGD 更新参数；去掉 DFL 后仍保留定位监督。',
        '一对一可免 NMS，一对多配 NMS；实际路径取决于软件版本和导出设置。免 NMS 不等于无后处理。'
      ],
      note: '将结构基础、输出表示、监督分配、分支损失和优化器分别定位。替换 DFL 说明演进包含取舍，不能将整体收益全部归为某一个新名词。',
      sources: [['YOLO26 专题', '../04_YOLO26/YOLO26原理与演进.html'], ['论文 §3', 'https://arxiv.org/html/2606.03748v1#S3']]
    }
  };
  const dimensions = ['结构与特征', '预测与框表示', '样本分配', '损失与优化', '推理与去重'];
  const networks = {
    v1: ["network-v1.svg","YOLOv1（VOC）","448×448 图像经24层卷积和两层全连接，形成7×7格。每格分别输出两套坐标和置信度，以及一套共享类别。","先整图提特征，再一次给出 49 格的预测；每格 20 个类别值由两个框共享。","原论文 §2","https://arxiv.org/html/1506.02640v5#S2"],
    v3: ["network-v3.svg","原版 YOLOv3","Darknet-53 的三个尺度为13、26、52；较深特征上采样后与浅层拼接，每一层都有独立的三模板预测。","看上采样方向：深层特征逐级送向较细网格，三层各自预测，不要求小中大目标各占一层。","原论文 §2.3","https://arxiv.org/html/1804.02767#S2.SS3"],
    v5: ["network-v5.svg","YOLOv5s · v6.1","6×6 步长2卷积后是C3和SPPF；融合网络输出三尺度，各层用一个预测卷积，为每个宽高模板输出框、目标性和类别。","一个位置的三个候选来自三种宽高模板。图示为 v6.1 的参照配置，不是铁路项目版本的实证。","v6.1 配置","https://github.com/ultralytics/yolov5/blob/v6.1/models/yolov5s.yaml"],
    v7: ["network-v7.svg","YOLOv7 · 原版 P5","ELAN 式路径聚合后融合三层特征；各层经 RepConv 进入带宽高模板的预测头，输出框、目标性与类别。","先区分两种多分支：ELAN 拼接不同深度的特征；RepConv 中相加的线性分支可在部署前折叠。","P5 训练配置","https://github.com/WongKinYiu/yolov7/blob/main/cfg/training/yolov7.yaml"],
    x: ["network-x.svg","YOLOX · 常规检测","三尺度融合特征经各自的1×1卷积进入分类塔和回归塔。回归塔产生框和目标性；训练由SimOTA分配，常规推理仍做NMS。","解耦的是分类与回归特征；目标性预测读取回归塔特征。Anchor-free 不会自动去掉 NMS。","0.3.0 检测头","https://github.com/Megvii-BaseDetection/YOLOX/blob/0.3.0/yolox/models/yolo_head.py"],
    v8: ["network-v8.svg","YOLOv8 · v8.3.0","C2f 主干与 SPPF 提特征，C2f 双向融合输出三尺度。分类头预测类别，框头预测四边的离散分布，再解码；没有独立目标性分支。","和 YOLOX 同为 Anchor-free，v8 的常规检测头却没有独立目标性通道；它把边距表示成分布。","v8.3.0 Detect","https://github.com/ultralytics/ultralytics/blob/v8.3.0/ultralytics/nn/modules/head.py"],
    v9: ["network-v9.svg","YOLOv9-C","图像经GELAN式主干进入主预测分支；图像与主干不同层的特征也进入训练辅助路径。部署时使用转换后的主分支，与v10的一对一去重不同。","辅助预测改善训练的梯度信息；转为部署模型时保留主预测路径。这里的双路监督与 v10 的免 NMS 双头目的不同。","原版 YOLOv9-C 配置","https://github.com/WongKinYiu/yolov9/blob/main/models/detect/yolov9-c.yaml"],
    v10: ["network-v10.svg","YOLOv10-S · 原版","C2f 系列主干和SCDown提取特征，深层SPPF、PSA和跨尺度融合后的一份特征送入两个检测头。一对多供训练，一对一输出供免NMS部署。","共享三尺度特征，两个检测头各自训练。部署使用一对一头；停止梯度不阻止它在前向读取共享特征。","论文 §3","https://arxiv.org/html/2405.14458v2#S3"],
    y11: ["network-11.svg","YOLO11 · v8.3.0","C3k2出现在主干和融合节点，SPPF后接C2PSA位于主干深处。三尺度检测用类别分支与四边分布回归，常规推理使用NMS。","先分清块的位置：C3k2 在主干和融合节点都出现，C2PSA 在主干深层；常规头没有继承 v10 的免 NMS 双头。","v8.3.0 配置","https://github.com/ultralytics/ultralytics/blob/v8.3.0/ultralytics/cfg/models/11/yolo11.yaml"],
    y26: ["network-26.svg","YOLO26 · 常规检测","YOLO11式C3k2主干与深层SPPF和C2PSA，跨尺度融合供给一对多和一对一检测头。两头均直接预测边距；辅助损失逐渐减重，免 NMS 路径用一对一头。","对比 v10 时，先看两头预测什么：v10 用离散边距分布，YOLO26 直接回归边距。渐进损失属于训练，不是新增推理层。","v8.4.0 配置","https://github.com/ultralytics/ultralytics/blob/v8.4.0/ultralytics/cfg/models/26/yolo26.yaml"],
  };
  function renderNetwork(side, key) {
    const [file, name, alt, caption, label, href] = networks[key];
    const image = $(side + '-network-img'), source = $(side + '-network-source');
    image.src = '../../通用机制/特征提取与多尺度融合/assets/' + file;
    image.alt = alt;
    $(side + '-network-name').textContent = name;
    $(side + '-network-caption').textContent = caption;
    source.textContent = label; source.href = href;
  }
  function renderSources(id, entries) {
    const element = $(id); element.replaceChildren();
    entries.forEach(([label, href], index) => {
      if (index) element.append(document.createTextNode(' · '));
      const link = document.createElement('a'); link.textContent = label; link.setAttribute('href', href);
      if (/^https?:/.test(href)) { link.target = '_blank'; link.rel = 'noreferrer'; }
      element.append(link);
    });
  }
  function renderComparison(updateHash = false) {
    const leftKey = $('compare-left').value, rightKey = $('compare-right').value;
    const left = models[leftKey], right = models[rightKey];
    renderNetwork('left', leftKey); renderNetwork('right', rightKey);
    $('compare-left-title').textContent = left.name; $('compare-right-title').textContent = right.name;
    $('comparison-rows').replaceChildren(...dimensions.map((dimension, index) => {
      const row = document.createElement('tr'), heading = document.createElement('th'); heading.scope = 'row'; heading.textContent = dimension; row.append(heading);
      for (const model of [left, right]) { const cell = document.createElement('td'); cell.textContent = model.parts[index]; row.append(cell); }
      return row;
    }));
    let summary = '这是不同模型或路径的机制对照，不是直接升级关系，也不以改动数量判断性能。';
    if (leftKey === rightKey) summary = '当前两侧选择相同版本。表格用于核对同一套职责，不产生额外的创新点或性能差异。';
    else if ([leftKey, rightKey].includes('v1')) summary = '初代采用全连接网格与每格共享类别。请分别比较输出组织、监督责任与特征结构；无预设 Anchor 不代表已经具备后来的 Anchor-free 或 NMS-free 设计。';
    else if ([leftKey, rightKey].includes('y11') && [leftKey, rightKey].includes('v7')) summary = 'v7 的标准 P5 兼顾特征聚合与部署折叠，保留宽高模板和目标性；11 用四边距离分布和类别打分，两者常规推理都要去重。';
    else if ([leftKey, rightKey].includes('y11') && [leftKey, rightKey].includes('v8')) summary = 'v8 和 11 的常规框表示、正样本分配和去重路线相近。先比较 C2f 与 C3k2 的内部计算，再看 11 深层的 C2PSA；不要把共同的检测机制列作 11 的新贡献。';
    else if ([leftKey, rightKey].includes('y11') && [leftKey, rightKey].includes('v5')) summary = '经典 v5 与 11 都在三个尺度检测，但一个位置的候选数、框的起点、分配规则和分数含义都不同。两者常规推理仍使用 NMS。';
    else if ([leftKey, rightKey].includes('y26') && [leftKey, rightKey].includes('y11')) summary = '结构来源相近，仍需区分具体模块差异；更明显的变化还涉及双分支、框表示、候选资格、损失组合与参数更新。';
    else if ([leftKey, rightKey].includes('y26') && [leftKey, rightKey].includes('v10')) summary = '两者都采用双分支支持免 NMS，但 YOLO26 不等于在 YOLOv10 上只换一个优化器；结构基础和训练安排需分别核对。';
    else if ([leftKey, rightKey].includes('y26') && [leftKey, rightKey].includes('v9')) summary = '这是不同分支的横向对照，不是 v9 直接升级到 v26 的改造清单。重点区分 PGI 的训练信息设计与 MuSGD 的参数更新规则。';
    $('comparison-summary').textContent = summary;
    for (const [side, model] of [['left', left], ['right', right]]) {
      $(`${side}-reading-title`).textContent = `${model.name} 的核心定位`;
      $(`${side}-reading-note`).textContent = model.note; renderSources(`${side}-reading-source`, model.sources);
    }
    if (updateHash) history.replaceState(null, '', `#compare-${leftKey}-${rightKey}`);
  }
  function readComparisonHash() {
    const match = location.hash.match(/^#compare-([a-z0-9]+)-([a-z0-9]+)$/);
    if (!match || !models[match[1]] || !models[match[2]]) return false;
    $('compare-left').value = match[1]; $('compare-right').value = match[2]; return true;
  }
  function revealHash() {
    let fragment;
    try { fragment = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = fragment.startsWith('compare-') ? $('compare') : $(fragment);
    if (!target) return;
    for (let node = target; node; node = node.parentElement) if (node.tagName === 'DETAILS') node.open = true;
    requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
  }
  for (const id of ['compare-left', 'compare-right']) $(id).addEventListener('change', () => renderComparison(true));
  window.addEventListener('hashchange', () => { readComparisonHash(); renderComparison(); revealHash(); });
  readComparisonHash(); renderComparison();
  if (location.hash) revealHash();
})();
