// Module 2: bounded buffer with mutex + empty/full semaphores
const PC = { last: -1, size: 5, buf: [], n: 0, log: [], timer: null };
const SRC = ['ATM', 'Mobile App', 'Branch Counter'];

function pcLog(m) { PC.log.unshift(m); PC.log = PC.log.slice(0, 10); }

function produce() {
  if (PC.buf.length >= PC.size) pcLog('Producer BLOCKED: wait(empty) found 0 free slots');
  else {
    const t = TX[Math.floor(Math.random() * TX.length)];
    const item = `${SRC[Math.floor(Math.random() * 3)]}: ${t.name} #${++PC.n}`;
    PC.buf.push(item); PC.last = PC.buf.length - 1;
    pcLog(`wait(empty), wait(mutex), insert "${item}", signal(mutex), signal(full)`);
  }
  pcRender();
}

function consume() {
  if (!PC.buf.length) pcLog('Consumer BLOCKED: wait(full) found 0 items');
  else {
    const item = PC.buf.shift(); PC.last = -1;
    pcLog(`wait(full), wait(mutex), remove "${item}", signal(mutex), signal(empty)`);
  }
  pcRender();
}

function pcAuto() {
  if (PC.timer) { clearInterval(PC.timer); PC.timer = null; }
  else PC.timer = setInterval(() => Math.random() < 0.55 ? produce() : consume(), 800);
  $('#pa').textContent = PC.timer ? 'Stop auto run' : 'Auto run';
}

function initPC() {
  $('#pc').innerHTML = `<h2>Producer-Consumer Synchronization</h2>
  <p class="note">ATMs, the mobile app and branch counters produce requests. Transaction processors consume them. A mutex protects the buffer, and the empty/full semaphores make producers and consumers wait.</p>
  <button class="go" id="pp">Produce request</button><button class="go" id="pcn">Consume request</button><button class="alt" id="pa">Auto run</button> <label>Buffer size <input type="number" id="pb" min="2" max="8" value="${PC.size}"></label>
  <div class="slots" id="ps"></div><div class="stats" id="pm"></div><ul class="log" id="pl"></ul>`;
  $('#pb').onchange = () => { PC.size = Math.min(8, Math.max(2, PC.buf.length, +$('#pb').value || 5)); $('#pb').value = PC.size; pcRender(); };
  $('#pp').onclick = produce; $('#pcn').onclick = consume; $('#pa').onclick = pcAuto;
  pcRender();
}

function pcRender() {
  $('#ps').innerHTML = Array.from({ length: PC.size }, (_, i) => {
    const it = PC.buf[i], [src, rest] = it ? it.split(': ') : [];
    return `<div class="slot ${it ? 'full' : ''} ${i === PC.last ? 'pop' : ''}">${it ? `<em>${src}</em><b>${rest}</b>` : 'free slot'}</div>`; }).join('');
  const f = PC.buf.length;
  $('#pm').innerHTML = `<div class="stat"><b>1</b><span>mutex (buffer unlocked)</span></div><div class="stat"><b>${PC.size - f}</b><span>empty slots</span></div><div class="stat"><b>${f}</b><span>full slots</span></div>`;
  $('#pl').innerHTML = PC.log.map(l => `<li>${l}</li>`).join('');
}
