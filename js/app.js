initSched(); initPC(); initMem(); initBank(); initFlow();
document.querySelectorAll('nav button').forEach(b => b.onclick = () => {
  document.querySelectorAll('nav button').forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('main section').forEach(s => s.hidden = s.id !== b.dataset.tab);
  if (b.dataset.tab === 'flow') runFlow();
  if (b.dataset.tab === 'mem') runMem();
});
