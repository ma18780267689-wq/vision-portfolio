(() => {
  const image = name => new URL(name, document.currentScript.src).href;
  (window.kbTermSets ||= []).push({
    patchcore: {title:'PatchCore · 检索正常局部',body:'把正常图像的中层局部特征筛成记忆库。测试时，同一主干提取待检特征；某处离库中最近的正常特征也很远，这一处就得高分。',aliases:['PatchCore'],image:image('patchcore.svg')},
    efficientad: {title:'EfficientAD · 比较两对正常对应关系',body:'一个学生有两组输出：第一组模仿教师的局部特征，第二组模仿自编码器的输出。测试时分别算差异、校准后融合，不再逐块查库。',aliases:['EfficientAD'],image:image('efficientad.svg')},
    inpformer: {title:'INP-Former · 参照从当前图像产生',body:'冻结编码器提取特征，已学好的提取器每次从当前图像聚合少量原型。解码器借这些原型重建特征，按位置比较重建差异；提取规则仍需正常图像来学。',aliases:['INP-Former'],image:image('inpformer.svg')},
    memorybank: {title:'正常记忆库',body:'存的是正常样本的特征向量，不是原图，也不是网络权重。换主干后向量含义变了，通常需要用新主干重新建库。',aliases:['正常记忆库','特征记忆库','记忆库'],image:image('patchcore.svg')},
    coreset: {title:'核心集 · coreset',body:'从已有正常向量里保留一批有代表性的样本，使其余样本附近仍有参照。被保留的是原向量，不是平均得到的聚类中心。',aliases:['核心集选择','核心集','coreset selection','coreset'],image:image('patchcore.svg')},
    nearest: {title:'最近邻 · 在特征空间找最像的参照',body:'对一个待检局部，找距离最小的正常向量；两处不必处在同一图像坐标。这个距离仍很大，才表示在当前特征库里难以找到相似样本。',aliases:['最近邻','正常近邻']},
    localfeature: {title:'局部特征',body:'特征图一个空间位置的通道向量，描述相应区域及其上下文。一个位置通常受多个原图像素影响，不等于一个原始像素。',aliases:['局部特征','图像块特征']},
    scoremap: {title:'异常图 · 每个位置一个连续分数',body:'把局部距离或特征差异放回空间网格，并映射到图像大小。得到的是连续分数图；要输出二值 mask，还需选阈值。',aliases:['异常分数图','异常定位图','异常图']},
    normalonly: {title:'normal-only · 只用正常产品图像建模',body:'建立目标产品的正常参照时不用缺陷标签。它不表示没有训练、没有大数据预训练，也不表示验证漏检时不需要真实缺陷样本。',aliases:['normal-only']},
    pdn: {title:'PDN · 图像块描述网络',body:'EfficientAD 中的轻量卷积网络。教师在通用数据上先模仿大网络的局部描述；训练目标产品时教师固定，学生学习它的正常输出。',aliases:['图像块描述网络','PDN'],image:image('efficientad.svg')},
    distill: {title:'蒸馏 · 用另一网络的输出作学习目标',body:'固定已有能力的教师，在同一输入上让学生输出逼近指定特征。复制的是输入到输出的行为，不是把教师参数直接抄给学生。',aliases:['蒸馏']},
    ae: {title:'自编码器 · 经过瓶颈再重建',body:'把输入压进潜在表示，再解码到指定的重建目标。EfficientAD 从整图经瓶颈重建教师特征，比较时用学生第二组输出作参照。',aliases:['自编码器'],image:image('efficientad.svg')},
    hardfeature: {title:'困难特征损失',body:'EfficientAD 的局部拟合优先纠正正常样本中尚未模仿好的特征：在本次误差张量内挑高误差元素反传。并非只用难例图，也不是找出了真实缺陷。',aliases:['困难特征损失']},
    domainpenalty: {title:'域外惩罚 · 限制学生处处模仿',body:'训练时额外取产品域外图像，压低学生对应通道的输出，避免学生对所有输入都复制教师。推理时不再输入这些额外图像。',aliases:['预训练图像惩罚','域外惩罚']},
    logicalanomaly: {title:'逻辑异常 · 局部都像正常，组合却不合格',body:'例如线缆外观正常，但比要求多了一根。异常来自数量、位置或搭配规则，单独放大一处纹理不一定能看出。',aliases:['逻辑异常','全局组合异常']},
    inpprototype: {title:'内在正常原型 · INP',body:'少量查询把当前图像的局部特征聚成代表向量，供解码器取值。查询参数可固定，而每张图的向量会变；若异常混入原型，也可能漏检。',aliases:['内在正常原型','图内原型','正常原型','INP'],image:image('inpformer.svg')},
    crossattn: {title:'交叉注意力',body:'查询来自一组表示，键和值来自另一组。INP 引导解码时，各位置提供查询，图内原型提供键和值：当前位置决定从哪些原型取多少信息。',aliases:['交叉注意力'],image:image('inpformer.svg')},
    tokfeature: {title:'视觉 token',body:'这里指编码器中有空间位置的块特征向量。深层向量可含其他位置的上下文，不能把一个 token 等同于单个原始像素。',aliases:['token']},
    cosine: {title:'余弦距离',body:'常写为 1 减余弦相似度，侧重比较两个特征向量的方向。INP-Former 比较同一位置原特征与重建特征的方向差异来定位异常。',aliases:['余弦距离']},
    softmining: {title:'软挖掘损失',body:'INP-Former 根据误差的相对大小连续调整正常区域的反向梯度，给还没重建好的区域更大更新力度。这影响训练，不是部署时给热图再加一层权重。',aliases:['软挖掘损失','软挖掘']},
    calibration: {title:'分数校准 · 先让两张分数图可比',body:'EfficientAD 用单独的正常验证图像估计两条分支各自的分数尺度。校准后再平均，以免噪声本来较大的一支压倒另一支；结果不是缺陷概率。',aliases:['尺度校准','分支校准']},
    pixelauroc: {title:'像素 AUROC',body:'在多种阈值下衡量异常像素能否排在正常像素之前。它不能直接回答在规定误剔率下，一条细裂纹会不会被整件漏掉。',aliases:['像素 AUROC']}
  });
})();
