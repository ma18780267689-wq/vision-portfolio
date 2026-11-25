// Each project gets a reading order based on its actual problem, not a common report outline.
export const projectJourneys={
 diagram:{headline:['将静态图纸，','快速转为可编辑拓扑。'],cover:'cover-diagram.svg',coverCaption:'图纸输入与绘图环境为独立素材，非同图转换对照。',sections:[['context','项目概况','让已有图纸继续用于检验工作。'],['challenge','关键难点','识别出对象，还不能直接编辑图纸。'],['solution','方案与实现','恢复连接关系，再适配绘图软件。'],['results','实际效果','进入检验流程，减少重复绘图。']]},
 weld:{headline:['先定位区域，','再测量几何。'],cover:'cover-weld.svg',coverCaption:'团队设备、分割示例与对外培训中的棱角度测量界面；三者为独立素材。',sections:[['context','设备与任务','将人工比对转为数字化测量。'],['chain','定位与测量','先确定测哪里，再计算尺寸。'],['measurements','测量案例','不同测量项，需要不同的几何基准。'],['results','设备验证','将区域识别与尺寸计算接入设备。']]},
 aoi:{headline:['沿着误判，','找到该改的环节。'],cover:'cover-aoi.svg',coverCaption:'十字键真实样本与人工双矩形夹定策略。',sections:[['context','项目概况','在既有产线上整改误检与漏检。'],['diagnosis','方向误判案例','从距离条件，回到实际质量标准。'],['strategy','整改与回归','逐项修复，检查关联影响。'],['results','交付结果','完成检测项整改，按期交付验收。']]},
 rail:{headline:['找到螺栓，','还要判断它怎样转动。'],cover:'cover-rail.svg',coverCaption:'',sections:[['context','检测任务','从部件异常检查，深入螺栓旋转判断。'],['pipeline','方案与实现','处理弱特征，再提取可比较的几何信息。'],['results','实现结果','让定位结果继续用于旋转判断。']]},
 safety:{headline:['识别人和车，','还要读懂安全事件。'],cover:'cover-safety.svg',coverCaption:'安全视频主题配图，非现场监控实拍。',sections:[['context','场景与任务','让多场景视频识别服务现场安全。'],['labels','关键案例','车型分不清，先检查标注是否服务任务。'],['data','数据优化','从误报和训练异常，发现数据问题。'],['results','迭代结果','将数据判断落实到告警改进。']]}
};

export const diagramStages=[
 {title:'线条整理',file:'diagram-4.png',body:'遮挡与重复会让一段管线变成多段。结合管线方向和端点位置合并碎线，为后续连接判断提供完整的线条。',caption:'管线合并的独立过程示例。'},
 {title:'对象连接',file:'diagram-5.png',body:'将管件、文字与管线放入统一结构，处理吸附、连接和局部拟合，让图上的对象具有可继续使用的关系。',caption:'对象连接方法示例，非最终软件输出。'},
 {title:'错误复核',file:'diagram-6.png',body:'将中间结构回绘到图上，检查断线、错连和端点关联。图中保留优化前的问题，用于说明需要复核的连接情况。',caption:'优化前的独立样例，用于说明复核对象。'}
];
export const railStages=[
 {title:'位置定位',file:'rail-bolt-detection.png',body:'铁路项目用 YOLOv5 定位轴端螺栓，再裁取局部图像，确保转角比较对应同一位置的螺栓。',caption:'检测框旁的数字为置信度。'},
 {title:'弱特征处理',file:'rail-bolt-processed.png',body:'暗光和油污削弱了螺栓轮廓。我对局部图像进行亮度与边缘增强，并检查关键点提取效果，使图像处理服务后续几何判断。',caption:''},
 {title:'关键点与旋转',file:'rail-keypoint-montage.png',body:'我用 ResNet50 提取螺栓局部特征，回归六个顶点的位置。在坐标回归损失中加入几何约束，使模型同时学习顶点之间的相对位置。推理时根据六个顶点构建径向向量，通过对应向量的方向变化估计转角。',caption:'图中的中心点为辅助标记。'}
];
export const safetyDataCases=[
 {title:'视角与场景',steps:['梳理现场目标与摄像头视角','筛选接近监控视角的公共样本','结合现场数据组织训练集'],body:'现场样本难以覆盖不同车辆与场景。我补充公共数据时，先检查视角和目标是否接近实际监控条件，避免无差别增样改变训练数据特征。'},
 {title:'遮挡与误报',steps:['回看告警与跟踪中断片段','补充遮挡、光照变化和误报样本','结合跟踪策略检查事件判断'],body:'后备箱检查中，岗亭遮挡会造成车辆跟踪中断。我增加遮挡车辆样本、调整数据分布，并结合ByteTrack跟踪策略处理低置信度检测，让数据改进与连续事件判断配合。'},
 {title:'标注与转换',steps:['发现损失曲线与预测表现不一致','将转换后的标注回绘到原图','修正类别转换与读取中的目标遗漏'],body:'训练中出现损失曲线与预测表现不一致的现象。我沿标签转换和读取流程排查，发现部分有效目标被遗漏、当作背景；通过回绘标注定位错误，修复后重新训练。'}
];
