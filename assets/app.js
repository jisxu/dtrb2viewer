let allNodes = [];
let allEdges = [];
let nodeMap = {};
let imageMap = {};
let network = null;
let visNodes = null;
let visEdges = null;
let selectedNode = null;
let currentFilter = 'all';
let currentCollectFilter = 'all';
let collectedSet = new Set();

const stageColors = {
    '数码蛋':    { bg: '#a3a3a3', border: '#d4d4d4', highlight: { bg: '#d4d4d4', border: '#e5e5e5' } },
    '幼年期I':   { bg: '#7c3aed', border: '#a78bfa', highlight: { bg: '#8b5cf6', border: '#c4b5fd' } },
    '幼年期II':  { bg: '#8b5cf6', border: '#c4b5fd', highlight: { bg: '#a78bfa', border: '#ddd6fe' } },
    '成长期':    { bg: '#10b981', border: '#6ee7b7', highlight: { bg: '#34d399', border: '#a7f3d0' } },
    '成熟期':    { bg: '#3b82f6', border: '#93c5fd', highlight: { bg: '#60a5fa', border: '#bfdbfe' } },
    '完全体':    { bg: '#f59e0b', border: '#fcd34d', highlight: { bg: '#fbbf24', border: '#fde68a' } },
    '究极体':    { bg: '#ef4444', border: '#fca5a5', highlight: { bg: '#f87171', border: '#fecaca' } },
    '超究极':    { bg: '#ec4899', border: '#f9a8d4', highlight: { bg: '#f472b6', border: '#fbcfe8' } },
    '装甲体':    { bg: '#06b6d4', border: '#67e8f9', highlight: { bg: '#22d3ee', border: '#a5f3fc' } },
    '无等级':    { bg: '#6b7280', border: '#d1d5db', highlight: { bg: '#9ca3af', border: '#e5e7eb' } },
    '':          { bg: '#4b5563', border: '#9ca3af', highlight: { bg: '#6b7280', border: '#d1d5db' } }
};

const stageOrder = ['数码蛋', '幼年期I', '幼年期II', '成长期', '成熟期', '完全体', '究极体', '超究极', '装甲体', '无等级', ''];

function getStageColor(stage) {
    return stageColors[stage] || stageColors[''];
}

function getNodeSize(stage) {
    const sizes = {
        '数码蛋': 16, '幼年期I': 20, '幼年期II': 24, '成长期': 30,
        '成熟期': 36, '完全体': 42, '究极体': 48,
        '超究极': 54, '装甲体': 34, '无等级': 30, '': 26
    };
    return sizes[stage] || 26;
}

function getImagePath(name) {
    return imageMap[name] ? 'images/' + imageMap[name] : null;
}

function cloneTemplate(id) {
    const tpl = document.getElementById(id);
    return tpl.content.cloneNode(true);
}

async function loadData() {
    const [evoResp, imgResp] = await Promise.all([
        fetch('evolution_data.json'),
        fetch('images/image_map.json')
    ]);
    const evoData = await evoResp.json();
    imageMap = await imgResp.json();

    allNodes = evoData.nodes;
    allEdges = evoData.edges;
    allNodes.forEach(n => { nodeMap[n.name] = n; });

    loadCollection();
    renderList();
    initNetwork();
    updateStats();
}

function loadCollection() {
    try {
        const saved = localStorage.getItem('dtrb2_collection');
        if (saved) {
            const arr = JSON.parse(saved);
            collectedSet = new Set(arr);
        }
    } catch (e) {
        collectedSet = new Set();
    }
}

function saveCollection() {
    try {
        localStorage.setItem('dtrb2_collection', JSON.stringify([...collectedSet]));
    } catch (e) {}
}

function toggleCollection(name, event) {
    if (event) event.stopPropagation();
    if (collectedSet.has(name)) {
        collectedSet.delete(name);
    } else {
        collectedSet.add(name);
    }
    saveCollection();
    renderList();
    updateStats();
}

function isCollected(name) {
    return collectedSet.has(name);
}

