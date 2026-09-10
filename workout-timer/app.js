const $ = (id) => document.getElementById(id);
const form = $('settings');
const inputs = [...form.elements];
const labels = { wait: ['开始前等待', '给自己一点准备的时间'], work: ['运动中', '保持呼吸，专注当下'], rest: ['组间休息', '放松一下，下一组继续'], done: ['训练完成', '做得很好，记得补充水分'] };
let plan = [];
let state = 'idle';
let elapsed = 0;
let startedAt = 0;
let interval;
let lastPhase = '';
function settings() { return Object.fromEntries(inputs.map((input) => [input.name, Number(input.value)])); }
function format(seconds) { return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`; }
function renderDots(round, count) {
  $('round-dots').replaceChildren();
  for (let i = 1; i <= Math.min(count, 20); i++) {
    const dot = document.createElement('i');
    if (i <= Math.ceil(round / count * Math.min(count, 20))) dot.className = 'active';
    $('round-dots').append(dot);
  }
}
function preview() {
  if (!form.checkValidity()) { $('total').textContent = '请填写有效数值'; return; }
  const config = settings();
  const total = config.wait + config.work * config.rounds + config.rest * (config.rounds - 1);
  $('total').textContent = `${Math.floor(total / 60)} 分 ${total % 60} 秒`;
  $('time').textContent = format(config.wait || config.work);
  $('phase').textContent = config.wait ? labels.wait[0] : '准备运动';
  $('round').textContent = `共 ${config.rounds} 组`;
  renderDots(0, config.rounds);
}
function render() {
  const current = WorkoutTimer.locate(plan, elapsed + (state === 'running' ? performance.now() - startedAt : 0));
  $('time').textContent = format(current.remaining);
  $('phase').textContent = labels[current.type][0];
  $('hint').textContent = labels[current.type][1];
  $('round').textContent = `第 ${current.round} / ${settings().rounds} 组`;
  $('dial').style.setProperty('--progress', `${current.progress * 100}%`);
  $('dial').style.setProperty('--accent', current.type === 'rest' ? '#9cbdc1' : '#acc77d');
  renderDots(current.type === 'wait' ? 0 : current.round, settings().rounds);
  const key = `${current.type}-${current.round}`;
  if (lastPhase !== key) {
    $('announcement').textContent = current.type === 'done' ? '全部完成！今天的努力已达成。' : `${labels[current.type][0]} · 第 ${current.round} 组`;
    lastPhase = key;
  }
  if (current.type === 'done') {
    clearInterval(interval);
    state = 'done';
    $('start').textContent = '↻ 再来一次';
    $('status').textContent = '训练完成';
  }
}
function reset() {
  clearInterval(interval);
  state = 'idle'; elapsed = 0; lastPhase = '';
  inputs.forEach((input) => { input.disabled = false; });
  $('status').textContent = '准备就绪';
  $('start').textContent = '▶ 开始运动';
  $('hint').textContent = labels.wait[1];
  $('announcement').textContent = '准备好了，就从这里开始。';
  $('dial').style.setProperty('--progress', '0%');
  preview();
}
$('start').addEventListener('click', () => {
  if (state === 'running') {
    elapsed += performance.now() - startedAt;
    state = 'paused';
    clearInterval(interval);
    render();
    if (state === 'done') return;
    $('status').textContent = '已暂停';
    $('start').textContent = '▶ 继续运动';
    $('announcement').textContent = '计时已暂停，准备好后继续。';
    return;
  }
  if (state === 'idle' || state === 'done') {
    if (!form.reportValidity()) return;
    plan = WorkoutTimer.buildPlan(settings()); elapsed = 0; lastPhase = '';
    inputs.forEach((input) => { input.disabled = true; });
  }
  state = 'running'; startedAt = performance.now();
  $('status').textContent = '训练进行中';
  $('start').textContent = 'Ⅱ 暂停';
  $('announcement').textContent = '计时进行中。';
  render();
  interval = setInterval(render, 100);
});
$('reset').addEventListener('click', reset);
form.addEventListener('input', preview);
form.addEventListener('submit', (event) => event.preventDefault());
document.addEventListener('visibilitychange', () => { if (state === 'running') render(); });
preview();
