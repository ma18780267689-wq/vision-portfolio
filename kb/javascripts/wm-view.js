// docs/javascripts/wm-view.js
// 世界模型视图 - 全屏泳道看板（v5: 多窗口拖动预览 + 一键开启关联内容）
(() => {
  // ─── 数据（从 JSON 加载） ───
  let WM_DATA = {};      // laneKey -> { name, icon, color, gradient, subtitle, coreQuestion, items }
  let WM_EDGES = [];     // [{from, to, type}, ...]
  let WM_LOADED = false;
  let WM_NODE_MAP = {};  // id -> node raw data

  const DOMAIN_COLORS = {
    "Agent": { bg: "#2f6556", light: "#2f65561f", text: "#2f6556" },
    "深度学习": { bg: "#fafaf8", light: "#fafaf81f", text: "#fafaf8" }
  };

  // ─── 状态 ───
  let selectedDomains = [];
  let searchKeyword = '';
  let editMode = false;
  let editBackendAlive = false;
  let selectedSourceFile = ''; // document focus mode
  let selectedLane = '';
  const mobileView = window.matchMedia('(max-width: 700px), (max-width: 900px) and (max-height: 500px)');
  let connectingState = null; // null | 'selecting_target'
  let connectingSourceId = null;
  const EDIT_API = '/vision-portfolio/kb/reading-only';

  // ─── 编辑 API 工具 ───
  async function editApiPost(endpoint, body) {
    const resp = await fetch(EDIT_API + endpoint, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    return resp.json();
  }
  async function checkEditBackend() { editBackendAlive = false; }
  function editToast(msg, ok=true) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position:'fixed', bottom:'24px', right:'24px', padding:'10px 20px',
      background: ok ? '#fafaf8' : '#2f6556', color:'#fafaf8', borderRadius:'8px',
      fontSize:'13px', fontWeight:'600', zIndex:'99999', boxShadow:'0 4px 20px #2327264d',
      animation:'wm-fadeIn 0.3s ease'
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }
  async function reloadGraphAndRender() {
    WM_LOADED = false; WM_DATA = {}; WM_NODE_MAP = {}; WM_EDGES = [];
    if (await loadGraphData()) renderDashboard();
  }

  // ─── 连线系统状态 ───
  let connRelations = {};     // blockId -> [related blockIds]
  let connActiveId = null;
  let connClearTimer = null;

  // ═══════════════════════════════════════
  //  数据加载
  // ═══════════════════════════════════════

  function getSiteBasePath() {
    const p = window.location.pathname;
    const i = p.indexOf('views/world-model');
    if (i >= 0) return p.substring(0, i);
    const logo = document.querySelector('.md-header a[href]');
    if (logo) try { return new URL(logo.href, location.origin).pathname.replace(/index\.html$/, '').replace(/\/$/, '/'); } catch (e) { }
    return '/';
  }

  function resolveLink(rel) {
    if (!rel) return '#';
    const cleaned = rel.replace(/^docs\//, '');
    return getSiteBasePath() + cleaned;
  }

  async function loadGraphData() {
    if (WM_LOADED) return true;
    try {
      let graph = null;
      // If sidecar is alive, always fetch fresh data from it bypassing MkDocs cache
      if (editBackendAlive) {
        try {
          const resp = await fetch(EDIT_API + '/api/graph?t=' + Date.now());
          if (resp.ok) graph = await resp.json();
        } catch(e) {}
      }
      
      // Fallback to MkDocs static file (for published sites or when sidecar is off)
      if (!graph) {
        const basePath = getSiteBasePath();
        const resp = await fetch(basePath + 'data/wm-graph.json?t=' + Date.now());
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        graph = await resp.json();
      }

      const lanes = graph.lanes || {};
      WM_DATA = {};
      Object.entries(lanes).forEach(([key, meta]) => {
        WM_DATA[key] = {
          name: meta.name,
          subtitle: meta.subtitle,
          color: meta.color,
          gradient: `linear-gradient(135deg, ${meta.color}, ${adjustColor(meta.color, -20)})`,
          icon: meta.icon,
          coreQuestion: meta.question,
          items: []
        };
      });

      (graph.nodes || []).forEach(node => {
        WM_NODE_MAP[node.id] = node;
        const lane = WM_DATA[node.lane];
        if (lane) {
          lane.items.push({
            id: node.id,
            domain: node.domain,
            title: node.title,
            summary: node.summary,
            link: node.source,
            source_file: node.source_file || ''
          });
        }
      });
      WM_EDGES = graph.edges || [];
      WM_LOADED = true;
      return true;
    } catch (err) {
      console.warn('[WM] Failed to load wm-graph.json, using fallback:', err);
      return false;
    }
  }

  function adjustColor(hex, amount) {
    hex = hex.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  function getAllDomains() {
    const s = new Set();
    Object.values(WM_DATA).forEach(l => l.items.forEach(i => s.add(i.domain)));
    return Array.from(s);
  }

  function getAllSourceFiles() {
    const s = new Set();
    Object.values(WM_DATA).forEach(l => l.items.forEach(i => { if (i.source_file) s.add(i.source_file); }));
    return Array.from(s).sort();
  }

  function isWorldModelPage() { return document.getElementById('wm-fullpage') !== null; }
  function enterFullscreenMode() { document.body.classList.add('wm-fullscreen-active'); }
  function exitFullscreenMode() { document.body.classList.remove('wm-fullscreen-active'); }

  function getFilteredItems(lane) {
    let items = lane.items;
    if (selectedSourceFile) items = items.filter(i => i.source_file === selectedSourceFile);
    if (selectedDomains.length > 0) items = items.filter(i => selectedDomains.includes(i.domain));
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(kw) || i.summary.toLowerCase().includes(kw) || i.domain.toLowerCase().includes(kw));
    }
    return items;
  }

  function highlightKeyword(text, kw) {
    if (!kw) return text;
    return text.replace(new RegExp(`(${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'), '<mark class="wm-highlight">$1</mark>');
  }

  function isCompareMode() { return selectedDomains.length === 2; }
  
  function getVisibleId(id) {
    return id;
  }
  
  function getLaneByBlockId(blockId) {
    for (const [key, lane] of Object.entries(WM_DATA)) {
      if (lane.items.some(it => it.id === blockId)) return key;
    }
    return null;
  }

  function renderItem(item, laneColor, idx, isLeader = false, childrenCount = 0) {
    const dc = DOMAIN_COLORS[item.domain] || { text: laneColor, light: '#2327260d' };
    const badgeHtml = (isLeader && childrenCount > 0) ? `
      <div class="wm-item-children-badge wm-adsorption-toggle-btn" 
           data-count="${childrenCount}"
           style="font-size:10px; color:${dc.text}; margin-top:8px; display:inline-block; padding:3px 8px; background:${dc.light}; border-radius:4px; cursor:pointer; font-weight:600; border: 1px solid transparent; transition:all 0.2s;"
           title="点击收起或展开内部包含的所有衍生卡片">⊟ 收起内部关联 (${childrenCount})</div>` : '';

    return `
      <div class="wm-item" tabindex="0"
         data-conn-id="${item.id}"
         data-preview-link="${resolveLink(item.link)}"
         data-preview-title="${item.title}"
         data-preview-domain="${item.domain}"
         data-preview-summary="${item.summary}"
         style="animation-delay: ${idx * 0.03}s;">
        <div class="wm-item-domain" style="color: ${dc.text}; display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="display:flex; align-items:center;">
            ${item.domain}
          </div>
          ${editMode ? `<button class="wm-edit-start-conn-btn" data-id="${item.id}" style="background:${connectingState==='selecting_target'&&connectingSourceId===item.id ? '#2f6556' : '#2f65561a'}; border:1px solid #2f65564d; border-radius:4px; color:${connectingState==='selecting_target'&&connectingSourceId===item.id ? '#fafaf8' : '#2f6556'}; width:20px; height:20px; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:11px; transition:all 0.15s; flex-shrink:0;" title="${connectingState==='selecting_target'&&connectingSourceId===item.id ? '取消连线' : '连线到其他知识块'}">🔗</button>` : ''}
        </div>
        <div class="wm-item-title">${highlightKeyword(item.title, searchKeyword)}</div>
        <div class="wm-item-summary">${highlightKeyword(item.summary, searchKeyword)}</div>
        ${badgeHtml}
      </div>`;
  }

  function buildAdsorptionCohorts(items) {
    if (isCompareMode()) return items.map(i => [i]);
    const itemIds = new Set(items.map(i => i.id));
    const adj = {};
    items.forEach(i => adj[i.id] = []);
    WM_EDGES.forEach(e => {
        if (itemIds.has(e.from) && itemIds.has(e.to)) {
            adj[e.from].push(e.to);
            adj[e.to].push(e.from);
        }
    });

    const visited = new Set();
    const cohorts = [];

    for (const item of items) {
        if (!visited.has(item.id)) {
            const cohort = [];
            const queue = [item];
            visited.add(item.id);
            while(queue.length > 0) {
                const cur = queue.shift();
                cohort.push(cur);
                for (const neighborId of adj[cur.id]) {
                    if (!visited.has(neighborId)) {
                        visited.add(neighborId);
                        queue.push(items.find(i => i.id === neighborId));
                    }
                }
            }
            cohorts.push(cohort.sort((a, b) => items.indexOf(a) - items.indexOf(b)));
        }
    }
    return cohorts;
  }

  function renderLaneBody(laneKey, lane) {
    const items = getFilteredItems(lane);
    if (items.length === 0) return `<div class="wm-lane-body"><div class="wm-lane-empty">暂无匹配</div></div>`;

    if (isCompareMode()) {
      const dA = selectedDomains[0], dB = selectedDomains[1];
      const iA = items.filter(i => i.domain === dA), iB = items.filter(i => i.domain === dB);
      const cA = DOMAIN_COLORS[dA] || { text: lane.color, bg: '#232726' };
      const cB = DOMAIN_COLORS[dB] || { text: lane.color, bg: '#232726' };
      return `
        <div class="wm-lane-body wm-compare-body">
          <div class="wm-compare-col">
            <div class="wm-compare-col-header" style="color:${cA.text}">${dA} (${iA.length})</div>
            <div class="wm-compare-col-items">${iA.map((it, i) => renderItem(it, lane.color, i)).join('')}</div>
          </div>
          <div class="wm-compare-divider"></div>
          <div class="wm-compare-col">
            <div class="wm-compare-col-header" style="color:${cB.text}">${dB} (${iB.length})</div>
            <div class="wm-compare-col-items">${iB.map((it, i) => renderItem(it, lane.color, i + 100)).join('')}</div>
          </div>
        </div>`;
    }

    const cohorts = buildAdsorptionCohorts(items);
    const html = cohorts.map(cohort => {
      if (cohort.length === 1) {
        return renderItem(cohort[0], lane.color, items.indexOf(cohort[0]));
      } else {
        const leader = cohort[0];
        const children = cohort.slice(1);
        return `
        <div class="wm-adsorption-group">
          ${renderItem(leader, lane.color, items.indexOf(leader), true, children.length)}
          <div class="wm-adsorption-children">
            ${children.map(it => renderItem(it, lane.color, items.indexOf(it))).join('')}
          </div>
        </div>`;
      }
    }).join('');

    return `<div class="wm-lane-body">${html}</div>`;
  }

  function injectAdsorptionStyles() {
    if (document.getElementById('wm-adsorption-styles')) return;
    const style = document.createElement('style');
    style.id = 'wm-adsorption-styles';
    style.innerHTML = `
      .wm-adsorption-group { position: relative; border-radius: 12px; padding: 6px; margin-bottom: 14px; border: 1px solid transparent; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      .wm-adsorption-group:hover { background: #2f65560a; border-color: #2f65564d; box-shadow: 0 10px 30px #2f655614; transform: translateY(-1px); }
      .wm-adsorption-children { display: flex; flex-direction: column; gap: 14px; margin-top: 14px; }
      .wm-adsorption-group.collapsed .wm-adsorption-children { display: none; }
      .wm-adsorption-toggle-btn:hover { filter: brightness(0.9); }
    `;
    document.head.appendChild(style);
  }

  function renderDashboard() {
    injectAdsorptionStyles();
    const root = document.getElementById('wm-fullpage');
    if (!root) return;
    const domains = getAllDomains();
    const filteredTotal = Object.values(WM_DATA).reduce((s, l) => s + getFilteredItems(l).length, 0);
    const laneKeys = Object.keys(WM_DATA);
    if (!selectedLane || !getFilteredItems(WM_DATA[selectedLane]).length) {
      selectedLane = laneKeys.find(key => getFilteredItems(WM_DATA[key]).length) || laneKeys[0];
    }
    let html = '';

    html += `
    <header class="wm-header">
      <div class="wm-header-content">
        <div class="wm-header-left">
          <h1 class="wm-title"><span class="wm-title-icon">🌐</span>世界模型视图</h1>
          <p class="wm-subtitle">跨领域骨架 · 闭环迭代 · 复盘短板</p>
        </div>
        <div class="wm-header-right">
          <div class="wm-search-box" style="display:flex; gap:8px;">
            <select id="wm-file-select" class="wm-search-input" style="padding:6px 10px; border-radius:6px; min-width:200px; text-overflow:ellipsis; background:var(--md-default-bg-color,#fafaf8); border:1px solid #fafaf8; color:#232726;">
              <option value="" style="color:#232726;">📁 全局视图 (所有文档)</option>
              ${getAllSourceFiles().map(f => `<option value="${f}" style="color:#232726;" ${selectedSourceFile===f?'selected':''}>📄 ${f.replace('docs/domains/','')}</option>`).join('')}
            </select>
            ${selectedSourceFile && editMode ? `<button id="wm-btn-add-block" style="padding:6px 14px; background:#2f6556; color:#fafaf8; border:none; border-radius:6px; font-weight:bold; cursor:pointer;" title="在当前文档新建知识块">➕ 新增</button>` : ''}
            <input type="text" class="wm-search-input" id="wm-search" aria-label="搜索知识块" placeholder="搜索知识块..." value="${searchKeyword}">
          </div>
        </div>
      </div>
    </header>`;

    html += `<div class="wm-toolbar" style="display:flex; justify-content:space-between; align-items:center;"><div class="wm-domain-btns">`;
    html += `<button class="wm-domain-btn ${selectedDomains.length === 0 ? 'active' : ''}" data-domain="__all__">全部</button>`;
    domains.forEach(d => {
      const act = selectedDomains.includes(d), dc = DOMAIN_COLORS[d] || { bg: '#232726', light: '#2327260d' };
      html += `<button class="wm-domain-btn ${act ? 'active' : ''}" data-domain="${d}" style="--btn-color:${dc.bg}">${d}</button>`;
    });
    html += `</div>
             <div class="wm-view-toggle" style="display:flex; gap:8px; align-items:center;">
               <button id="wm-btn-edit" class="wm-domain-btn ${editMode?'active':''}" style="${editMode ? '--btn-color:#2f6556; border-color:#2f6556; color:#2f6556;' : ''}"
                 title="${editBackendAlive ? '点击切换编辑模式' : '服务未启动，请运行 python scripts/wm_editor.py'}">
                 ${editMode ? '✅ 编辑中' : '✏️ 编辑模式'}
                 <span style="display:inline-block;width:6px;height:6px;border-radius:50%;margin-left:4px;background:${editBackendAlive ? '#fafaf8' : '#fafaf8'};"></span>
               </button>
             </div>
           </div>`;

    html += `<label class="wm-mobile-lane-picker">浏览分类
      <select id="wm-lane-select">${laneKeys.map(key => `<option value="${key}" ${key === selectedLane ? 'selected' : ''}>${WM_DATA[key].name} · ${getFilteredItems(WM_DATA[key]).length} 条</option>`).join('')}</select>
    </label>`;
    html += `<div class="wm-lanes-wrapper"><div class="wm-lanes-grid">`;
    Object.entries(WM_DATA).forEach(([key, lane]) => {
      html += `
      <div class="wm-lane" data-lane="${key}" data-mobile-active="${key === selectedLane}">
        <div class="wm-lane-header" style="background:${lane.gradient}">
          <div class="wm-lane-header-top"><span class="wm-lane-icon">${lane.icon}</span><span class="wm-lane-name">${lane.name}</span><span class="wm-lane-badge">${getFilteredItems(lane).length}</span></div>
          <div class="wm-lane-subtitle">${lane.subtitle}</div>
        </div>
        ${renderLaneBody(key, lane)}
      </div>`;
    });
    html += `</div></div>`;

    html += `
    <div class="wm-cycle-bar"><div class="wm-cycle-flow">
      <span class="wm-cycle-node" style="--node-color:#2f6556">📚 规律</span><span class="wm-cycle-arrow">→</span>
      <span class="wm-cycle-node" style="--node-color:#2f6556">🛡️ 价值约束</span><span class="wm-cycle-arrow">→</span>
      <span class="wm-cycle-node" style="--node-color:#fafaf8">🎯 选择干预</span><span class="wm-cycle-arrow">→</span>
      <span class="wm-cycle-node" style="--node-color:#fafaf8">📊 获得回响</span><span class="wm-cycle-arrow">→</span>
      <span class="wm-cycle-node" style="--node-color:#2f6556">📚 更新规律</span>
    </div><div class="wm-cycle-label">
      <button id="wm-close-all-previews" style="margin-left:2rem; padding:2px 8px; font-size:10px; cursor:pointer; background:none; border:1px solid #fafaf8; border-radius:4px; opacity:0.6 hover:opacity:1">清空当前所有预览窗口</button>
    </div></div>`;

    root.innerHTML = html;
    bindEvents();
    setupConnections();
    
    // Highlight connecting target state
    if (editMode && connectingState === 'selecting_target') {
      document.querySelectorAll('.wm-item').forEach(card => {
        if (card.dataset.connId !== connectingSourceId) {
          card.style.border = '1.5px dashed #2f6556';
          card.style.boxShadow = 'inset 0 0 10px #2f65561a';
        } else {
          card.style.border = '2px solid #2f6556';
          card.style.boxShadow = '0 0 15px #2f65564d';
        }
      });
    }

    document.getElementById('wm-close-all-previews')?.addEventListener('click', () => {
      closePreviews();
    });
  }

  function bindEvents() {
    document.getElementById('wm-lane-select')?.addEventListener('change', function () {
      selectedLane = this.value;
      clearConnections();
      document.querySelectorAll('.wm-lane').forEach(lane => {
        lane.dataset.mobileActive = String(lane.dataset.lane === selectedLane);
      });
    });
    document.getElementById('wm-btn-edit')?.addEventListener('click', async () => {
      await checkEditBackend();
      if (!editBackendAlive) {
        editToast('⚠️ 后台服务未运行\n请先执行: python scripts/wm_editor.py', false);
        renderDashboard();
        return;
      }
      editMode = !editMode;
      connectingState = null; connectingSourceId = null;
      renderDashboard();
      if (editMode) editToast('✅ 进入编辑模式，双击卡片可修改，点击右上角🔗可以连线');
    });

    document.querySelectorAll('.wm-domain-btns .wm-domain-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const d = this.dataset.domain;
        if (d === '__all__') { selectedDomains = []; }
        else {
          const i = selectedDomains.indexOf(d);
          if (i >= 0) selectedDomains.splice(i, 1);
          else { if (selectedDomains.length >= 2) selectedDomains.shift(); selectedDomains.push(d); }
        }
        renderDashboard();
      });
    });

    const si = document.getElementById('wm-search');
    if (si) {
      let t;
      si.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(() => { searchKeyword = this.value.trim(); renderDashboard(); }, 280);
      });
    }

    document.getElementById('wm-file-select')?.addEventListener('change', function() {
      selectedSourceFile = this.value;
      renderDashboard();
    });

    document.getElementById('wm-btn-add-block')?.addEventListener('click', () => {
      openCreateModal(selectedSourceFile);
    });

    document.querySelectorAll('.wm-edit-start-conn-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        if (connectingState === 'selecting_target' && connectingSourceId === btn.dataset.id) {
           connectingState = null; connectingSourceId = null;
           renderDashboard();
           return;
        }
        connectingState = 'selecting_target';
        connectingSourceId = btn.dataset.id;
        editToast('🔗 请点击目标卡片以建立连接，或再次点击图标取消即可');
        renderDashboard();
      });
    });

    document.querySelectorAll('.wm-adsorption-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const group = e.currentTarget.closest('.wm-adsorption-group');
        group.classList.toggle('collapsed');
        const count = e.currentTarget.dataset.count;
        if (group.classList.contains('collapsed')) {
          e.currentTarget.innerHTML = `⊞ 展开内部关联 (${count})`;
        } else {
          e.currentTarget.innerHTML = `⊟ 收起内部关联 (${count})`;
        }
        setTimeout(redrawActiveConnections, 50);
      });
    });

    document.querySelectorAll('.wm-item[data-preview-link]').forEach(card => {
      card.addEventListener('click', async (e) => {
        e.preventDefault();
        if (editMode) {
          if (connectingState === 'selecting_target') {
            const tgtId = card.dataset.connId;
            if (tgtId === connectingSourceId) return;
            connectingState = null;
            const relType = window.prompt("建立连接 ↔ 请输入关联类型（如：关联、支撑、依赖、驱动）", "关联");
            if (!relType) { connectingSourceId = null; renderDashboard(); return; }
            editToast('正在保存连线...');
            try {
              const r = await editApiPost('/api/add-relation', {src: connectingSourceId, tgt: tgtId, type: relType});
              connectingSourceId = null;
              if (r.success) { editToast(`✅ 已成功连线`); setTimeout(reloadGraphAndRender, 300); }
              else { editToast('❌ ' + r.message, false); renderDashboard(); }
            } catch { editToast('❌ 后端无响应', false); renderDashboard(); }
          }
          return; // otherwise ignore normal click in edit mode
        }
        openPreview({
          id: card.dataset.connId,
          link: card.dataset.previewLink,
          title: card.dataset.previewTitle,
          domain: card.dataset.previewDomain,
          summary: card.dataset.previewSummary
        });
      });
      if (editMode) {
        card.style.cursor = connectingState === 'selecting_target' ? 'crosshair' : 'pointer';
        card.setAttribute('title', connectingState === 'selecting_target' ? '点击与该知识块建立连接' : '双击编辑卡片，或点击右上角🔗建立连线');
        card.addEventListener('dblclick', (e) => {
          e.preventDefault(); e.stopPropagation();
          openEditModal(card.dataset.connId);
        });
      }
    });
  }

  // ═══════════════════════════════════════
  //  预览卡片系统 (多窗口拖动 + 深度优化)
  // ═══════════════════════════════════════
  const previewCache = {};
  let previewZIndex = 10000;

  function closePreviews() {
    document.querySelectorAll('.wm-floating-card, .wm-preview-backdrop').forEach(el => el.remove());
    document.body.classList.remove('wm-preview-open');
  }

  mobileView.addEventListener('change', () => { closePreviews(); clearConnections(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const cards = Array.from(document.querySelectorAll('.wm-floating-card'));
      cards.sort((a, b) => Number(b.style.zIndex) - Number(a.style.zIndex));
      cards[0]?.querySelector('.wm-preview-close').click();
    }
  });

  function openPreview({ id, link, title, domain, summary }) {
    const dc = DOMAIN_COLORS[domain] || { text: '#2f6556' };
    const cardId = `preview-${id}`;
    const returnFocus = document.activeElement;
    if (mobileView.matches) closePreviews();
    if (document.getElementById(cardId)) {
      const existing = document.getElementById(cardId);
      existing.style.zIndex = ++previewZIndex;
      return;
    }

    const card = document.createElement('div');
    card.id = cardId;
    card.className = 'wm-floating-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', title);
    if (mobileView.matches) card.setAttribute('aria-modal', 'true');
    card.style.zIndex = ++previewZIndex;

    const count = document.querySelectorAll('.wm-floating-card').length;
    card.style.top = (100 + (count % 8) * 30) + 'px';
    card.style.left = Math.max(16, Math.min(350 + (count % 8) * 30, window.innerWidth - 516)) + 'px';

    const expandLink = `${link}#expand-${encodeURIComponent(title)}`;
    const rels = connRelations[id] || [];

    card.innerHTML = `
      <div class="wm-preview-header">
        <div class="wm-preview-meta">
          <span class="wm-preview-domain" style="color:${dc.text}">${domain}</span>
          <div class="wm-preview-actions">
            ${rels.length > 0 ? `<button class="wm-preview-conn-btn" aria-expanded="false">关联内容 (${rels.length})</button>` : ''}
            <button class="wm-preview-close" aria-label="关闭预览" title="关闭预览">关闭 ×</button>
          </div>
        </div>
        <h2 class="wm-preview-title">${title}</h2>
        <p class="wm-preview-summary">${summary}</p>

      </div>
      <div class="wm-preview-related" hidden></div>
      <div class="wm-preview-body">
        <div class="wm-preview-loading">
          <div class="wm-preview-spinner"></div>
          <span>正为您抓取最相关的正文...</span>
        </div>
      </div>
      <div class="wm-preview-footer">
        <a href="${expandLink}" class="wm-preview-fulllink" target="_blank">前往正文阅读全文 →</a>
      </div>`;

    if (mobileView.matches) {
      const backdrop = document.createElement('div');
      backdrop.className = 'wm-preview-backdrop';
      backdrop.addEventListener('click', () => card.querySelector('.wm-preview-close').click());
      document.body.appendChild(backdrop);
      document.body.classList.add('wm-preview-open');
    }
    document.body.appendChild(card);
    card.querySelector('.wm-preview-close').addEventListener('click', () => {
      card.remove();
      if (!document.querySelector('.wm-floating-card')) closePreviews();
      if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
    });
    card.querySelector('.wm-preview-close').focus({preventScroll:true});
    card.addEventListener('keydown', e => {
      if (!mobileView.matches || e.key !== 'Tab') return;
      const controls = Array.from(card.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')).filter(el => el.getClientRects().length);
      const first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    card.addEventListener('mousedown', () => { card.style.zIndex = ++previewZIndex; });

    card.querySelector('.wm-preview-conn-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      const panel = card.querySelector('.wm-preview-related');
      panel.hidden = !panel.hidden;
      e.currentTarget.setAttribute('aria-expanded', String(!panel.hidden));
      if (panel.childElementCount) return;
      rels.forEach(rid => {
        for (const lane of Object.values(WM_DATA)) {
          const item = lane.items.find(it => it.id === rid);
          if (item) {
            const button = document.createElement('button');
            button.textContent = item.title;
            button.addEventListener('click', () => openPreview({
              id: item.id,
              link: resolveLink(item.link),
              title: item.title,
              domain: item.domain,
              summary: item.summary
            }));
            panel.appendChild(button);
            break;
          }
        }
      });
    });

    const head = card.querySelector('.wm-preview-header');
    head.addEventListener('mousedown', (e) => {
      if (mobileView.matches) return;
      if (e.target.closest('button') || e.target.closest('a')) return;
      const startX = e.clientX - card.offsetLeft;
      const startY = e.clientY - card.offsetTop;
      const onMove = (me) => {
        card.style.left = Math.max(8, Math.min(me.clientX - startX, window.innerWidth - card.offsetWidth - 8)) + 'px';
        card.style.top = Math.max(8, Math.min(me.clientY - startY, window.innerHeight - head.offsetHeight - 8)) + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    loadPreviewContent(link, title, card.querySelector('.wm-preview-body'));
  }

  async function loadPreviewContent(url, targetTitle, container) {
    const cacheKey = url + targetTitle;
    if (previewCache[cacheKey]) { container.innerHTML = previewCache[cacheKey]; return; }

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error('Fetch failed');
      const html = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const article = doc.querySelector('.md-content__inner') || doc.querySelector('article');

      if (!article) {
        container.innerHTML = '<div class="wm-preview-empty">无法提取正文</div>';
        return;
      }

      article.querySelectorAll('details').forEach(d => d.setAttribute('open', ''));
      article.querySelectorAll('.admonition.note, .admonition.info').forEach(a => {
        const input = a.querySelector('input[type="checkbox"]');
        if (input) input.checked = true;
      });

      let startNode = null;
      const hds = article.querySelectorAll('h2, h3, h4, .admonition-title');
      for (const h of hds) {
        if (h.textContent.trim().includes(targetTitle.trim())) { startNode = h; break; }
      }

      let inner = '';
      if (startNode) {
        let curr = startNode;
        let count = 0;
        inner += curr.outerHTML;
        curr = curr.nextElementSibling;
        while (curr && count < 15) {
          if (['H1', 'H2', 'H3'].includes(curr.tagName) && !curr.classList.contains('admonition-title')) break;
          inner += curr.outerHTML;
          curr = curr.nextElementSibling;
          count++;
        }
      } else {
        inner = Array.from(article.children).slice(0, 10).map(c => c.outerHTML).join('');
      }

      const temp = document.createElement('div');
      temp.innerHTML = inner;
      temp.querySelectorAll('.headerlink').forEach(el => el.remove());

      const final = `<div class="wm-preview-content md-typeset">${temp.innerHTML}</div>`;
      previewCache[cacheKey] = final;
      container.innerHTML = final;
    } catch (e) {
      container.innerHTML = '<div class="wm-preview-empty">加载失败，请直接点击下方链接</div>';
    }
  }

  function setupConnections() {
    if (isCompareMode()) { connRelations = {}; return; }
    connRelations = buildRelationships();
    createSvgOverlay();
    bindConnectionEvents();
  }

  function buildRelationships() {
    const rels = {};
    const renderedIds = new Set();
    document.querySelectorAll('.wm-item[data-conn-id]').forEach(el => renderedIds.add(el.dataset.connId));
    WM_EDGES.forEach(edge => {
      const a = getVisibleId(edge.from);
      const b = getVisibleId(edge.to);
      if (a === b) return; // parent and child connection ignored in macro view
      if (!renderedIds.has(a) || !renderedIds.has(b)) return;
      if (getLaneByBlockId(a) === getLaneByBlockId(b)) return;
      if (!rels[a]) rels[a] = []; if (!rels[b]) rels[b] = [];
      if (!rels[a].includes(b)) rels[a].push(b);
      if (!rels[b].includes(a)) rels[b].push(a);
    });
    return rels;
  }

  function createSvgOverlay() {
    const old = document.getElementById('wm-conn-svg'); if (old) old.remove();
    const wrap = document.querySelector('.wm-lanes-wrapper'); if (!wrap) return;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'wm-conn-svg'; svg.classList.add('wm-connection-svg');
    svg.innerHTML = `<defs><filter id="wm-glow"><feGaussianBlur stdDeviation="4"/><feComposite in="SourceGraphic" operator="over"/></filter></defs>`;
    wrap.appendChild(svg);
  }

  function bindConnectionEvents() {
    document.querySelectorAll('.wm-item[data-conn-id]').forEach(el => {
      const id = el.dataset.connId;
      const rels = connRelations[id];
      if (rels && rels.length > 0) el.classList.add('wm-item-has-conn');
      el.addEventListener('mouseenter', () => { clearTimeout(connClearTimer); showConnections(id); });
      el.addEventListener('mouseleave', () => { connClearTimer = setTimeout(clearConnections, 120); });
    });
    document.querySelectorAll('.wm-lane-body').forEach(b => b.addEventListener('scroll', redrawActiveConnections));
  }

  function showConnections(id) {
    if (mobileView.matches) return;
    clearConnections();
    connActiveId = id;
    const related = connRelations[id];
    if (!related) return;
    const srcEl = document.querySelector(`.wm-item[data-conn-id="${id}"]`);
    if (srcEl) srcEl.classList.add('wm-item-source');

    related.forEach(rid => {
      const el = document.querySelector(`.wm-item[data-conn-id="${rid}"]`);
      if (el) el.classList.add('wm-item-related');
    });
    document.querySelectorAll('.wm-item[data-conn-id]').forEach(el => {
      const cid = el.dataset.connId;
      if (cid !== id && !related.includes(cid)) el.classList.add('wm-item-dimmed');
    });

    // 第一步：尝试将所有关联项滚入视野
    related.forEach(rid => {
      const el = document.querySelector(`.wm-item[data-conn-id="${rid}"]`);
      if (!el) return;
      const laneBody = el.closest('.wm-lane-body');
      if (!laneBody) return;
      const elR = el.getBoundingClientRect(), lbR = laneBody.getBoundingClientRect();
      if (elR.top < lbR.top || elR.bottom > lbR.bottom) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    // 第二步：等滚动结束后绘制连线 + 检测仍然在屏幕外的项
    setTimeout(() => {
      if (connActiveId !== id) return; // 已经切换了
      related.forEach(rid => drawConnectionLine(id, rid));
      // 检测仍然在屏幕外的关联项，在源知识块旁边放置跳转按钮
      addOffscreenBadges(id, related);
    }, 350);
  }

  // 在源知识块旁边显示"跳转到屏幕外关联项"的徽章
  function addOffscreenBadges(srcId, relatedIds) {
    const srcEl = document.querySelector(`.wm-item[data-conn-id="${srcId}"]`);
    if (!srcEl) return;

    const offscreenItems = [];
    relatedIds.forEach(rid => {
      const el = document.querySelector(`.wm-item[data-conn-id="${rid}"]`);
      if (!el) return;
      const laneBody = el.closest('.wm-lane-body');
      if (!laneBody) return;
      const elR = el.getBoundingClientRect(), lbR = laneBody.getBoundingClientRect();
      if (elR.bottom < lbR.top - 3 || elR.top > lbR.bottom + 3) {
        // 找到该知识块的标题
        let title = rid;
        for (const lane of Object.values(WM_DATA)) {
          const item = lane.items.find(it => it.id === rid);
          if (item) { title = item.title; break; }
        }
        const isAbove = elR.bottom < lbR.top;
        offscreenItems.push({ rid, el, title, isAbove });
      }
    });

    if (offscreenItems.length === 0) return;

    // 创建一个徽章容器，挂在源知识块下方
    const badgeBox = document.createElement('div');
    badgeBox.className = 'wm-conn-edge-indicator';

    offscreenItems.forEach(({ rid, el, title, isAbove }) => {
      const arrow = isAbove ? '▲' : '▼';
      const shortTitle = title.length > 10 ? title.slice(0, 10) + '…' : title;
      const badge = document.createElement('button');
      badge.className = 'wm-conn-jump-btn';
      badge.textContent = `${arrow} ${shortTitle}`;
      badge.title = `点击跳转到: ${title}`;
      badge.addEventListener('click', (e) => {
        e.stopPropagation();
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(redrawActiveConnections, 350);
        // 重新检测
        setTimeout(() => {
          document.querySelectorAll('.wm-conn-edge-indicator').forEach(b => b.remove());
          if (connActiveId === srcId) {
            addOffscreenBadges(srcId, relatedIds);
          }
        }, 500);
      });
      badgeBox.appendChild(badge);
    });

    // 放在源知识块内部底部
    srcEl.style.position = 'relative';
    srcEl.appendChild(badgeBox);
  }

  function clearConnections() {
    connActiveId = null;
    const svg = document.getElementById('wm-conn-svg');
    if (svg) svg.querySelectorAll('.wm-conn-path, .wm-conn-grad').forEach(el => el.remove());
    document.querySelectorAll('.wm-item-source, .wm-item-related, .wm-item-dimmed').forEach(el => el.classList.remove('wm-item-source', 'wm-item-related', 'wm-item-dimmed'));
    document.querySelectorAll('.wm-conn-edge-indicator').forEach(el => el.remove());
  }

  function redrawActiveConnections() {
    if (!connActiveId) return;
    const rels = connRelations[connActiveId]; if (!rels) return;
    const svg = document.getElementById('wm-conn-svg');
    if (svg) svg.querySelectorAll('.wm-conn-path, .wm-conn-grad').forEach(el => el.remove());
    rels.forEach(rid => drawConnectionLine(connActiveId, rid));
  }

  function drawConnectionLine(srcId, tgtId) {
    const svg = document.getElementById('wm-conn-svg'), wrp = document.querySelector('.wm-lanes-wrapper');
    const sEl = document.querySelector(`.wm-item[data-conn-id="${srcId}"]`), tEl = document.querySelector(`.wm-item[data-conn-id="${tgtId}"]`);
    if (!svg || !wrp || !sEl || !tEl) return;
    const br = wrp.getBoundingClientRect(), sr = sEl.getBoundingClientRect(), tr = tEl.getBoundingClientRect();
    const lA = getLaneByBlockId(srcId), lB = getLaneByBlockId(tgtId);
    if (!lA || !lB || lA === lB) return; // Hide internal SVG lines because we use adsorption group

    const cA = WM_DATA[lA]?.color || '#232726', cB = WM_DATA[lB]?.color || '#232726';

    const tgtLaneBody = tEl.closest('.wm-lane-body');
    const srcLaneBody = sEl.closest('.wm-lane-body');

    function isVisibleInLane(elRect, laneBody) {
      if (!laneBody) return true;
      const lbr = laneBody.getBoundingClientRect();
      return elRect.top >= lbr.top - 5 && elRect.bottom <= lbr.bottom + 5;
    }

    function clampY(elRect, laneBody) {
      if (!laneBody) return elRect.top + elRect.height / 2;
      const lbr = laneBody.getBoundingClientRect();
      const centerY = elRect.top + elRect.height / 2;
      if (centerY < lbr.top) return lbr.top + 8;
      if (centerY > lbr.bottom) return lbr.bottom - 8;
      return centerY;
    }

    const srcVisible = isVisibleInLane(sr, srcLaneBody);
    const tgtVisible = isVisibleInLane(tr, tgtLaneBody);

    const rawSy = srcVisible ? (sr.top + sr.height / 2) : clampY(sr, srcLaneBody);
    const rawTy = tgtVisible ? (tr.top + tr.height / 2) : clampY(tr, tgtLaneBody);

    const sx = (sr.left + sr.width / 2 < tr.left + tr.width / 2) ? sr.right - br.left : sr.left - br.left;
    const sy = rawSy - br.top;
    const tx = (sr.left + sr.width / 2 < tr.left + tr.width / 2) ? tr.left - br.left : tr.right - br.left;
    const ty = rawTy - br.top;

    const dx = tx - sx, cp1x = sx + dx * 0.4, cp2x = sx + dx * 0.6;
    const d = `M ${sx},${sy} C ${cp1x},${sy} ${cp2x},${ty} ${tx},${ty}`;

    const gid = `g-${srcId}-${tgtId}`;
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    grad.id = gid; grad.classList.add('wm-conn-grad');
    grad.setAttribute('x1', sx); grad.setAttribute('y1', sy); grad.setAttribute('x2', tx); grad.setAttribute('y2', ty);
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.innerHTML = `<stop offset="0%" stop-color="${cA}" stop-opacity="0.6"/><stop offset="100%" stop-color="${cB}" stop-opacity="0.6"/>`;
    svg.querySelector('defs').appendChild(grad);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('wm-conn-path'); path.setAttribute('d', d); path.setAttribute('stroke', `url(#${gid})`);
    path.setAttribute('stroke-width', '2'); path.setAttribute('fill', 'none');
    if (!tgtVisible || !srcVisible) {
      path.setAttribute('stroke-dasharray', '6 3');
      path.setAttribute('stroke-opacity', '0.45');
    }
    svg.appendChild(path);
  }

  // ═══════════════════════════════════════
  //  所见即所得编辑系统 (WYSIWYG Edit Mode)
  // ═══════════════════════════════════════

  const LANE_OPTIONS = {
    'wm-1': '📚 事实与机制',
    'wm-2': '🎯 策略+执行',
    'wm-3': '📊 观测与反馈',
    'wm-4': '🛡️ 目标与底线'
  };

  function openEditModal(blockId) {
    const node = WM_NODE_MAP[blockId];
    if (!node) return;
    // Close any existing modal
    document.getElementById('wm-edit-overlay')?.remove();

    // Build the relation list for this block
    const rels = (connRelations[blockId] || []);
    // Also get relations from WM_EDGES for display
    const blockEdges = WM_EDGES.filter(e => e.from === blockId || e.to === blockId);

    const overlay = document.createElement('div');
    overlay.id = 'wm-edit-overlay';
    Object.assign(overlay.style, {
      position:'fixed', top:0, left:0, width:'100vw', height:'100vh',
      background:'#23272680', backdropFilter:'blur(4px)',
      zIndex:'90000', display:'flex', alignItems:'center', justifyContent:'center',
      animation:'wm-fadeIn 0.2s ease'
    });

    const allIds = Object.keys(WM_NODE_MAP).filter(id => id !== blockId);
    const relListHtml = blockEdges.map(e => {
      const otherId = e.from === blockId ? e.to : e.from;
      const otherNode = WM_NODE_MAP[otherId];
      const otherTitle = otherNode ? otherNode.title : otherId;
      return `<div class="wm-edit-rel-item" style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;background:#23272608;border-radius:6px;margin-bottom:4px;">
        <span style="font-size:12px;">↔ <strong>${otherTitle}</strong> <em style="opacity:0.5;font-size:11px;">(${e.type})</em></span>
        <button class="wm-edit-rel-del" data-src="${blockId}" data-tgt="${otherId}" style="background:#2f6556;color:#fafaf8;border:none;border-radius:4px;padding:2px 8px;font-size:11px;cursor:pointer;">删除</button>
      </div>`;
    }).join('') || '<div style="font-size:12px;opacity:0.4;padding:8px;">暂无关联</div>';

    overlay.innerHTML = `
      <div id="wm-edit-card" style="background:var(--md-default-bg-color,#fafaf8);border-radius:16px;width:520px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px #23272666;padding:28px 32px;font-family:Inter,sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="margin:0;font-size:1.1rem;font-weight:800;">&#fafaf888; 编辑知识卡片</h2>
          <button id="wm-edit-close" style="background:transparent;border:none;font-size:1.4rem;cursor:pointer;color:#fafaf8;font-weight:300;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;">&times;</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <label style="font-size:11px;font-weight:700;color:#232726;">ID
            <div style="font-size:14px;font-weight:600;color:var(--title,#232726);margin-top:2px;">${blockId}</div>
          </label>
          <label style="font-size:11px;font-weight:700;color:#232726;">标题
            <input id="wm-edit-title" value="${node.title.replace(/"/g,'&quot;')}" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #fafaf8;border-radius:8px;font-size:13px;margin-top:4px;">
          </label>
          <label style="font-size:11px;font-weight:700;color:#232726;">摘要
            <textarea id="wm-edit-summary" rows="2" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #fafaf8;border-radius:8px;font-size:13px;margin-top:4px;resize:vertical;">${node.summary}</textarea>
          </label>
          <div style="display:flex;gap:12px;">
            <label style="flex:1;font-size:11px;font-weight:700;color:#232726;">泳道
              <select id="wm-edit-lane" style="width:100%;padding:8px;border:1px solid #fafaf8;border-radius:8px;font-size:13px;margin-top:4px;">
                ${Object.entries(LANE_OPTIONS).map(([k,v]) => `<option value="${k}"${node.lane===k?' selected':''}>${v}</option>`).join('')}
              </select>
            </label>
          </div>
          <datalist id="wm-edit-ids">${allIds.map(id => `<option value="${id}">`).join('')}</datalist>
          <div style="border-top:1px solid #fafaf8;padding-top:14px;">
            <div style="font-size:12px;font-weight:700;color:#232726;margin-bottom:8px;">关联关系</div>
            <div id="wm-edit-rels">${relListHtml}</div>
            <div style="display:flex;gap:6px;margin-top:8px;">
              <input id="wm-edit-new-rel" list="wm-edit-ids" placeholder="输入目标块 ID" style="flex:1;padding:6px 10px;border:1px solid #fafaf8;border-radius:6px;font-size:12px;">
              <select id="wm-edit-rel-type" style="padding:6px;border:1px solid #fafaf8;border-radius:6px;font-size:12px;">
                <option value="关联">关联</option>
                <option value="支撑">支撑</option>
                <option value="依赖">依赖</option>
                <option value="驱动">驱动</option>
              </select>
              <button id="wm-edit-add-rel" style="padding:6px 14px;background:#2f6556;color:#fafaf8;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">添加</button>
            </div>
          </div>
          <div style="display:flex; gap:12px; margin-top:6px;">
            <button id="wm-edit-delete" style="flex:1; padding:12px; background:#2f65561a; color:#2f6556; border:1px solid #2f65564d; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer;" title="彻底从文档删除这个知识块设定">🗑️ 彻底删除</button>
            <button id="wm-edit-save" style="flex:2.5; padding:12px; background:linear-gradient(135deg,#2f6556,#2f6556); color:#fafaf8; border:none; border-radius:10px; font-size:14px; font-weight:700; cursor:pointer; box-shadow:0 4px 12px #2f65564d;">💾 保存修改</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('wm-edit-close').addEventListener('click', () => overlay.remove());

    // Save handler
    document.getElementById('wm-edit-save').addEventListener('click', async () => {
      const updates = {
        title: document.getElementById('wm-edit-title').value.trim(),
        summary: document.getElementById('wm-edit-summary').value.trim(),
        lane: document.getElementById('wm-edit-lane').value,
      };
      try {
        const r = await editApiPost('/api/update-block', {id: blockId, updates});
        if (r.success) {
          editToast('✅ 已保存，正在刷新视图...');
          overlay.remove();
          setTimeout(reloadGraphAndRender, 600);
        } else {
          editToast('❌ 保存失败: ' + r.message, false);
        }
      } catch (err) {
        editToast('❌ 后端无响应', false);
      }
    });

    // Delete block handler
    document.getElementById('wm-edit-delete').addEventListener('click', async () => {
      if (!confirm(`⚠️ 危险操作：\n确认要彻底删除知识块 "${node.title}" 吗？\n（注：该知识块对应的所有关联关系及其原文档中同名的那一整块正文内容都将被彻底抹除！）`)) return;
      try {
        const r = await editApiPost('/api/delete-block', {id: blockId});
        if (r.success) {
          editToast('🗑️ 已删除该知识块');
          overlay.remove();
          setTimeout(reloadGraphAndRender, 600);
        } else {
          editToast('❌ 删除失败: ' + r.message, false);
        }
      } catch (err) {
        editToast('❌ 后端无响应', false);
      }
    });

    // Add relation handler
    document.getElementById('wm-edit-add-rel').addEventListener('click', async () => {
      const tgtId = document.getElementById('wm-edit-new-rel').value.trim();
      const relType = document.getElementById('wm-edit-rel-type').value;
      if (!tgtId) return;
      try {
        const r = await editApiPost('/api/add-relation', {src: blockId, tgt: tgtId, type: relType});
        if (r.success) {
          editToast(`✅ 已添加关联: ${blockId} ↔ ${tgtId}`);
          overlay.remove();
          setTimeout(reloadGraphAndRender, 600);
        } else {
          editToast('❌ ' + r.message, false);
        }
      } catch { editToast('❌ 后端无响应', false); }
    });

    // Delete relation handlers
    overlay.querySelectorAll('.wm-edit-rel-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const src = btn.dataset.src, tgt = btn.dataset.tgt;
        try {
          const r = await editApiPost('/api/remove-relation', {src, tgt});
          if (r.success) {
            editToast(`✅ 已删除关联`);
            overlay.remove();
            setTimeout(reloadGraphAndRender, 600);
          } else {
            editToast('❌ ' + r.message, false);
          }
        } catch { editToast('❌ 后端无响应', false); }
      });
    });
  }

  function openCreateModal(sourceFile) {
    if (!sourceFile) return;
    document.getElementById('wm-edit-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'wm-edit-overlay';
    Object.assign(overlay.style, {
      position:'fixed', top:0, left:0, width:'100vw', height:'100vh',
      background:'#23272680', backdropFilter:'blur(4px)',
      zIndex:'90000', display:'flex', alignItems:'center', justifyContent:'center',
      animation:'wm-fadeIn 0.2s ease'
    });

    const allIds = Object.keys(WM_NODE_MAP);
    const domainSelectOpts = getAllDomains().map(d => `<option value="${d}">${d}</option>`).join('');

    overlay.innerHTML = `
      <div id="wm-edit-card" style="background:var(--md-default-bg-color,#fafaf8);border-radius:16px;width:520px;max-height:85vh;overflow-y:auto;box-shadow:0 20px 60px #23272666;padding:28px 32px;font-family:Inter,sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h2 style="margin:0;font-size:1.1rem;font-weight:800;">➕ 在当前文档新增知识块</h2>
          <button id="wm-edit-close" style="background:transparent;border:none;font-size:1.4rem;cursor:pointer;color:#fafaf8;font-weight:300;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border-radius:4px;">&times;</button>
        </div>
        <div style="font-size:11px;color:#232726;margin-bottom:12px;">目标文件：<strong style="color:var(--t1,#232726);">${sourceFile}</strong></div>
        <div style="display:flex;flex-direction:column;gap:14px;">
          <label style="font-size:11px;font-weight:700;color:#232726;">标题
            <input id="wm-new-title" placeholder="输入知识块标题" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #fafaf8;border-radius:8px;font-size:13px;margin-top:4px;">
          </label>
          <label style="font-size:11px;font-weight:700;color:#232726;">摘要
            <textarea id="wm-new-summary" placeholder="一句话概括核心" rows="2" style="width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #fafaf8;border-radius:8px;font-size:13px;margin-top:4px;resize:vertical;"></textarea>
          </label>
          <div style="display:flex;gap:12px;">
            <label style="flex:1;font-size:11px;font-weight:700;color:#232726;">泳道
              <select id="wm-new-lane" style="width:100%;padding:8px;border:1px solid #fafaf8;border-radius:8px;font-size:13px;margin-top:4px;">
                ${Object.entries(LANE_OPTIONS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
              </select>
            </label>
            <label style="flex:1;font-size:11px;font-weight:700;color:#232726;">领域 (Domain)
              <select id="wm-new-domain" style="width:100%;padding:8px;border:1px solid #fafaf8;border-radius:8px;font-size:13px;margin-top:4px;">
                ${domainSelectOpts}
              </select>
            </label>
          </div>
          <datalist id="wm-edit-ids">${allIds.map(id => `<option value="${id}">`).join('')}</datalist>
          
          <button id="wm-new-save" style="width:100%;padding:12px;background:linear-gradient(135deg,#2f6556,#2f6556);color:#fafaf8;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-top:10px;box-shadow:0 4px 12px #2f65564d;">🚀 创建并注入文档</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    document.getElementById('wm-edit-close').addEventListener('click', () => overlay.remove());

    document.getElementById('wm-new-save').addEventListener('click', async () => {
      const data = {
        title: document.getElementById('wm-new-title').value.trim(),
        summary: document.getElementById('wm-new-summary').value.trim(),
        lane: document.getElementById('wm-new-lane').value,
        domain: document.getElementById('wm-new-domain').value
      };
      if (!data.title) { editToast('标题不能为空', false); return; }
      
      try {
        const r = await editApiPost('/api/create-block', { source_file: sourceFile, data });
        if (r.success) {
          editToast('✅ 创建成功！正在刷新...', true);
          overlay.remove();
          setTimeout(reloadGraphAndRender, 600);
        } else {
          editToast('❌ ' + r.message, false);
        }
      } catch {
        editToast('❌ 后端无响应', false);
      }
    });
  }

  async function init() {
    if (!isWorldModelPage()) { exitFullscreenMode(); return; }
    enterFullscreenMode();
    await checkEditBackend();
    if (await loadGraphData()) renderDashboard();
  }

  init();
  if (typeof window.document$ !== 'undefined' && window.document$.subscribe) window.document$.subscribe(() => setTimeout(init, 60));
  window.addEventListener('popstate', () => setTimeout(init, 100));
})();
