// People, Optimus, vehicles. All side-view, flat style. (x,y) = ground point unless noted.
(function () {
  const { C, D } = TF;

  // Tiny worker. o: face(+1 right/-1 left), shirt, pants, hair:'short'|'cap'|'swept', hat colour,
  // bob (px), walk (leg phase rad, undefined = standing), armF/armB (rad from straight down, + = forward),
  // box (bool: carry a box in front).
  D.person = (ctx, x, y, o = {}) => {
    const f = o.face || 1, bob = o.bob || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(f * (o.s || 1), o.s || 1);
    ctx.lineCap = 'round';
    const hipY = -13 + bob, shY = -24 + bob, headY = -31 + bob;
    const sw = o.walk === undefined ? 0.12 : Math.sin(o.walk) * 0.5;
    const leg = (a) => D.line(ctx, [[0, hipY], [Math.sin(a) * 13, hipY + Math.cos(a) * 13 - bob]], o.pants || '#4b5a6b', 3.4);
    const arm = (a, col) => {
      const hx = Math.sin(a) * 11, hy = shY + Math.cos(a) * 11;
      if (o.tee) { // short sleeve, bare forearm
        D.line(ctx, [[0, shY], [hx, hy]], C.skin, 2.6);
        D.line(ctx, [[0, shY], [hx * 0.45, shY + (hy - shY) * 0.45]], col, 3.6);
      } else D.line(ctx, [[0, shY], [hx, hy]], col, 3);
      D.circ(ctx, hx, hy, 1.6, C.skin, null);
    };
    const armB = o.armB ?? (o.walk === undefined ? -0.15 : -sw), armF = o.armF ?? (o.walk === undefined ? 0.15 : sw);
    leg(-sw); arm(armB, shade(o.shirt || '#4a90d9'));
    leg(sw);
    D.rect(ctx, -4.5, shY - 2, 9, 13, o.shirt || '#4a90d9', C.ink, 1, 3);
    if (o.box) D.rect(ctx, 3, shY + 1, 11, 9, '#c89b62', '#8a6a3f', 1, 1);
    arm(o.box ? 1.3 : armF, o.shirt || '#4a90d9');
    D.circ(ctx, 0, headY, 5.4, C.skin, C.ink, 1);
    D.circ(ctx, 2.6, headY - 0.5, 0.9, C.ink, null);
    if (o.hair === 'cap') {
      ctx.beginPath(); ctx.arc(0, headY - 1, 5.8, Math.PI, 0); ctx.closePath();
      ctx.fillStyle = o.hat || '#f4c430'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; ctx.stroke();
      D.line(ctx, [[-1, headY - 1], [8, headY - 1]], o.hat || '#f4c430', 1.8);
    } else if (o.hair === 'swept') {
      // swept-back dark hair: tall volume on top, sweeping back past the crown
      ctx.beginPath();
      ctx.moveTo(4.6, headY - 2.6);
      ctx.quadraticCurveTo(4, headY - 11, -3.5, headY - 10);
      ctx.quadraticCurveTo(-10.5, headY - 8, -8.4, headY + 1);
      ctx.quadraticCurveTo(-6.2, headY - 2.6, -2.8, headY - 3.6);
      ctx.quadraticCurveTo(1.2, headY - 4.4, 4.6, headY - 2.6);
      ctx.fillStyle = '#211b17'; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(0, headY, 5.5, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath();
      ctx.fillStyle = o.hairColor || '#6b4a2f'; ctx.fill();
    }
    ctx.restore();
  };
  function shade(hex) { // darker version of a #rrggbb colour (for the back arm)
    const n = parseInt(hex.slice(1), 16);
    const k = (v) => Math.round(v * 0.78).toString(16).padStart(2, '0');
    return '#' + k(n >> 16) + k((n >> 8) & 255) + k(n & 255);
  }

  // Optimus humanoid, ~80px tall. Hands follow world-space targets via IK. o: face, hF, hB ([x,y]), bob.
  D.optimus = (ctx, x, y, o = {}) => {
    const f = o.face || 1, bob = o.bob || 0;
    const L = 19; // arm segment length
    const toL = (pt) => [(pt[0] - x) * f, pt[1] - y];
    ctx.save(); ctx.translate(x, y); ctx.scale(f, 1); ctx.lineCap = 'round';
    const limb = (a, b, w, col) => { D.line(ctx, [a, b], '#22272c', w + 2.4); D.line(ctx, [a, b], col, w); };
    const sh = [0, -61 + bob];
    const arm = (target, col) => {
      const t = toL(target);
      const [ex, ey, hx, hy] = TF.ik(sh[0], sh[1], t[0], t[1], L, L, -1);
      limb(sh, [ex, ey], 5, col); limb([ex, ey], [hx, hy], 4.4, col);
      D.circ(ctx, ex, ey, 2.4, '#22272c', null); D.circ(ctx, hx, hy, 3, '#22272c', null);
    };
    const rest = (dx) => [x + dx * f, y - 30 + bob];
    arm(o.hB || rest(-3), '#dfe2e5');
    // legs
    for (const s of [-1, 1]) {
      const kx = s * 1.5 + 2, hip = [s * 3, -38 + bob], knee = [kx, -19 + bob * 0.5], foot = [s * 3, -3];
      limb(hip, knee, 6, '#f4f5f6'); limb(knee, foot, 5.4, '#f4f5f6');
      D.circ(ctx, knee[0], knee[1], 2.6, '#22272c', null);
      D.rect(ctx, foot[0] - 3, -4, 9, 4, '#22272c', null, 0, 1.5);
    }
    D.rect(ctx, -8, -44 + bob, 16, 8, '#22272c', null, 0, 3); // pelvis
    D.poly(ctx, [[-10, -66 + bob], [11, -66 + bob], [8, -44 + bob], [-7, -44 + bob]], '#f4f5f6', '#22272c', 1.4);
    D.line(ctx, [[-6, -53 + bob], [8, -53 + bob]], '#22272c', 1.4);
    D.rect(ctx, -2, -71 + bob, 5, 6, '#22272c', null, 0, 1); // neck
    ctx.beginPath(); ctx.ellipse(1, -77 + bob, 7, 8, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#f4f5f6'; ctx.fill(); ctx.strokeStyle = '#22272c'; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(4.2, -77 + bob, 4, 5.8, 0, 0, Math.PI * 2); ctx.fillStyle = '#111417'; ctx.fill(); // visor
    D.circ(ctx, 5, -78.5 + bob, 1, '#5aa9ff', null);
    ctx.restore();
    arm2();
    function arm2() {
      ctx.save(); ctx.translate(x, y); ctx.scale(f, 1); ctx.lineCap = 'round';
      arm(o.hF || rest(4), '#f4f5f6');
      ctx.restore();
    }
  };

  D.wheel = (ctx, x, y, r, spin = 0, hub = '#c7ccd1') => {
    D.circ(ctx, x, y, r, '#2b3036', '#1d2125', 1.2);
    D.circ(ctx, x, y, r * 0.58, hub, '#6b737b', 1);
    for (let i = 0; i < 3; i++) {
      const a = spin + (i * Math.PI * 2) / 3;
      D.line(ctx, [[x, y], [x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55]], '#6b737b', 1.4);
    }
  };

  // Generic Tesla sedan/crossover, 130*s long, facing right. o: wheels (bool), dir, spin.
  D.car = (ctx, x, y, s, color, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.dir !== -1) { ctx.translate(130, 0); ctx.scale(-1, 1); } // path below is drawn nose-left
    ctx.beginPath();
    ctx.moveTo(4, -9); ctx.lineTo(3, -21); ctx.quadraticCurveTo(14, -27, 36, -29);
    ctx.quadraticCurveTo(52, -42, 70, -43); ctx.quadraticCurveTo(102, -43, 116, -31);
    ctx.quadraticCurveTo(128, -28, 128, -20); ctx.lineTo(127, -9); ctx.closePath();
    ctx.fillStyle = color; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(40, -29); ctx.quadraticCurveTo(54, -40, 70, -40); ctx.quadraticCurveTo(96, -40, 108, -31); ctx.closePath();
    ctx.fillStyle = C.glass; ctx.fill();
    D.line(ctx, [[72, -40], [72, -12]], 'rgba(0,0,0,0.25)', 1.2);
    D.line(ctx, [[78, -24], [84, -24]], 'rgba(0,0,0,0.35)', 1.4);
    D.rect(ctx, 4, -21, 6, 3, '#fff8d8', null, 0, 1);
    D.rect(ctx, 123, -22, 4, 3, '#b3121f', null, 0, 1);
    for (const wx of [27, 103]) {
      if (o.wheels === false) {
        ctx.beginPath(); ctx.arc(wx, -9, 12, Math.PI, 0); ctx.fillStyle = '#5b636b'; ctx.fill();
      } else D.wheel(ctx, wx, -11, 11, o.spin || 0);
    }
    ctx.restore();
  };

  // Cybertruck: one straight line from the nose up to a single peak over the windshield,
  // one straight line down to the tailgate. 150*s long, nose to the right.
  D.cybertruck = (ctx, x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const roof = (px) => (px <= 84 ? -36 - 20 * (px / 84) : -56 + 26 * ((px - 84) / 66)); // roofline y
    D.poly(ctx, [[3, -11], [0, -36], [84, -56], [150, -30], [150, -20], [145, -11]], '#c6ccd1', '#5d656c', 1.8);
    D.poly(ctx, [[3, -11], [1, -26], [149, -24], [145, -11]], '#b4bbc1', null); // lower flat panel
    D.line(ctx, [[1, -26], [149, -24]], 'rgba(60,66,72,0.45)', 1.2);
    D.poly(ctx, [[58, roof(58) + 3], [84, -53], [118, roof(118) + 3], [58, -41]], C.glass, null);
    for (const dx of [72, 104]) D.line(ctx, [[dx, -12], [dx, roof(dx) + 3]], 'rgba(60,66,72,0.35)', 1.1);
    D.line(ctx, [[150, -30], [131, -37.5]], '#ffffff', 2.6); // front light bar
    D.circ(ctx, 150, -30, 3.5, 'rgba(255,255,255,0.6)', null);
    D.line(ctx, [[0, -36], [12, -38.8]], '#d01b2a', 2.4); // tail light bar
    for (const wx of [30, 122]) {
      D.poly(ctx, [[wx - 19, -11], [wx - 14, -25], [wx + 14, -25], [wx + 19, -11]], '#3c434a', null);
      D.wheel(ctx, wx, -12, 12, o.spin || 0, '#8f979e');
    }
    ctx.restore();
  };

  // Cybercab: small 2-door pod with a smooth teardrop/fastback roof, one unbroken glasshouse,
  // light bars front and back. 80*s long, centred on x. dir -1 faces left. squash (0..1] = foreshortening.
  D.cybercab = (ctx, x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.dir || 1) * (o.squash || 1), s);
    ctx.translate(-40, 0);
    ctx.beginPath(); ctx.moveTo(2, -9); ctx.lineTo(1, -16);
    ctx.bezierCurveTo(6, -27, 26, -36, 48, -35);       // long fastback up to the peak
    ctx.bezierCurveTo(64, -34, 76, -25, 79, -16);      // short rounded nose
    ctx.lineTo(79, -9); ctx.quadraticCurveTo(40, -6, 2, -9); ctx.closePath();
    ctx.fillStyle = '#dcd6c8'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -23); ctx.bezierCurveTo(26, -32, 50, -34, 68, -22); // single glass band
    ctx.quadraticCurveTo(40, -20, 14, -23); ctx.fillStyle = C.glass; ctx.fill();
    ctx.beginPath(); ctx.moveTo(30, -21); ctx.quadraticCurveTo(28, -14, 31, -9); // one long door seam
    ctx.moveTo(62, -21); ctx.quadraticCurveTo(65, -14, 62, -9);
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 1; ctx.stroke();
    D.line(ctx, [[79, -15], [76, -22]], '#ffffff', 2.4);   // front light bar
    D.line(ctx, [[1, -15], [4, -22]], '#e0283a', 2.4);     // rear light bar
    for (const wx of [18, 62]) D.wheel(ctx, wx, -7, 7.5, o.spin || 0, '#eef0f2');
    ctx.restore();
  };
  // Cybercab seen from the front (front=true, white light bar) or rear (red bar); centred on x.
  D.cybercabEnd = (ctx, x, y, s, front) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    D.rect(ctx, -16, -9, 6, 9, '#2b3036', null, 0, 2); D.rect(ctx, 10, -9, 6, 9, '#2b3036', null, 0, 2);
    ctx.beginPath(); ctx.moveTo(-16, -8); ctx.bezierCurveTo(-17, -24, -10, -35, 0, -35);
    ctx.bezierCurveTo(10, -35, 17, -24, 16, -8); ctx.closePath();
    ctx.fillStyle = '#dcd6c8'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, -26, 10, 6, 0, 0, Math.PI * 2); ctx.fillStyle = C.glass; ctx.fill();
    D.line(ctx, [[-13, -15], [13, -15]], front ? '#ffffff' : '#e0283a', 2.6);
    ctx.restore();
  };

  // Giga-cast underbody (side view), 100*s long, sitting on y.
  D.underbody = (ctx, x, y, s = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    D.poly(ctx, [[0, -6], [6, -14], [94, -14], [100, -6], [96, 0], [4, 0]], '#a9b0b7', C.dark, 1.5);
    for (let i = 0; i < 6; i++) D.rect(ctx, 12 + i * 13.5, -11, 8, 7, '#7f878f', null, 0, 2);
    ctx.restore();
  };

  // Single cylindrical battery cell standing on y.
  D.battCell = (ctx, x, y, s = 1, col = '#5a6570') => {
    D.rect(ctx, x - 4 * s, y - 16 * s, 8 * s, 16 * s, col, C.ink, 1, 2);
    D.rect(ctx, x - 4 * s, y - 16 * s, 8 * s, 4 * s, '#c9ced3', null, 0, 1);
  };
})();
