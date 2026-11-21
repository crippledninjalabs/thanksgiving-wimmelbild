// Sheet layouts + animation timelines for sheets.html (uses only the public draw/clip APIs).
(function (G) {
  const TF3 = G.TF3, R = TF3.rig, C = TF3.clips, P = TF3.paint;
  const S = (TF3.sheets = {});
  const label = (ctx, x, y, t, size = 15, col = '#9aa0a6', align = 'left') => {
    ctx.save(); ctx.font = `${size}px sans-serif`; ctx.fillStyle = col; ctx.textAlign = align; ctx.fillText(t, x, y); ctx.restore();
  };
  const ground = (ctx, x0, x1, y, scale, worldX0 = 0, ticks = true) => {
    ctx.save(); ctx.strokeStyle = '#c9ced3'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    if (ticks) { ctx.strokeStyle = '#dde1e5'; ctx.lineWidth = 1;
      for (let wx = Math.ceil(worldX0 / 0.25) * 0.25; x0 + (wx - worldX0) * scale <= x1; wx += 0.25) {
        const px = x0 + (wx - worldX0) * scale; ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px, y + (Math.abs(wx % 1) < 1e-6 ? 12 : 6)); ctx.stroke(); } }
    ctx.restore();
  };
  const fig = (who) => (who === 'elon' ? TF3.elon : TF3.optimus);
  // frames row: n frames of clip in cells; walking clips advance inside a fixed world frame
  function row(ctx, who, clip, n, x0, y, cellW, scale, opts = {}) {
    const loopN = opts.inclusive ? n - 1 : n;
    for (let i = 0; i < n; i++) {
      const ph = i / loopN, pose = clip.sample(ph), cx = x0 + i * cellW;
      ground(ctx, cx + 8, cx + cellW - 8, y, scale, 0);
      const ax = cx + (opts.startX ?? 0.35) * scale + (pose.advance || 0) * scale;
      if (opts.scenery) opts.scenery(ctx, ax, y, scale, pose, ph);
      fig(who).draw(ctx, ax, y + (pose.advanceY ? 0 : 0), scale, pose, { face: 1 });
      if (opts.plantMarks) { // red ticks at the planted contact points (world-fixed)
        for (const s of ['N', 'F']) { const f = pose['foot' + s]; if (f.heel[1] < 1e-4) {
          const px = ax + (f.heel[0]) * scale; ctx.fillStyle = s === 'N' ? '#e5484d' : '#f5a3a5'; ctx.fillRect(px - 2, y + 3, 4, 7); } }
      }
      label(ctx, cx + 12, y + 30, opts.frameLabel ? opts.frameLabel(i, ph) : `${(ph).toFixed(2)}`, 13);
    }
  }
  function onion(ctx, who, clip, n, x, y, scale, cellW) {
    ground(ctx, x + 8, x + cellW - 8, y, scale, 0);
    ctx.save(); ctx.globalAlpha = 0.28;
    for (let i = 0; i < n; i++) { const p = clip.sample(i / n); fig(who).draw(ctx, x + 0.35 * scale + (p.advance || 0) * scale, y, scale, p, {}); }
    ctx.restore();
    label(ctx, x + 12, y + 30, `onion skin, ${n} frames`, 13);
  }
  S.rack = (ctx, x, y, s, top) => rack(ctx, x, y, s, top);
  const rack = (ctx, x, y, s, top) => { // simple shelf: top surface at height `top` (m)
    ctx.save(); ctx.fillStyle = '#e4e7ea'; ctx.strokeStyle = '#9aa1a8'; ctx.lineWidth = 1.5;
    ctx.fillRect(x - 0.25 * s, y - top * s, 0.5 * s, 0.05 * s); ctx.strokeRect(x - 0.25 * s, y - top * s, 0.5 * s, 0.05 * s);
    ctx.beginPath(); ctx.moveTo(x + 0.2 * s, y - top * s); ctx.lineTo(x + 0.2 * s, y); ctx.moveTo(x - 0.2 * s, y - top * s); ctx.lineTo(x - 0.2 * s, y); ctx.stroke(); ctx.restore();
  };

  S.optimus = (cv) => {
    const sc = 230, cw = 470; cv.width = 3360; cv.height = 3350;
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    label(ctx, 30, 50, 'OPTIMUS (Gen 2 style, 1.73 m) — figure sheet. Grey ticks = 25 cm on the ground; red ticks = planted feet.', 26, '#555');
    let y = 520;
    label(ctx, 30, y - 430, 'idle (breathing + weight shift)  |  turn', 18, '#777');
    row(ctx, 'optimus', C.idle('optimus'), 3, 20, y, cw * 0.62, sc);
    TF3.optimus.draw(ctx, 20 + cw * 2.05, y, sc, C.idle('optimus').sample(0), { face: 1, squash: 0.6 });
    TF3.optimus.draw(ctx, 20 + cw * 2.55, y, sc, C.idle('optimus').sample(0), { face: -1 });
    TF3.optimus.drawFront(ctx, 20 + cw * 3.25, y, sc); label(ctx, 20 + cw * 3.05, y + 30, 'front view (idle)', 13);
    y += 560; label(ctx, 30, y - 440, 'walk cycle — 6 frames + onion skin (feet planted; arms counter-swing)', 18, '#777');
    const w = C.walk(); row(ctx, 'optimus', w, 6, 20, y, cw, sc, { plantMarks: true }); onion(ctx, 'optimus', w, 6, 20 + cw * 6, y, sc, cw * 1.05);
    y += 560; label(ctx, 30, y - 440, 'carry box — both hands under the box, arms bent', 18, '#777');
    const c = C.carryWalk(); row(ctx, 'optimus', c, 6, 20, y, cw, sc, { plantMarks: true }); onion(ctx, 'optimus', c, 6, 20 + cw * 6, y, sc, cw * 1.05);
    y += 560; label(ctx, 30, y - 440, 'reach – grab – place (low shelf -> high shelf)', 18, '#777');
    const g = C.reachGrabPlace();
    row(ctx, 'optimus', g, 8, 20, y, cw * 0.86, sc, { inclusive: true, scenery: (cx, ax, gy, s) => { rack(cx, ax + g.from[0] * s, gy, s, g.from[1] - 0.135); rack(cx, ax + (g.to[0] + 0.1) * s, gy, s, g.to[1] - 0.135); } });
    y += 590; label(ctx, 30, y - 470, 'weld (torch tip on the seam, sparks)   |   climb ladder (alternating hands / feet)', 18, '#777');
    const wd = C.weld();
    row(ctx, 'optimus', wd, 3, 20, y, cw * 0.75, sc, { scenery: (cx, ax, gy, s) => { cx.fillStyle = '#dfe3e7'; cx.fillRect(ax + 0.58 * s, gy - 1.6 * s, 0.12 * s, 1.6 * s); cx.fillStyle = '#9aa1a8'; cx.fillRect(ax + 0.575 * s, gy - 1.32 * s, 0.01 * s, 0.4 * s); } });
    const cl = C.climb();
    row(ctx, 'optimus', cl, 4, 20 + cw * 2.3, y, cw * 0.62, sc * 0.82, { startX: 0.35 });
    y += 560; label(ctx, 30, y - 440, 'push cart', 18, '#777');
    row(ctx, 'optimus', C.pushCart(), 4, 20, y, cw * 1.05, sc, { plantMarks: true, startX: 0.3 });
  };

  S.elon = (cv) => {
    const sc = 215, cw = 470; cv.width = 3360; cv.height = 2450;
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    label(ctx, 30, 50, 'ELON (1.88 m) — figure sheet, same scale family as Optimus (1.73 m, right).', 26, '#555');
    let y = 540;
    ground(ctx, 20, 1800, y, sc, 0, false);
    TF3.elon.drawFront(ctx, 200, y, sc); label(ctx, 150, y + 30, 'front', 13);
    TF3.elon.draw(ctx, 560, y, sc, C.elonIdle().sample(0), {}); label(ctx, 520, y + 30, 'side idle', 13);
    TF3.elon.draw(ctx, 900, y, sc, C.armsCrossed().sample(0.5), {}); label(ctx, 860, y + 30, 'watch, arms crossed', 13);
    TF3.elon.draw(ctx, 1240, y, sc, C.rideLift().sample(0.5), {}); label(ctx, 1200, y + 30, 'ride lift, hand on rail', 13);
    TF3.optimus.draw(ctx, 1600, y, sc, C.idle('optimus').sample(0), { face: -1 }); label(ctx, 1560, y + 30, 'Optimus for scale', 13);
    // head close-ups (x3), clipped to a box
    ctx.save(); ctx.beginPath(); ctx.rect(1850, 70, 1480, 520); ctx.clip();
    TF3.elon.draw(ctx, 2250, 330 + 1.77 * sc * 3, sc * 3, C.elonIdle().sample(0), {});
    TF3.elon.drawFront(ctx, 2950, 330 + 1.75 * sc * 3, sc * 3);
    ctx.restore(); label(ctx, 1860, 100, 'head detail (x3): hair combed back + up, receding temples, defined jaw', 15);
    y += 600; label(ctx, 30, y - 450, 'walk cycle — 6 frames', 18, '#777');
    const ew = C.walk('elon'); row(ctx, 'elon', ew, 6, 20, y, cw, sc, { plantMarks: true }); onion(ctx, 'elon', ew, 6, 20 + cw * 6, y, sc, cw * 1.05);
    y += 640; label(ctx, 30, y - 470, 'take a bite (Optimus holds the plate)', 18, '#777');
    const b = C.bite(), opx = 0.84;
    row(ctx, 'elon', b, 7, 20, y, cw, sc, { inclusive: true, scenery: (cx, ax, gy, s) => {
      const op = TF3.clips.stand('optimus'); const pl = b.plateAt;
      op.handN = [opx - pl[0] + 0.04, pl[1] - 0.01]; op.handF = [opx - pl[0] - 0.02, pl[1] - 0.015]; op.handAngN = -0.05; op.handAngF = -0.05; op.gripN = 0.6; op.gripF = 0.6;
      TF3.optimus.draw(cx, ax + opx * s, gy, s, op, { face: -1 }); } });
  };
  S.elonRest = null;

  S.cybercab = (cv) => {
    cv.width = 2600; cv.height = 1750;
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    label(ctx, 30, 50, 'CYBERCAB (production, champagne gold) — side, plan, butterfly doors, drive. Optimus 1.73 m for scale.', 26, '#555');
    const sc = 230, y = 560;
    ground(ctx, 20, 1300, y, sc, 0, false);
    TF3.vehicles.cybercab.draw(ctx, 600, y, sc, {}, {});
    TF3.optimus.draw(ctx, 1230, y, sc, C.idle('optimus').sample(0), { face: -1 });
    label(ctx, 40, y + 34, 'side: fastback teardrop, no mirrors, no rear window, black glass band, aero covers, light bars', 15);
    TF3.vehicles.cybercab.drawPlan(ctx, 1910, 330, sc);
    label(ctx, 1420, 590, 'plan view (same scale): teardrop, widest at front wheels, narrower rear track, gold fastback deck', 15);
    const s2 = 105, y2 = 980;
    label(ctx, 30, y2 - 200, 'butterfly door open / close (hinged at A-pillar top, swings up + forward)', 18, '#777');
    const s3 = 140;
    [0, 0.5, 1].forEach((v, i) => { const cx = 330 + i * 860; ground(ctx, cx - 320, cx + 320, y2 + 40, s3, 0, false);
      TF3.vehicles.cybercab.draw(ctx, cx, y2 + 40, s3, { door: v }, {}); label(ctx, cx - 310, y2 + 68, ['closed', 'half open', 'open'][i], 14); });
    const y3 = 1450; label(ctx, 30, y3 - 230, 'driving: wheels rotate with distance (no slip), slight suspension bob', 18, '#777');
    const dr = C.cybercabDrive();
    for (let i = 0; i < 5; i++) { const p = dr.sample(i / 5); ground(ctx, 20 + i * 510, 500 + i * 510, y3, s2, 0, false);
      TF3.vehicles.cybercab.draw(ctx, 260 + i * 510, y3, s2, p, {}); label(ctx, 30 + i * 510, y3 + 28, `wheel ${(p.wheelAng % (2 * Math.PI)).toFixed(2)} rad`, 13); }
  };

  S.vehicles = (cv) => {
    cv.width = 3000; cv.height = 1500;
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    const sc = 95;
    label(ctx, 30, 50, `VEHICLES at one scale (${sc} px/m): Model Y 4.75 m (5 paints), Cybertruck 5.68 m, Cybercab 4.3 m (assumed), Semi tractor 7 m; Optimus 1.73 m, Elon 1.88 m.`, 22, '#555');
    let y = 520, x = 40;
    const put = (fn, len, txt) => { const cx = x + len / 2 * sc; fn(cx); label(ctx, x, y + 30, txt, 14); x += len * sc + 60; };
    ground(ctx, 20, cv.width - 20, y, sc, 0, false);
    put((cx) => TF3.vehicles.semi.draw(ctx, cx, y, sc, {}), 7.1, 'Tesla Semi (tractor)');
    put((cx) => TF3.vehicles.cybertruck.draw(ctx, cx, y, sc, {}), 5.7, 'Cybertruck (stainless)');
    put((cx) => TF3.vehicles.cybercab.draw(ctx, cx, y, sc, {}), 4.3, 'Cybercab');
    put((cx) => TF3.optimus.draw(ctx, cx, y, sc, C.idle('optimus').sample(0), {}), 0.6, 'Optimus');
    put((cx) => TF3.elon.draw(ctx, cx, y, sc, C.elonIdle().sample(0), {}), 0.6, 'Elon');
    y = 1150; x = 40; ground(ctx, 20, cv.width - 20, y, sc, 0, false);
    for (const [k, v] of Object.entries(TF3.style.vehicles.paints)) put((cx) => TF3.vehicles.modelY.draw(ctx, cx, y, sc, {}, { paint: v }), 4.8, 'Model Y — ' + k);
  };

  S.overview = (cv) => {
    cv.width = 3000; cv.height = 900;
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cv.width, cv.height);
    const sc = 190, y = 760;
    label(ctx, 30, 50, 'v3 figure family — one scale (190 px/m)', 26, '#555');
    ground(ctx, 20, cv.width - 20, y, sc, 0, false);
    TF3.vehicles.cybercab.draw(ctx, 470, y, sc, { door: 1 }, {});
    TF3.elon.draw(ctx, 1080, y, sc, C.armsCrossed().sample(0), {});
    TF3.optimus.draw(ctx, 1380, y, sc, C.walk().sample(0.3), {});
    TF3.optimus.draw(ctx, 1660, y, sc, C.carryWalk().sample(0.7), {});
    const g = C.reachGrabPlace(); TF3.optimus.draw(ctx, 1950, y, sc, g.sample(0.66), {}); rack(ctx, 1950 + (g.to[0] + 0.1) * sc, y, sc, g.to[1] - 0.135);
    TF3.optimus.draw(ctx, 2350, y, sc, C.weld().sample(0.3), {}); ctx.fillStyle = '#dfe3e7'; ctx.fillRect(2350 + 0.58 * sc, y - 1.6 * sc, 0.12 * sc, 1.6 * sc);
    TF3.elon.draw(ctx, 2750, y, sc, C.walk('elon').sample(0.2), { face: -1 });
  };
})(window);
