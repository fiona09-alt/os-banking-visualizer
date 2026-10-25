var TX0 = JSON.parse(JSON.stringify(TX));
var HUES=[165,215,265,335,32];
function hue(id){return HUES[(+id.slice(1)-1)%5];}
// Module 1: CPU scheduling (non-preemptive FCFS / SJF / Priority)
function schedule(alg) {
  const p = TX.map(t => ({ ...t, done: false }));
  let time = 0; const order = [];
  while (order.length < p.length) {
    const ready = p.filter(x => !x.done && x.at <= time);
    if (!ready.length) { time = Math.min(...p.filter(x => !x.done).map(x => x.at)); continue; }
    ready.sort((a, b) => alg === 'FCFS' ? a.at - b.at
      : alg === 'SJF' ? a.bt - b.bt || a.at - b.at
      : a.pr - b.pr || a.at - b.at);
    const c = ready[0];
    c.start = time; time += c.bt; c.ct = time;
    c.tat = c.ct - c.at; c.wt = c.tat - c.bt; c.done = true;
    order.push(c);
  }
  return order;
}

function initSched() {
  $('#sched').innerHTML = `<h2>CPU Scheduling</h2>
  <p class="note">Each bank transaction is a process. Priority scheduling serves urgent withdrawals and transfers before balance inquiries.</p>
  <div id="si"></div><label>Algorithm <select id="sa"><option>Priority</option><option>SJF</option><option>FCFS</option></select></label>
  <button class="go" id="sr">Run scheduler</button>
  <div id="sg" class="gantt"></div><div id="st"></div>`;
  renderInputs(); $('#sr').onclick = runSched; $('#sa').onchange = runSched; runSched();
}

function runSched() {
  const o = schedule($('#sa').value);
  const avg = k => (o.reduce((s, p) => s + p[k], 0) / o.length).toFixed(2);
  const cmp = ['FCFS', 'SJF', 'Priority'].map(a => { const q = schedule(a), f = k => (q.reduce((t, p) => t + p[k], 0) / q.length).toFixed(2);
    return `<tr><td><b>${a}</b></td><td>${q.map(p => p.id).join(' → ')}</td><td>${f('wt')}</td><td>${f('tat')}</td></tr>`; }).join('');
  $('#sg').innerHTML = o.map((p, i) => `<div class="seg" style="flex:${p.bt};--h:${hue(p.id)};animation-delay:${i * 120}ms"><b>${p.id}</b><small>${p.start}-${p.ct}</small></div>`).join('');
  $('#st').innerHTML = `<div class="stats"><div class="stat"><b>${avg('wt')}</b><span>average waiting time</span></div>
  <div class="stat"><b>${avg('tat')}</b><span>average turnaround time</span></div>
  <div class="stat"><b>${o[o.length - 1].ct}</b><span>total time units</span></div></div>
  <table><tr><th>ID</th><th>Transaction</th><th>Arrival</th><th>Burst</th><th>Priority</th><th>Completion</th><th>Turnaround</th><th>Waiting</th></tr>
  ${o.map(p => `<tr><td><b>${p.id}</b></td><td>${p.name}</td><td>${p.at}</td><td>${p.bt}</td><td><span class="pill ${p.pr == 1 ? 'u' : ''}">${p.pr == 1 ? 'urgent' : p.pr == 2 ? 'normal' : 'low'}</span></td><td>${p.ct}</td><td>${p.tat}</td><td>${p.wt}</td></tr>`).join('')}</table>
  <b>Algorithm comparison</b><table><tr><th>Algorithm</th><th>Run order</th><th>Avg waiting</th><th>Avg turnaround</th></tr>${cmp}</table>
  <p class="note">Waiting = Turnaround - Burst. Turnaround = Completion - Arrival. The bar widths show burst time.</p>`;
}

function renderInputs() {
  $('#si').innerHTML = `<b>Transactions (edit any value, results update instantly)</b>
  <table><tr><th>ID</th><th>Transaction</th><th>Arrival</th><th>Burst</th><th>Priority</th><th>Memory (KB)</th></tr>
  ${TX.map((t, i) => `<tr><td><b>${t.id}</b></td><td><input data-i="${i}" data-f="name" value="${t.name}"></td>
  ${['at', 'bt', 'pr', 'mem'].map(f => `<td><input type="number" min="${f == 'bt' ? 1 : 0}" data-i="${i}" data-f="${f}" value="${t[f]}"></td>`).join('')}</tr>`).join('')}</table>
  <button class="alt" id="srs">Reset to defaults</button>
  <span class="note">Priority 1 is most urgent. Changes also apply to the Memory and Full run tabs.</span><br><br>`;
  document.querySelectorAll('#si input').forEach(e => e.oninput = () => {
    const t = TX[e.dataset.i], f = e.dataset.f;
    t[f] = f == 'name' ? e.value : Math.max(f == 'bt' ? 1 : 0, +e.value || 0);
    runSched();
  });
  $('#srs').onclick = () => { TX.forEach((t, i) => Object.assign(t, TX0[i])); renderInputs(); runSched(); };
}
