// Integrated flow: request -> buffer -> scheduler -> memory -> Banker's check -> execute
function initFlow() {
  $('#flow').innerHTML = `<h2>Full run</h2>
  <p class="note">All four modules on your transactions. Pick the algorithms, then watch each transaction pass through the buffer, scheduler, memory and the Banker's check.</p>
  <label>Scheduling <select id="fs"><option>Priority</option><option>SJF</option><option>FCFS</option></select></label>
  <label>Memory <select id="fm"><option>First Fit</option><option>Best Fit</option><option>Worst Fit</option></select></label>
  <label>Buffer size <input type="number" id="fb" min="2" max="8" value="${PC.size}"></label>
  <button class="go" id="fr">Replay animation</button><div id="fo"></div>`;
  ['fs', 'fm', 'fb'].forEach(id => $('#' + id).onchange = runFlow);
  $('#fr').onclick = runFlow; runFlow();
}

// Each transaction asks for its full remaining need. Granted only if the state stays safe.
// Finished transactions release everything; waiting ones are retried.
function bankerRun(order) {
  let A = BA.map(r => [...r]), M = BM.map(r => [...r]), V = [...BV];
  const out = {}, seq = []; let pend = order.map(t => t.id), prog = true;
  while (pend.length && prog) {
    prog = false;
    pend = pend.filter(id => {
      const i = +id.slice(1) - 1;
      if (i >= A.length) { out[id] = { ok: false, msg: 'no resource data' }; return false; }
      const need = M[i].map((x, j) => x - A[i][j]);
      if (need.some((x, j) => x > V[j])) { out[id] = { ok: false, msg: 'waits: not enough free resources' }; return true; }
      const A2 = A.map(r => [...r]); A2[i] = A2[i].map((x, j) => x + need[j]);
      const V2 = V.map((x, j) => x - need[j]);
      if (!safety(A2, M, V2).safe) { out[id] = { ok: false, msg: 'denied: state would be unsafe' }; return true; }
      out[id] = { ok: true, msg: `granted [${need}]${out[id] ? ' after waiting' : ''}` }; seq.push(id);
      V = V2.map((x, j) => x + A2[i][j]); A[i] = A[i].map(() => 0); M[i] = M[i].map(() => 0);
      prog = true; return false;
    });
  }
  return { out, seq };
}

function runFlow() {
  readB();
  PC.size = Math.min(8, Math.max(2, PC.buf.length, +$('#fb').value || 5)); $('#fb').value = PC.size;
  if ($('#pb')) $('#pb').value = PC.size; pcRender();
  const order = schedule($('#fs').value), { res } = memAlloc($('#fm').value, order), bk = bankerRun(order);
  const arrival = [...TX].sort((a, b) => a.at - b.at).map(t => t.id), free = PC.size - PC.buf.length;
  const d = (i, k) => `style="animation-delay:${(i * 5 + k) * 170}ms"`;
  let done = 0;
  const rows = res.map((r, i) => {
    const k = arrival.indexOf(r.t.id), b = bk.out[r.t.id] || { ok: false, msg: '-' };
    const ok = r.p && b.ok; if (ok) done++;
    return `<tr><td class="pop2" ${d(i, 0)}><span class="chip" style="background:hsl(${hue(r.t.id)} 62% 42%)">${r.t.id}</span> ${r.t.name}</td>
    <td class="pop2" ${d(i, 1)}>${k < free ? 'queued in slot ' + (PC.buf.length + k + 1) : '<span class="warn">waits for an empty slot</span>'}</td>
    <td class="pop2" ${d(i, 2)}>wait ${r.t.wt}, turnaround ${r.t.tat}</td>
    <td class="pop2" ${d(i, 3)}>${r.p ? 'P' + (r.p.i + 1) + ' (' + r.p.size + ' KB)' : '<span class="bad">no free block</span>'}</td>
    <td class="pop2" ${d(i, 4)}>${b.ok ? b.msg : '<span class="bad">' + b.msg + '</span>'}</td>
    <td class="pop2" ${d(i, 4)}>${ok ? '<span class="pill">Executes</span>' : '<span class="bad">Blocked</span>'}</td></tr>`;
  }).join('');
  $('#fo').innerHTML = `<table><tr><th>Run order (${$('#fs').value})</th><th class="h1">1. Buffer</th><th class="h2">2. Scheduler</th><th class="h3">3. Memory (${$('#fm').value})</th><th class="h4">4. Banker's check</th><th>Result</th></tr>${rows}</table>
  <div class="banner ${done == res.length ? '' : 'no'} pop2" ${d(res.length, 0)}><b>${done} of ${res.length} transactions execute.</b>
  Resources granted in this order: ${bk.seq.length ? bk.seq.join(' → ') : 'none'}. The request buffer tab already holds ${PC.buf.length} live request(s), leaving ${free} free slot(s).</div>`;
}
