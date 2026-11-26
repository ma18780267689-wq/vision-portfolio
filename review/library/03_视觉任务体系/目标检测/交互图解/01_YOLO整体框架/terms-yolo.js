/* Definitions for conventional horizontal-box YOLO detectors. */
(() => {
  const terms = {
    gt: ['GT · 真实标注','训练时由标注给出的参照，例如某个螺栓的类别和矩形框。部署时没有 GT。'],
    iou: ['IoU · 交并比','把两个框重叠的面积除以它们合起来覆盖的面积。训练时可以比较预测框与标注框；NMS 比较的是两个预测框。','iou.svg'],
    nms: ['NMS · 非极大值抑制','常规贪心 NMS 先保留高分框，再抑制与它重叠过大的同类低分框。两个真实目标靠得很近时，也可能被误当成重复。'],
    anchor: ['Anchor box · 先验框','同一预测位置可以有几种预设宽高。网络学习相对模板的调整量，预测框不必等于模板。','anchors.svg'],
    head: ['Head · 检测头','把特征变成可监督的预测值：框的位置、类别分数等。是否另有目标置信度通道，取决于具体版本。'],
    backbone: ['Backbone · 主干网络','逐层把图像变成特征。后续预测依靠这些特征分辨目标并定位。'],
    neck: ['Neck · 特征融合部分','把来自不同深度的特征送到合适的预测层，例如让细网格也得到深层语义。'],
    assignment: ['样本分配','在这次训练里，决定哪些预测位置负责哪个标注目标。损失函数随后约束获选位置应预测什么。'],
    rf: ['感受野','从某个特征位置反向追踪：原图上哪些位置可能影响它？理论上能影响，不等于每个位置的实际贡献一样大。','receptive-field.svg'],
    stride: ['步长 · stride','单层卷积的步长是窗口在输入上每次移动的间隔。说检测层 stride 8 时，通常指相邻网格点在原图上相隔约 8 像素。'],
    pointwise: ['1×1 卷积','普通步长 1 的 1×1 卷积，在同一位置混合通道，不读取邻近位置，也不缩小特征图的宽高。','pointwise.svg'],
    fpn: ['FPN · 特征金字塔网络','让深层信息沿上采样路径到达较细的层；横向连接补入主干保留的位置细节。','fpn.svg'],
    pan: ['PAN-like · 自底向上路径','在已有的自顶向下融合之外，再把较细层的信息逐级传到较粗层。这里指检测器借用的路径，不是完整 PANet。','pan.svg'],
    c3: ['C3 · 块内两路计算','一支经过瓶颈模块，一支走较短路径；两支拼接后再用卷积混合。它描述单个节点内部，不决定尺度之间如何连接。','c3.svg'],
    c2f: ['C2f · 保留中间输出','分出的部分通道依次经过瓶颈。除了起始分支，各次瓶颈的输出也送到末端拼接。','c2f.svg'],
    c3k2: ['C3k2 · 可换内部块','在这里对照的 YOLO11 实现中，外部沿用 C2f 式组织，内部按配置使用 Bottleneck 或 C3k。','c3k2.svg'],
    focus: ['Focus · 按奇偶坐标切片','每个 2×2 小格的四个位置分别归到四组，在通道维拼起来，再做卷积。四组各自覆盖整张图，不是四个象限。','v5-stem.svg'],
    sppf: ['SPPF · 串联最大池化','连续三次 5×5、步长 1 最大池化，逐步获取相当于 5、9、13 格的覆盖范围，再把输入和三次结果拼接。','v5-pooling.svg'],
    tag: ['tag · 仓库发布标签','标记仓库某个提交，如 ultralytics/yolov5 的 v6.1。YOLOv5 是模型家族；s 是规模。三者回答不同问题。'],
    tal: ['TAL · 任务对齐分配','在空间合格的候选中，同时看目标类别得分和框的重合程度，再按匹配质量选择监督位置。'],
    one: ['一对一分配','对每个标注目标，分配规则只争取一个负责预测。部署分支据此学习减少重复高分框；训练规则不保证绝无重复。'],
    many: ['一对多分配','同一个标注目标可以监督多个预测位置。正监督更丰富，但多个位置也可能同时对同一目标输出高分。'],
    dfl: ['DFL · 分布焦点损失','把连续的边距目标分到相邻两个离散刻度上监督，例如 2.5 对应 2 和 3 各半；解码时用预测分布的期望还原距离。'],
    stal: ['STAL · 小目标感知标签分配','小目标可能覆盖不到足够的候选参考点。STAL 调整候选窗口；用于框回归的真实标注尺寸不因此改变。']
  };
  const assets = new URL('../../通用机制/特征提取与多尺度融合/assets/',document.currentScript.src);
  const aliases = {
    "gt": "GT|Ground Truth|真实标注",
    "iou": "IoU|交并比",
    "nms": "NMS|非极大值抑制",
    "anchor": "Anchor box|先验框",
    "head": "检测头|Head",
    "backbone": "Backbone|主干网络",
    "neck": "Neck|融合颈部",
    "assignment": "样本分配|标签分配",
    "rf": "感受野",
    "stride": "stride|卷积步长|下采样步长|检测步长|预测层步长",
    "pointwise": "1×1 卷积|1×1卷积|1x1 卷积",
    "fpn": "FPN|特征金字塔网络",
    "pan": "PAN-like|PAFPN|PAN",
    "c3": "C3",
    "c2f": "C2f",
    "c3k2": "C3k2",
    "focus": "Focus",
    "sppf": "SPPF",
    "tag": "tag|仓库标签",
    "tal": "TAL|任务对齐分配",
    "one": "一对一",
    "many": "一对多",
    "dfl": "DFL|分布焦点损失",
    "stal": "STAL|小目标感知标签分配"
  };
  const out = {};
  function add(key,title,body,names,file) {
    out[key] = { title,body,aliases:names.split('|'),image:file ? new URL(file,assets).href : null };
  }
  for (const [key,[title,body,file]] of Object.entries(terms)) add(key,title,body,aliases[key],key==='tal'?'assignment-choice.svg':file);
  add("v1","初代 YOLO · VOC 模型","卷积提取整图特征，再由全连接层一次输出 7×7 个格子的预测。每格的两个框共享一组类别分数。","YOLOv1|YOLO v1|初代 YOLO","network-v1.svg");
  add("v3","YOLOv3 · 三尺度 Anchor 检测","Darknet-53 的深层特征沿上采样路径和浅层拼接；三个尺度分别用先验框预测位置、目标性和类别。","YOLOv3|YOLO v3","network-v3.svg");
  add("v5","经典 YOLOv5 · 图示为仓库 v6.1","从上采样融合再下采样融合的三层特征，送入基于先验框的检测头。图取 v6.1 的默认 P5 小模型；早期版本的输入层和池化不同。","YOLOv5|YOLO v5","network-v5.svg");
  add("x","YOLOX · 三个尺度，各自解耦预测","融合后的每个尺度都分出分类与定位路径，回归侧还估计目标性；训练时再用 SimOTA 分配监督。图示常规 PAFPN 模型。","YOLOX|YOLO X","network-x.svg");
  add("v8","YOLOv8 · 常规水平框检测","C2f 复用中间特征；各尺度的框与类别分支分开。其先验框自由的检测头预测四边距离的分布。","YOLOv8|YOLO v8","network-v8.svg");
  add("v9","YOLOv9 · 以 YOLOv9-C 为例","GELAN 组织主检测路径；PGI 利用训练辅助路径传递梯度。辨认时先区分训练图与转换后的部署图。","YOLOv9|YOLO v9","network-v9.svg");
  add("v10","YOLOv10 · 双分配检测","同一组多尺度特征连接两套头。一对多保留训练监督，一对一学习部署时输出较少重复框。图取作者的常规小模型。","YOLOv10|YOLO v10","network-v10.svg");
  add("v11","YOLO11 · 常规 Detect","主干与融合节点使用 C3k2，深层还用 SPPF 和 C2PSA；常规水平框检测头仍需 NMS。","YOLO11|YOLOv11|YOLO 11|YOLO11n|YOLO11s|YOLO11m|YOLO11l|YOLO11x","network-11.svg");
  add("v26","YOLO26 · 两种部署路径","多尺度特征送入一对多和一对一分支，训练中逐渐调整二者的损失权重；两头都直接回归边距；一对一可免 NMS，一对多配 NMS。实际使用哪一路要看版本与部署设置。","YOLO26|YOLOv26|YOLO 26","network-26.svg");
  add("v5u","YOLOv5u · 不同于旧仓库检测头","在 v5 架构基础上使用不依赖宽高模板的分头设计，没有独立目标性输出。它不是经典 v5 仓库的一个发布标签。","YOLOv5u");
  add("af","Anchor-free · 不设宽高模板","每个位置仍有坐标参考，但不预放一组宽高。模型可以预测中心偏移和宽高，也可以预测到四边的距离；去掉模板不等于免 NMS。","Anchor-free|Anchor Free|AnchorFree|无先验框","../../../模型原理/YOLO11/assets/anchor-references.svg");
  add("noNms","NMS-free · 推理不靠重叠抑制","训练使输出更接近一物一框；部署不再按框间 IoU 做 NMS。按分数筛选或取前 K 个仍然可以保留。","NMS-free|免 NMS");
  add("simota","SimOTA · 按目标决定正样本数","对一个 GT，先用高 IoU 候选估计它能分到几个正样本，再按匹配代价由小到大选取。不同目标的名额可以不同。","SimOTA","assignment-choice.svg");
  add("dynk","Dynamic-k · 名额随预测质量变化","这是 SimOTA 中决定数量的一步：将该目标排名靠前的若干 IoU 相加、取整并至少保留一个名额。选中哪些候选，还要另看匹配代价和多目标争用。","Dynamic K|Dynamic-K","assignment-choice.svg");
  add("spp","SPP · 并联多范围池化","这里指 YOLO 中对同一特征层用不同窗口池化，再拼接各路结果。它汇集不同范围的上下文，不是多出几个检测尺度。","SPP","v5-pooling.svg");
  add("csp","CSP · 分路后再合流","让一部分特征经过较深的变换，另一路走较短的路径，再组合结果。C3 等是这种思路的具体实现。","CSP","c3.svg");
  add("concat","Concat · 拼接","空间尺寸已对齐的两路特征按通道排列。例如两个 80×80×64 张量拼成 80×80×128；拼接本身不学习权重。","Concat|通道拼接");
  add("decouple","解耦头","分类与框定位使用不同的特征变换，再输出各自的预测。分开的是末端特征计算；损失仍联合反传，不保证推理更快。图以 YOLO11 为例。","解耦头|解耦检测头","../../../模型原理/YOLO11/assets/decoupled-head.svg");
  add("refpoint","参考点 · anchor point","检测网格上的坐标参考；它没有宽高。基于四边距离的回归可从该点向左、上、右、下还原出一个框。","参考点|anchor point");
  add("ciou","CIoU · 框的几何误差","除了重叠，还考虑中心距离与长宽比。训练用它衡量预测框和目标框的差异，不能把损失值直接解释为检测准确率。","CIoU");
  add("bce","BCE · 二元交叉熵","衡量一个二元预测与目标值的差异。检测器常按类别分别约束分数；有独立目标性输出时也可对它使用 BCE。","BCEWithLogits|BCE|二元交叉熵");
  add("obj","Objectness · 目标性","独立于类别输出的一项分数。它的训练目标随版本变化；部分现代检测头没有单独的目标性通道。","objectness|目标性分数|目标性");
  add("csplayer","CSPLayer · YOLOX 的两路特征块","两支分别做投影；一支再经过一串瓶颈块，另一支直接参与最后的拼接。图示 C3 式走线，对应 YOLOX 的 CSPLayer 实现。","CSPLayer","c3.svg");
  add("cspdarknet","CSPDarknet · YOLOX 的常规主干","逐级降低空间分辨率，以分支结构加工特征。主干输出不同深度的特征，再由 PAFPN 跨尺度融合；两者职责不同。","CSPDarknet","network-x.svg");
  add("throughput","吞吐量 · 一段时间完成多少张","按同一时间窗口统计完成的图片数。并行处理时，稳定吞吐的倒数是平均产出间隔，不是每张图从上传或入队到结果返回的时长。","稳定吞吐|服务吞吐|吞吐量");
  add("pgi","PGI · 可编程梯度信息","YOLOv9 在训练时用辅助路径提供梯度信号，帮助主网络学习；并非换一种优化器。","PGI|可编程梯度信息","network-v9.svg");
  add("silu","SiLU · 平滑激活","把输入 x 变为 x × sigmoid(x)。常用在特征卷积之后，不意味着检测头每一项输出都使用这种激活。","SiLU");
  add("topk","Top-K · 按排序取若干个","先说清按哪个分数排序，以及 K 在哪里确定。匹配时选择监督对象与部署时留下高分输出，是两种用途。","Top-K|TopK");
  add("sppN","空间分辨率","特征图有多少行、多少列。例如 80×80 说明有 6400 个空间位置，不代表每个位置只能看一个原图像素。","空间分辨率");
  add("pos","正样本 · 被指定负责的预测","在检测的分配语境下，某个候选被指定学习一个标注目标。框内像素很多，不等于这些像素全都是正样本。","正样本分配");
  add("dist","四边距离 · l/t/r/b","对同一个目标，参考点可以不同，各点到目标四边的距离也不同；按各自的参考点解码后仍是同一个框。","四边距离|ltrb");
  add("autoanchor","AutoAnchor · 适配宽高先验","先检查现有模板与数据集标注框宽高的匹配程度，必要时重新搜索模板；这一步不替代每个训练批次的样本分配。","AutoAnchor","anchors.svg");
  add("darknet53","Darknet-53 · YOLOv3 主干","通过步长卷积逐级降低分辨率，在各阶段堆叠残差块。检测器从不同深度取出特征，供三个尺度预测。","Darknet-53|Darknet53","network-v3.svg");
  add("scdown","SCDown · 空间与通道分步处理","YOLOv10 先用 1×1 卷积调整通道，再用步长为 2 的逐通道空间卷积下采样。和一步完成两件事的普通卷积相比，计算分配不同。","SCDown","network-v10.svg");
  add("psa","PSA · 部分自注意力","在这里指 YOLOv10 的结构：只让一部分通道经过注意力等变换，再与另一部分融合，以控制全局交互的成本。","PSA|部分自注意力","network-v10.svg");
  add("c2psa","C2PSA · 部分通道做注意力","YOLO11 的深层先把特征分成两路，让一路经过注意力与前馈变换，再拼回。它在同一层内处理上下文，与跨尺度融合是两件事。","C2PSA","c2psa.svg");
  add("v7","YOLOv7 · 原作者标准 P5","用不同深度的卷积路径形成特征，在三个尺度按宽高模板预测。图示常规 P5；其他型号的辅助头不能当成标准头。","YOLOv7|YOLO v7","network-v7.svg");
  add("elan","ELAN · 聚合不同深度的特征","从一组卷积路径取出不同深度的输出再拼接，令较短与较长的变换都能给融合结果提供信息。附图示意其在标准 YOLOv7 中的位置。","ELAN","network-v7.svg");
  add("eelan","E-ELAN · 扩展的层聚合设计","论文在 E6 上扩展聚合块形成 E6E；不要把所有名为 YOLOv7 的标准配置都解释成相同的扩展块。","E-ELAN");
  add("repconv","RepConv · 部署时折叠卷积分支","训练时并联的兼容卷积与归一化分支，在部署前可等效合为一次卷积；不意味着任意注意力或跨尺度分支也能合并。附图标出标准 P5 中 RepConv 的位置。","RepConv","network-v7.svg");
  add("gelan","GELAN · YOLOv9 的特征聚合架构","通过设计分支和聚合路径组织不同深度的特征。看 v9 时先把这套网络结构与供训练用的 PGI 辅助监督分开。","GELAN","network-v9.svg");
  add("scales","多尺度预测","同一次前向在多个分辨率的特征层上产生预测。它不等同于把不同尺寸的输入各跑一遍，也不要求每种目标尺寸只能由某一层负责。","多尺度预测|多尺度检测头","network-v3.svg");
  add("residual","残差连接","把分支学出的变化量与快捷路径相加，使输入信息及其梯度有更直接的通路。只有形状对得上才能直接相加。","残差连接|残差块");
  add("flops","FLOPs · 运算量估计","按约定统计一次前向的浮点运算次数，不能直接换算成毫秒。特征搬运、算子实现和设备并行度都影响延迟。","FLOPs");
  add("ab","Anchor-based · 从宽高模板调整","在预测位置放置宽高模板，由网络依据图像调整出最终框。匹配规则若依赖模板形状，模板与目标相差太大可能影响监督资格。","Anchor-based","../../../模型原理/YOLO11/assets/anchor-references.svg");
  add("c3k","C3k · C3k2 内部的一种选择","在这里指沿用 C3 的分支结构、可设瓶颈卷积核大小的子块。C3k2 根据配置选它或 Bottleneck；两者不要只凭名称中的数字区分。","C3k","c3k2.svg");
  add("bottleneck","Bottleneck · 瓶颈块","用一组卷积变换特征，可按配置改变中间通道；输入输出兼容且启用 shortcut 时还会做残差相加。","Bottleneck|瓶颈块","c3k2.svg");
  add("p95","P95 延迟 · 尾部耗时","把同一口径下测得的请求耗时从小到大排，约 95% 不超过这个值。它回答慢的那批请求是否仍满足节拍，不等于平均耗时。","P95 延迟|P95");
  (window.kbTermSets ||= []).push(out);
})();
