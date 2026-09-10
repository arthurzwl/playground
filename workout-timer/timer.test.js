const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildPlan, locate } = require('./timer');
test('默认训练为 135 秒，最后一组没有休息', () => {
  const plan = buildPlan({ wait: 5, work: 30, rounds: 3, rest: 20 });
  assert.equal(plan.reduce((sum, phase) => sum + phase.seconds, 0), 135);
  for (const [time, type, round, remaining] of [[0, 'wait', 1, 5], [5000, 'work', 1, 30], [35000, 'rest', 1, 20], [55000, 'work', 2, 30], [105000, 'work', 3, 30], [135000, 'done', 3, 0]]) {
    const current = locate(plan, time);
    assert.deepEqual([current.type, current.round, current.remaining], [type, round, remaining]);
  }
});
test('零等待、零休息以及单组训练', () => {
  const plan = buildPlan({ wait: 0, work: 1, rounds: 1, rest: 20 });
  assert.equal(plan.length, 1);
  assert.equal(locate(plan, 1000).type, 'done');
  const continuous = buildPlan({ wait: 0, work: 2, rounds: 3, rest: 0 });
  assert.equal(locate(continuous, 2000).round, 2);
  assert.equal(locate(continuous, 6000).type, 'done');
});
test('延迟唤醒直接定位正确阶段，倒计时向上取整', () => {
  const plan = buildPlan({ wait: 5, work: 30, rounds: 3, rest: 20 });
  assert.equal(locate(plan, 4999).remaining, 1);
  assert.deepEqual(locate(plan, 120500), { type: 'work', seconds: 30, round: 3, remaining: 15, progress: 15500 / 30000 });
  assert.equal(locate(plan, 999999).type, 'done');
});