function renderList() {
    const container = document.getElementById('digimon-list');
    const search = document.getElementById('search-input').value.toLowerCase();

    let filtered = allNodes.filter(n => {
        if (currentFilter !== 'all' && n.stage !== currentFilter) return false;
        if (search && !n.name.toLowerCase().includes(search)) return false;
        if (currentCollectFilter === 'collected' && !isCollected(n.name)) return false;
        if (currentCollectFilter === 'uncollected' && isCollected(n.name)) return false;
        return true;
    });

    filtered.sort((a, b) => {
        const sa = stageOrder.indexOf(a.stage);
        const sb = stageOrder.indexOf(b.stage);
        if (sa !== sb) return sa - sb;
        return a.name.localeCompare(b.name);
    });

    container.innerHTML = '';
    filtered.forEach(n => {
        const frag = cloneTemplate('tpl-digimon-item');
        const item = frag.querySelector('.digimon-item');
        const imgPath = getImagePath(n.name);
        const collected = isCollected(n.name);

        item.dataset.name = n.name;
        if (selectedNode === n.name) item.classList.add('selected');
        if (collected) item.classList.add('collected');
        item.onclick = () => selectDigimon(n.name);

        const img = frag.querySelector('.thumb');
        const placeholder = frag.querySelector('.thumb-placeholder');
        if (imgPath) {
            img.src = imgPath;
            img.alt = n.name;
            placeholder.style.display = 'none';
        } else {
            img.style.display = 'none';
        }

        frag.querySelector('.name').textContent = n.name;

        const stageTag = frag.querySelector('.stage-tag');
        stageTag.textContent = n.stage || '未知';
        stageTag.className = 'stage-tag stage-' + n.stage;

        const collectBtn = frag.querySelector('.collect-btn');
        if (collected) {
            collectBtn.classList.add('collected');
            collectBtn.textContent = '✓';
        }
        collectBtn.title = collected ? '取消收录' : '标记收录';
        collectBtn.onclick = (e) => toggleCollection(n.name, e);

        container.appendChild(frag);
    });
}

function initNetwork() {
    const container = document.getElementById('network');

    visNodes = new vis.DataSet(allNodes.map(n => {
        const sc = getStageColor(n.stage);
        const imgPath = getImagePath(n.name);
        const size = getNodeSize(n.stage);

        if (imgPath) {
            return {
                id: n.name,
                label: n.name,
                title: `${n.name}\n阶段: ${n.stage || '未知'}\n类型: ${n.type || '-'}\n元素: ${n.element || '-'}\n属性: ${n.attribute || '-'}`,
                shape: 'image',
                image: imgPath,
                size: size,
                font: { color: '#e0e0e0', size: 11, strokeWidth: 3, strokeColor: '#0a0e17' },
                color: { border: sc.border, highlight: { border: sc.border } },
                borderWidth: 2,
                brokenImage: null
            };
        }

        return {
            id: n.name,
            label: n.name,
            title: `${n.name}\n阶段: ${n.stage || '未知'}\n类型: ${n.type || '-'}\n元素: ${n.element || '-'}\n属性: ${n.attribute || '-'}`,
            color: { background: sc.bg, border: sc.border, highlight: sc.highlight },
            font: { color: '#e0e0e0', size: 11, strokeWidth: 3, strokeColor: '#0a0e17' },
            size: size,
            shape: 'dot',
            borderWidth: 2
        };
    }));

    visEdges = new vis.DataSet(allEdges.map((e, i) => ({
        id: i,
        from: e.from,
        to: e.to,
        title: e.condition,
        arrows: 'to',
        color: { color: '#4b5563', highlight: '#3b82f6', opacity: 0.6 },
        width: 1,
        smooth: { type: 'continuous' }
    })));

    const options = {
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -120,
                centralGravity: 0.008,
                springLength: 150,
                springConstant: 0.03,
                damping: 0.55
            },
            stabilization: { iterations: 300 }
        },
        interaction: {
            hover: true,
            tooltipDelay: 100,
            zoomView: true,
            dragView: true,
            multiselect: true
        },
        nodes: {
            font: { face: 'Microsoft YaHei' }
        },
        edges: {
            font: { size: 0 },
            smooth: { type: 'continuous' }
        }
    };

    network = new vis.Network(container, { nodes: visNodes, edges: visEdges }, options);

    network.on('click', function(params) {
        if (params.nodes.length > 0) {
            selectDigimon(params.nodes[0]);
        } else {
            hideInfo();
        }
    });

    network.on('stabilizationIterationsDone', function() {
        network.setOptions({ physics: { enabled: false } });
    });
}

function findEvolutionChain(name) {
    const ancestors = [];
    const descendants = [];
    const visitedAncestors = new Set();
    const visitedDescendants = new Set();

    function findAncestors(nodeName, depth) {
        allEdges.forEach(e => {
            if (e.to === nodeName && !visitedAncestors.has(e.from)) {
                visitedAncestors.add(e.from);
                ancestors.push({ name: e.from, depth: depth + 1 });
                findAncestors(e.from, depth + 1);
            }
        });
    }

    function findDescendants(nodeName, depth) {
        allEdges.forEach(e => {
            if (e.from === nodeName && !visitedDescendants.has(e.to)) {
                visitedDescendants.add(e.to);
                descendants.push({ name: e.to, depth: depth + 1 });
                findDescendants(e.to, depth + 1);
            }
        });
    }

    findAncestors(name, 0);
    findDescendants(name, 0);

    return { ancestors, descendants };
}

