/* Standalone scalar calculations only; no model training or external resources. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const sigmoid = z => 1 / (1 + Math.exp(-z));
  const format = (value, digits = 6) => (Math.abs(value) < .5 * 10 ** -digits ? 0 : value).toFixed(digits).replace('-', '−');
  function renderBinaryLoss() {
    const z = Number($('binary-logit').value) / 10, target = Number($('binary-target').value);
    const probability = sigmoid(z), error = probability - target;
    const bce = Math.max(z, 0) - z * target + Math.log1p(Math.exp(-Math.abs(z)));
    const mse = .5 * error ** 2, mseGradient = error * probability * (1 - probability);
    $('binary-logit-value').value = format(z, 1);
    $('binary-probability').value = format(probability);
    $('binary-bce').textContent = format(bce); $('binary-bce-gradient').textContent = format(error);
    $('binary-mse').textContent = format(mse); $('binary-mse-gradient').textContent = format(mseGradient);
    let explanation;
    if (target === .7) explanation = `目标为质量软值 0.7，并非一律追求分数越高越好。当前 p = ${format(probability)}，BCE 对 z 的导数为 ${format(error)}；在这个标量问题中，未加权 BCE 在 p = 0.7 处最小。`;
    else if ((target === 1 && z <= -2) || (target === 0 && z >= 2)) explanation = `目标为 ${target}，当前分数却强烈偏向相反结果。BCE 对 z 的导数为 ${format(error)}，接近 ${target === 1 ? '−1' : '+1'}；概率平方误差还多乘一个 p(1 − p)，此时导数更小。`;
    else explanation = `目标为 ${target}，当前 p = ${format(probability)}。BCE 对 z 的导数为 ${format(error)}，概率平方误差的对应导数为 ${format(mseGradient)}；这是相同输入下的数学比较，不表示哪种方法在任何任务都更好。`;
    $('binary-explanation').textContent = explanation;
  }
  for (const id of ['binary-logit', 'binary-target']) $(id).addEventListener(id === 'binary-target' ? 'change' : 'input', renderBinaryLoss);
  const functions = {
    relu: { name: 'ReLU', value: z => Math.max(0, z), gradient: z => z > 0 ? 1 : 0, note: '负区间输出为 0，局部导数也为 0。在 0 处不可导；本页标出常见实现采用的 0 约定。' },
    leaky: { name: 'Leaky ReLU（a=0.1）', value: z => z > 0 ? z : .1 * z, gradient: z => z > 0 ? 1 : .1, note: '负区间保留 0.1 的斜率；a 是此演示的固定选择。在 0 处不可导；本页标出常见实现采用的 0.1 约定。' },
    silu: { name: 'SiLU', value: z => z * sigmoid(z), gradient: z => sigmoid(z) + z * sigmoid(z) * (1 - sigmoid(z)), note: 'SiLU 的输出不要求非负或处于 0 到 1；部分负区间的导数还可以为负。平滑不等于所有位置的导数都大。' },
    mish: { name: 'Mish', value: z => z * Math.tanh(Math.log1p(Math.exp(z))), gradient: z => { const t = Math.tanh(Math.log1p(Math.exp(z))); return t + z * (1 - t * t) * sigmoid(z); }, note: 'Mish 将输入与 tanh(Softplus(z)) 相乘，其中 Softplus(z)=ln(1+exp(z))。它保留部分负响应，也不是所有位置都单调递增。' },
    sigmoid: { name: 'Sigmoid', value: sigmoid, gradient: z => sigmoid(z) * (1 - sigmoid(z)), note: 'Sigmoid 映射到 0 到 1，两端导数较小；它与 BCE 组合后的导数应按整条链计算，可回看上方数值演示。' },
    identity: { name: 'Identity', value: z => z, gradient: () => 1, note: 'Identity 原样输出输入，导数为 1。它是“不作非线性变换”的参照，不因无激活就表示该层不可训练。' }
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  function svgNode(tag, attributes, text) {
    const node = document.createElementNS(svgNS, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function drawActivation(fn, z) {
    const svg = $('activation-plot'), width = svg.clientWidth, height = 280;
    if (!width) return;
    const bounds = { left: 48, right: width - 16, top: 28, bottom: height - 48 };
    const samples = Array.from({ length: 241 }, (_, i) => { const x = -5 + i / 24; return [x, fn.value(x)]; });
    const min = Math.min(0, ...samples.map(point => point[1])), max = Math.max(0, ...samples.map(point => point[1]));
    const padding = Math.max(.08, (max - min) * .1), low = min - padding, high = max + padding;
    const x = value => bounds.left + (value + 5) / 10 * (bounds.right - bounds.left);
    const y = value => bounds.bottom - (value - low) / (high - low) * (bounds.bottom - bounds.top);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const title = svgNode('title', { id: 'activation-plot-title' }, `${fn.name} 函数曲线`);
    const desc = svgNode('desc', { id: 'activation-plot-desc' }, `输入 ${format(z, 1)} 时输出 ${format(fn.value(z))}。横轴范围为负5到5，纵轴随函数调整。`);
    const nodes = [title, desc];
    for (const value of [-5, 0, 5]) {
      nodes.push(svgNode('line', { x1: x(value), x2: x(value), y1: bounds.top, y2: bounds.bottom, class: 'activation-grid' }));
      nodes.push(svgNode('text', { x: x(value), y: bounds.bottom + 22, 'text-anchor': value === 5 ? 'end' : 'middle', class: 'activation-plot-text' }, String(value).replace('-', '−')));
    }
    const ticks = [];
    for (const value of [0, max, min]) if (ticks.every(other => Math.abs(y(value) - y(other)) >= 24)) ticks.push(value);
    for (const value of ticks) {
      nodes.push(svgNode('line', { x1: bounds.left, x2: bounds.right, y1: y(value), y2: y(value), class: 'activation-grid' }));
      nodes.push(svgNode('text', { x: bounds.left - 8, y: y(value) + 4, 'text-anchor': 'end', class: 'activation-plot-text' }, format(value, 1)));
    }
    nodes.push(svgNode('line', { x1: bounds.left, x2: bounds.right, y1: y(0), y2: y(0), class: 'activation-axis' }));
    nodes.push(svgNode('line', { x1: x(0), x2: x(0), y1: bounds.top, y2: bounds.bottom, class: 'activation-axis' }));
    nodes.push(svgNode('path', { d: samples.map(([a, b], i) => `${i ? 'L' : 'M'}${x(a).toFixed(2)},${y(b).toFixed(2)}`).join(' '), class: 'activation-curve' }));
    nodes.push(svgNode('line', { x1: x(z), x2: x(z), y1: y(0), y2: y(fn.value(z)), class: 'activation-guide' }));
    nodes.push(svgNode('circle', { cx: x(z), cy: y(fn.value(z)), r: 5, class: 'activation-point' }));
    nodes.push(svgNode('text', { x: width - 4, y: height - 7, 'text-anchor': 'end', class: 'activation-plot-text' }, '输入 z'));
    nodes.push(svgNode('text', { x: 4, y: 15, class: 'activation-plot-text' }, '输出 φ(z)'));
    svg.replaceChildren(...nodes);
  }
  function renderActivation() {
    const key = $('activation-kind').value, fn = functions[key], z = Number($('activation-input').value) / 10;
    $('activation-input-value').value = format(z, 1);
    const derivative = z === 0 && (key === 'relu' || key === 'leaky') ? `不可导；实现常取 ${key === 'relu' ? '0' : '0.1'}` : format(fn.gradient(z));
    $('activation-result').textContent = `${fn.name}：φ(${format(z, 1)}) = ${format(fn.value(z))}；φ′(${format(z, 1)}) = ${derivative}。`;
    $('activation-note').textContent = fn.note; drawActivation(fn, z);
  }
  $('activation-input').addEventListener('input', renderActivation);
  $('activation-kind').addEventListener('change', renderActivation);
  const observer = new ResizeObserver(renderActivation);
  observer.observe($('activation-plot'));
  renderBinaryLoss(); renderActivation();
})();
