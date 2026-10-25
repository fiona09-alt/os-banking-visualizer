// Module 3: fixed-partition memory allocation (First / Best / Worst Fit)
let PARTS = [100, 500, 200, 300, 600];

function memAlloc(alg, list) {
  const parts = PARTS.map((s, i) => ({ i, size: s, tx: null }));
  const res = list.map(t => {
    let c = parts.filter(p => !p.tx && p.size >= t.mem);
    if (c.length) {
      c = alg === 'Best Fit' ? c.sort((a, b) => a.size - b.size)[0]
        : alg === 'Worst Fit' ? c.sort((a, b) => b.size - a.size)[0] : c[0];
      c.tx = t;
    } else c = null;
    return { t, p: c };
  });
  return { parts, res };
}

function initMem() {
  $('#mem').innerHTML = `<h2>Memory Management</h2>
  <p class="note">Each transaction needs a memory block when it is scheduled. Requests are allocated in priority-scheduling order.</p>
  <label>Algorithm <select id="ma"><option>First Fit</option><option>Best Fit</option><option>Worst Fit</option></select></label>
  <label>Partitions (KB) <input id="mp" size="22" value="${PARTS.join(', ')}"></label>
  <button class="go" id="mr">Allocate</button><div id="mo"></div>`;
  $('#mr').onclick = runMem; runMem();
}

function runMem() {
  const v = $('#mp').value.split(',').map(x => parseInt(x)).filter(x => x > 0);
  if (v.length) PARTS = v;
  const { parts, res } = memAlloc($('#ma').value, schedule('Priority'));
  const map = parts.map((p, i) => `<div class="mcell" style="flex:${p.size}"><div class="blk"><div class="used" style="width:${p.tx ? p.tx.mem / p.size * 100 : 0}%;--h:${p.tx ? hue(p.tx.id) : 0};animation-delay:${i * 100}ms">${p.tx ? p.tx.id : ''}</div></div><span class="cap">P${p.i + 1}<small>${p.size} KB</small></span></div>`).join('');
  const free = parts.filter(p => !p.tx), freeTotal = free.reduce((s, p) => s + p.size, 0);
  const internal = parts.filter(p => p.tx).reduce((s, p) => s + p.size - p.tx.mem, 0);
  const un = res.filter(r => !r.p), ext = un.some(r => freeTotal >= r.t.mem);
  $('#mo').innerHTML = `<div class="map">${map}</div><p class="note">Coloured part = memory used. Hatched part = wasted or free.</p>
  <div class="stats"><div class="stat"><b>${internal} KB</b><span>internal fragmentation</span></div><div class="stat"><b>${freeTotal} KB</b><span>free in ${free.length} unused blocks</span></div><div class="stat"><b>${res.length - un.length}/${res.length}</b><span>transactions placed</span></div></div>
  <table><tr><th>Transaction</th><th>Needs</th><th>Partition</th><th>Wasted in block</th></tr>
  ${res.map(r => `<tr><td><b>${r.t.id}</b> ${r.t.name}</td><td>${r.t.mem} KB</td><td>${r.p ? 'P' + (r.p.i + 1) + ' (' + r.p.size + ' KB)' : '<span class="bad">waiting</span>'}</td><td>${r.p ? r.p.size - r.t.mem + ' KB' : '-'}</td></tr>`).join('')}</table>
  <div class="banner ${un.length && !ext ? 'no' : ''}">${un.length ? (ext ? '<b>External fragmentation:</b> enough total free memory exists, but not in one block.' : '<b>Not enough free memory</b> for some transactions.') : 'All transactions were allocated.'}</div>`;
}