function layoutChain(chain, centerName) {
    const { ancestors, descendants } = chain;
    const spacingX = 250;
    const spacingY = 100;

    function groupByDepth(items) {
        const groups = {};
        items.forEach(item => {
            if (!groups[item.depth]) groups[item.depth] = [];
            groups[item.depth].push(item.name);
        });
        return groups;
    }

    const ancestorGroups = groupByDepth(ancestors);
    const descendantGroups = groupByDepth(descendants);

    const updates = [];
    const centerX = 0;
    const centerY = 0;

    updates.push({
        id: centerName,
        x: centerX,
        y: centerY,
        fixed: { x: true, y: true }
    });

    Object.keys(ancestorGroups).forEach(depth => {
        const nodes = ancestorGroups[depth];
        const x = centerX - parseInt(depth) * spacingX;
        const totalHeight = (nodes.length - 1) * spacingY;
        nodes.forEach((nodeName, i) => {
            updates.push({
                id: nodeName,
                x: x,
                y: centerY - totalHeight / 2 + i * spacingY,
                fixed: { x: true, y: true }
            });
        });
    });

    Object.keys(descendantGroups).forEach(depth => {
        const nodes = descendantGroups[depth];
        const x = centerX + parseInt(depth) * spacingX;
        const totalHeight = (nodes.length - 1) * spacingY;
        nodes.forEach((nodeName, i) => {
            updates.push({
                id: nodeName,
                x: x,
                y: centerY - totalHeight / 2 + i * spacingY,
                fixed: { x: true, y: true }
            });
        });
    });

    return updates;
}

function createEvoItem(name, condition) {
    const frag = cloneTemplate('tpl-evo-item');
    const item = frag.querySelector('.evo-item');
    const imgPath = getImagePath(name);

    item.dataset.name = name;
    item.onclick = () => selectDigimon(name);

    const img = frag.querySelector('.evo-thumb');
    const placeholder = frag.querySelector('.evo-thumb-placeholder');
    if (imgPath) {
        img.src = imgPath;
        img.alt = name;
        placeholder.style.display = 'none';
    } else {
        img.style.display = 'none';
    }

    frag.querySelector('.evo-name').textContent = name;
    frag.querySelector('.evo-cond').textContent = condition;

    return frag;
}

