/* Shared by the browser and the dependency-free timing checks. */
(function (root) {
  function buildPlan({ wait, work, rounds, rest }) {
    const plan = [];
    if (wait > 0) plan.push({ type: 'wait', seconds: wait, round: 1 });
    for (let round = 1; round <= rounds; round++) {
      plan.push({ type: 'work', seconds: work, round });
      if (round < rounds && rest > 0) plan.push({ type: 'rest', seconds: rest, round });
    }
    return plan;
  }
  function locate(plan, elapsed) {
    let start = 0;
    for (const phase of plan) {
      const end = start + phase.seconds * 1000;
      if (elapsed < end) return { ...phase, remaining: Math.ceil((end - elapsed) / 1000), progress: (elapsed - start) / (end - start) };
      start = end;
    }
    return { type: 'done', remaining: 0, progress: 1, round: plan.at(-1).round };
  }
  const api = { buildPlan, locate };
  if (typeof module !== 'undefined') module.exports = api;
  else root.WorkoutTimer = api;
})(globalThis);
