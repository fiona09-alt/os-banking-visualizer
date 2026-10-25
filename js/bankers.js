// Module 4: Banker's algorithm (deadlock avoidance)
const BR = ['DB Connection', 'Txn Service', 'Cash Module'];
let BA = [[0,1,0],[2,0,0],[3,0,2],[2,1,1],[0,0,2]];   // Allocation
let BM = [[7,5,3],[3,2,2],[9,0,2],[2,2,2],[4,3,3]];   // Maximum
let BV = [3, 3, 2];                                    // Available

function safety(A, M, V) {
  const n = A.length, need = M.map((r, i) => r.map((x, j) => x - A[i][j]));
  let w = [...V]; const fin = Array(n).fill(false), seq = [], steps = [];
  let moved = true;
  while (moved) {
    moved = false;
    for (let i = 0; i < n; i++) if (!fin[i] && need[i].every((x, j) => x <= w[j])) {
      const before = [...w];
      w = w.map((x, j) => x + A[i][j]); fin[i] = true; seq.push(i); moved = true;
      steps.push(`T${i + 1}: Need [${need[i]}] <= Work [${before}], runs, releases resources, Work = [${w}]`);
    }
  }
  return { need, safe: fin.every(Boolean), seq, steps };
}

function readB() {
  const g = k => [...document.querySelectorAll(`#bank input[data-k="${k}"]`)];
  if (!g('A').length) return;
  const m = k => BA.map((_, i) => BR.map((_, j) => +g(k).find(e => e.dataset.i == i && e.dataset.j == j).value));
  BA = m('A'); BM = m('M'); BV = g('V').map(e => +e.value);
}

function grid(k, M) {
  return `<table><tr><th></th>${BR.map(r => `<th>${r}</th>`).join('')}</tr>${M.map((r, i) =>
    `<tr><td>T${i + 1}</td>${r.map((x, j) => `<td><input type="number" min="0" data-k="${k}" data-i="${i}" data-j="${j}" value="${x}"></td>`).join('')}</tr>`).join('')}</table>`;
}

function initBank() {
  $('#bank').innerHTML = `<h2>Banker's Algorithm</h2>
  <p class="note">Shared bank resources are only granted if the system stays in a safe state. Edit any number, then check safety.</p>
  <div class="grid"><div><b>Allocation</b>${grid('A', BA)}</div><div><b>Maximum</b>${grid('M', BM)}</div></div>
  <p><b>Available</b> ${BR.map((r, j) => `${r} <input type="number" min="0" data-k="V" data-j="${j}" value="${BV[j]}">`).join(' ')}</p>
  <button class="go" id="bc">Check safety</button>
  <p><b>Request a resource:</b> <select id="rp">${BA.map((_, i) => `<option value="${i}">T${i + 1}</option>`).join('')}</select>
  ${BR.map((r, j) => `<input type="number" min="0" id="rq${j}" value="${[1,0,2][j]}" title="${r}">`).join('')}
  <button class="alt" id="rb">Test request</button></p><div id="bo"></div>`;
  $('#bc').onclick = runBank; $('#rb').onclick = runReq; runBank();
}

function runBank() {
  readB();
  const r = safety(BA, BM, BV);
  $('#bo').innerHTML = `<table><tr><th>Need = Max - Allocation</th>${BR.map(x => `<th>${x}</th>`).join('')}</tr>
  ${r.need.map((n, i) => `<tr><td><b>T${i + 1}</b></td>${n.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table>
  <div class="banner ${r.safe ? '' : 'no'}"><b>${r.safe ? 'Safe state.' : 'Unsafe state.'}</b> ${r.safe ? 'Every transaction can finish in this order:' : 'No order lets every transaction finish.'}
  <div class="chips">${r.seq.map((i, k) => `${k ? '<span class="arrow">&rarr;</span>' : ''}<span class="chip" style="animation-delay:${k * 120}ms">T${i + 1}</span>`).join('')}</div></div>
  <ol class="log">${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>`;
}

function runReq() {
  readB();
  const i = +$('#rp').value, rq = BR.map((_, j) => +$('#rq' + j).value);
  const need = BM[i].map((x, j) => x - BA[i][j]); let msg;
  if (rq.some((x, j) => x > need[j])) msg = '<span class="bad">Denied:</span> request exceeds the maximum claim of T' + (i + 1) + '.';
  else if (rq.some((x, j) => x > BV[j])) msg = '<span class="warn">Wait:</span> resources are not available right now.';
  else {
    const A2 = BA.map(r => [...r]); A2[i] = A2[i].map((x, j) => x + rq[j]);
    const r = safety(A2, BM, BV.map((x, j) => x - rq[j]));
    msg = r.safe ? `<span class="ok">Granted.</span> The state stays safe: ${r.seq.map(k => 'T' + (k + 1)).join(' → ')}`
                 : '<span class="bad">Denied:</span> granting this request would leave the system in an unsafe state.';
  }
  runBank();
  $('#bo').insertAdjacentHTML('afterbegin', `<p><b>Request T${i + 1} [${rq}]:</b> ${msg}</p>`);
}