function selectDigimon(name) {
    selectedNode = name;
    renderList();

    const chain = findEvolutionChain(name);
    const chainNodes = new Set([name, ...chain.ancestors.map(a => a.name), ...chain.descendants.map(d => d.name)]);
    const chainEdges = new Set();

    allEdges.forEach((e, i) => {
        if (chainNodes.has(e.from) && chainNodes.has(e.to)) {
            chainEdges.add(i);
        }
    });

    const layoutUpdates = layoutChain(chain, name);

    const updates = allNodes.map(n => {
        const sc = getStageColor(n.stage);
        const inChain = chainNodes.has(n.name);
        const isCenter = n.name === name;
        const imgPath = getImagePath(n.name);

        if (!inChain) {
            return {
                id: n.name,
                opacity: 0,
                hidden: true,
                fixed: { x: true, y: true }
            };
        }

        if (imgPath) {
            return {
                id: n.name,
                opacity: 1,
                hidden: false,
                size: isCenter ? getNodeSize(n.stage) * 1.6 : getNodeSize(n.stage),
                font: { color: '#fff', size: isCenter ? 14 : 11, strokeWidth: 3, strokeColor: '#0a0e17' },
                color: { border: isCenter ? '#60a5fa' : sc.border },
                fixed: { x: false, y: false }
            };
        }

        return {
            id: n.name,
            opacity: 1,
            hidden: false,
            size: isCenter ? getNodeSize(n.stage) * 1.6 : getNodeSize(n.stage),
            font: { color: '#fff', size: isCenter ? 14 : 11, strokeWidth: 3, strokeColor: '#0a0e17' },
            color: { background: sc.bg, border: isCenter ? '#60a5fa' : sc.border, highlight: sc.highlight },
            fixed: { x: false, y: false }
        };
    });
    visNodes.update([...updates, ...layoutUpdates]);

    const edgeUpdates = allEdges.map((e, i) => {
        if (!chainEdges.has(i)) {
            return { id: i, hidden: true, color: { opacity: 0 }, width: 0 };
        }
        if (e.to === name) {
            return { id: i, hidden: false, color: { color: '#10b981', highlight: '#34d399', opacity: 0.9 }, width: 3 };
        }
        if (e.from === name) {
            return { id: i, hidden: false, color: { color: '#f59e0b', highlight: '#fbbf24', opacity: 0.9 }, width: 3 };
        }
        return { id: i, hidden: false, color: { color: '#3b82f6', highlight: '#60a5fa', opacity: 0.7 }, width: 2 };
    });
    visEdges.update(edgeUpdates);

    network.focus(name, { scale: 1.2, animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    showInfo(name);
}

function showInfo(name) {
    const node = nodeMap[name];
    if (!node) return;

    const evolvesFrom = allEdges.filter(e => e.to === name);
    const evolvesTo = allEdges.filter(e => e.from === name);

    const panel = document.getElementById('info-panel');
    panel.innerHTML = '';
    const frag = cloneTemplate('tpl-info-panel');

    const imgPath = getImagePath(name);
    const avatar = frag.querySelector('.avatar');
    if (imgPath) {
        avatar.src = imgPath;
        avatar.alt = name;
    } else {
        avatar.style.display = 'none';
    }

    frag.querySelector('.info-title').textContent = name;

    const stageTag = frag.querySelector('.info-value .stage-tag');
    stageTag.textContent = node.stage || '未知';
    stageTag.className = 'stage-tag stage-' + node.stage;

    if (node.type) {
        const row = frag.querySelector('.info-type');
        row.style.display = '';
        row.querySelector('.info-value').textContent = node.type;
    }

    if (node.element) {
        const row = frag.querySelector('.info-element');
        row.style.display = '';
        row.querySelector('.info-value').textContent = node.element;
    }

    if (node.attribute) {
        const row = frag.querySelector('.info-attribute');
        row.style.display = '';
        row.querySelector('.info-value').textContent = node.attribute;
    }

    if (evolvesFrom.length > 0) {
        const section = frag.querySelector('.evo-from');
        section.style.display = '';
        section.querySelector('h4').textContent = `进化来源 (${evolvesFrom.length})`;
        const list = section.querySelector('.evo-list');
        evolvesFrom.forEach(e => {
            list.appendChild(createEvoItem(e.from, e.condition));
        });
    }

    if (evolvesTo.length > 0) {
        const section = frag.querySelector('.evo-to');
        section.style.display = '';
        section.querySelector('h4').textContent = `可进化为 (${evolvesTo.length})`;
        const list = section.querySelector('.evo-list');
        evolvesTo.forEach(e => {
            list.appendChild(createEvoItem(e.to, e.condition));
        });
    }

    panel.appendChild(frag);
    panel.style.display = 'block';
}

function hideInfo() {
    document.getElementById('info-panel').style.display = 'none';
    selectedNode = null;
    renderList();
    resetNodeStyles();
}

function resetNodeStyles() {
    const updates = allNodes.map(n => {
        const sc = getStageColor(n.stage);
        const imgPath = getImagePath(n.name);

        if (imgPath) {
            return {
                id: n.name,
                opacity: 1,
                hidden: false,
                size: getNodeSize(n.stage),
                font: { color: '#e0e0e0', size: 11, strokeWidth: 3, strokeColor: '#0a0e17' },
                color: { border: sc.border },
                fixed: { x: false, y: false }
            };
        }

        return {
            id: n.name,
            opacity: 1,
            hidden: false,
            size: getNodeSize(n.stage),
            font: { color: '#e0e0e0', size: 11, strokeWidth: 3, strokeColor: '#0a0e17' },
            color: { background: sc.bg, border: sc.border, highlight: sc.highlight },
            fixed: { x: false, y: false }
        };
    });
    visNodes.update(updates);

    const edgeUpdates = allEdges.map((e, i) => ({
        id: i,
        hidden: false,
        color: { color: '#4b5563', highlight: '#3b82f6', opacity: 0.6 },
        width: 1
    }));
    visEdges.update(edgeUpdates);

    network.setOptions({ physics: { enabled: true } });
}

function resetView() {
    network.fit({ animation: true });
    hideInfo();
}

function showAll() {
    hideInfo();
    network.fit({ animation: true });
}

function updateStats() {
    const total = allNodes.length;
    const collected = collectedSet.size;
    const percent = total > 0 ? Math.round((collected / total) * 100) : 0;

    const statsEl = document.getElementById('stats');
    statsEl.innerHTML = '';
    const frag = cloneTemplate('tpl-stats');

    frag.querySelector('.stat-total').textContent = total;
    frag.querySelector('.stat-collected').textContent = collected;
    frag.querySelector('.stat-edges').textContent = allEdges.length;
    frag.querySelector('.progress-fill').style.width = percent + '%';
    frag.querySelector('.stat-percent span').textContent = percent + '%';

    statsEl.appendChild(frag);
}

document.getElementById('search-input').addEventListener('input', renderList);

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.stage;
        renderList();
    });
});

document.querySelectorAll('.collect-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.collect-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCollectFilter = btn.dataset.collect;
        renderList();
    });
});

loadData();
