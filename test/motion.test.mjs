// Compare the browser motion port to poses dumped from reference/render_loop.py.
import fs from 'fs';
import { createSimulation, pyRound, rotatedSpriteSize, spriteCenter } from '../js/motion.js';

const root = new URL('..', import.meta.url);
const paths = JSON.parse(fs.readFileSync(new URL('motion/paths.json', root), 'utf8'));
const expected = JSON.parse(fs.readFileSync(new URL('expected.json', import.meta.url), 'utf8'));

let failed = 0;
function check(cond, message) {
  if (!cond) {
    failed += 1;
    console.error('FAIL', message);
  }
}
function near(a, b, tol, message) {
  if (!(Math.abs(a - b) <= tol)) {
    failed += 1;
    console.error(`FAIL ${message}: ${a} vs ${b} (tol ${tol})`);
  }
}

for (const row of expected.rounds) check(pyRound(row.x) === row.y, `pyRound(${row.x}) === ${row.y}, got ${pyRound(row.x)}`);

const sizes = {};
for (const [key, wh] of Object.entries(expected.sizes.cab)) sizes[`cab:${key}`] = { w: wh[0], h: wh[1] };
// Natural sizes, not the scaled sizes. Read the PNGs so sample() scales the same way Python does.
function pngSize(path) {
  const buf = fs.readFileSync(path);
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
for (const file of fs.readdirSync(new URL('assets/sprites/elon', root))) {
  if (file.endsWith('.png')) sizes[`elon:${file.slice(0, -4)}`] = pngSize(new URL(`assets/sprites/elon/${file}`, root));
}
for (const [key, rel] of Object.entries({
  DR: 'assets/sprites/cybercabs/cab_closed_DR.png',
  DR_open: 'assets/sprites/cybercabs/cab_door_open_DR.png',
  UR: 'assets/sprites/cybercabs/cab_closed_UR.png',
})) {
  sizes[`cab:${key}`] = pngSize(new URL(rel, root));
}

const sim = createSimulation(paths, sizes);

for (const row of expected.poses) {
  const pose = sim.pose(row.t);
  near(pose.characters[0].x, row.elon.x, 1e-4, `t=${row.t} elon x`);
  near(pose.characters[0].y, row.elon.y, 1e-4, `t=${row.t} elon y`);
  near(pose.characters[0].bob, row.elon.bob, 1e-8, `t=${row.t} elon bob`);
  check(pose.characters[0].sprite === row.elon.sprite, `t=${row.t} elon sprite ${pose.characters[0].sprite} vs ${row.elon.sprite}`);
  row.cabs.forEach((cab, i) => {
    const got = pose.cabs[i];
    if (cab == null) {
      check(got == null, `t=${row.t} cab ${i} should be off duty`);
      return;
    }
    check(got && got.name === cab.name, `t=${row.t} cab ${i} name`);
    near(got.x, cab.x, 1e-4, `t=${row.t} ${cab.name} x`);
    near(got.y, cab.y, 1e-4, `t=${row.t} ${cab.name} y`);
    near(got.angle, cab.angle, 1e-4, `t=${row.t} ${cab.name} angle`);
    near(got.door, cab.door, 1e-6, `t=${row.t} ${cab.name} door`);
    near(got.wUR, cab.wUR, 1e-6, `t=${row.t} ${cab.name} wUR`);
    near(got.qDR, cab.qDR, 1e-9, `t=${row.t} ${cab.name} qDR`);
    near(got.qUR, cab.qUR, 1e-9, `t=${row.t} ${cab.name} qUR`);
  });
}

// Loop seam: t and t+30 are the same pose.
const a = sim.pose(0);
const b = sim.pose(30);
check(JSON.stringify(a) === JSON.stringify(b), 'pose(0) === pose(30)');

for (const row of expected.pastes) {
  const cmds = sim.sample(row.t).filter((c) => c.type === 'sprite');
  check(cmds.length === row.layers.length, `t=${row.t} sprite count ${cmds.length} vs ${row.layers.length}`);
  cmds.forEach((cmd, i) => {
    const exp = row.layers[i];
    if (!exp) return;
    check(cmd.image === exp.image, `t=${row.t} layer ${i} image ${cmd.image} vs ${exp.image}`);
    near(cmd.alpha, exp.alpha, 1e-6, `t=${row.t} ${exp.image} alpha`);
    near(cmd.rotation || 0, exp.rotation, 1e-9, `t=${row.t} ${exp.image} rotation`);
    check(cmd.w === exp.w && cmd.h === exp.h, `t=${row.t} ${exp.image} dest ${cmd.w}x${cmd.h} vs ${exp.w}x${exp.h}`);
    const bb = rotatedSpriteSize(cmd.w, cmd.h, cmd.rotation || 0);
    check(bb.w === exp.bw && bb.h === exp.bh, `t=${row.t} ${exp.image} rotated ${bb.w}x${bb.h} vs ${exp.bw}x${exp.bh}`);
    const place = spriteCenter(cmd);
    const tlx = place.cx - place.bw / 2;
    const tly = place.cy - place.bh / 2;
    near(tlx, exp.tlx, 0.51, `t=${row.t} ${exp.image} tlx`);
    near(tly, exp.tly, 0.51, `t=${row.t} ${exp.image} tly`);
  });
}

check(expected.sizes.elon.elon_work_1_R[1] === sim.sample(0).find((c) => c.image === 'elon:elon_work_1_R').h,
  'elon world height matches Sprites(k=6)');

if (failed) {
  console.error(`${failed} checks failed`);
  process.exit(1);
}
console.log(`ok (${expected.poses.length} poses, ${expected.pastes.length} paste frames)`);
