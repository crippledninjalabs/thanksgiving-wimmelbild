// Numeric checks: IK reach for every clip sample, and planted-foot slide (world metres) in locomotion.
const fs = require('fs'), vm = require('vm');
const ctx = { console, Math, JSON }; ctx.globalThis = ctx; vm.createContext(ctx);
for (const f of ['style', 'rig', 'clips']) vm.runInContext(fs.readFileSync(__dirname + '/../js/' + f + '.js', 'utf8'), ctx);
const { rig: R, clips: C, style: S } = ctx.TF3;
const clips = { optimus: [C.idle('optimus'), C.walk(), C.carryWalk(), C.pushCart(), C.reachGrabPlace(), C.weld(), C.climb()],
  elon: [C.elonIdle(), C.walk('elon'), C.armsCrossed(), C.bite(), C.rideLift()] };
for (const who in clips) for (const c of clips[who]) {
  let bad = [];
  for (let i = 0; i <= 200; i++) { const sk = R.skeleton(c.sample(i / 200), S[who].dims); if (!sk.ok) bad.push(i / 200); }
  console.log(who.padEnd(8), c.name.padEnd(18), bad.length ? 'UNREACHED at ph ' + bad.slice(0, 6).map(v => v.toFixed(3)).join(',') + (bad.length > 6 ? '...(' + bad.length + ')' : '') : 'ik ok');
}
for (const who of ['optimus', 'elon']) {
  const plan = C.locomotion({ who, dist: 3.1, step: who === 'elon' ? 0.72 : 0.62, h: 0.52 });
  let maxSlide = 0, prev = {};
  const fd = S[who].dims.foot;
  for (let t = 0; t <= plan.duration; t += 1 / 120) {
    const r = plan.at(t);
    for (const s of ['N', 'F']) {
      const ft = r.pose['foot' + s], g = R.footFromHeel(ft.heel, ft.p, fd);
      const planted = ft.p >= 0 ? g.heel[1] < 1e-6 : g.toe[1] < 1e-6;
      const cp = (ft.p >= 0 ? g.heel[0] : g.toe[0]) + r.x;
      if (planted && prev[s] && prev[s].planted && prev[s].pivot === (ft.p >= 0)) maxSlide = Math.max(maxSlide, Math.abs(cp - prev[s].cp));
      prev[s] = { planted, cp, pivot: ft.p >= 0 };
    }
    if (!R.skeleton(r.pose, S[who].dims).ok) console.log(who, 'loco unreached t', t.toFixed(2));
  }
  console.log(who, 'locomotion steps', plan.steps, 'duration', plan.duration.toFixed(2), 's; max planted-foot slide per frame (m):', maxSlide.toExponential(2));
}
