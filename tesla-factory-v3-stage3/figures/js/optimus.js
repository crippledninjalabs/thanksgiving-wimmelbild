// TF3.optimus.draw(ctx, x, y, scale, pose, opts) — renders a pose only (no motion logic).
// (x, y) = canvas px of the ground point under the hip; scale = px per metre.
// opts: face (+1 right / -1 left), squash (0..1 horizontal squash for turning), props (see props.js).
(function (G) {
  const TF3 = (G.TF3 = G.TF3 || {});
  const R = TF3.rig, P = TF3.paint;

  function hand(ctx, wrist, ang, grip, curl, S, C, far) {
    const col = far ? C.handFar : C.hand, ol = '#3a3f45';
    P.at(ctx, wrist, ang, () => {
      const pl = S.palm, w = S.handW;
      // thumb (behind the fingers), closes in when gripping
      const t0 = [pl * 0.3, -curl * w * 0.35];
      P.capsule(ctx, t0, R.add(t0, R.polar(-curl * (0.75 - grip * 0.55), S.finger * 0.62)), 0.014, 0.011, col, ol, 1);
      P.smooth(ctx, [[0, -w * 0.42], [pl * 0.6, -w * 0.52], [pl, -w * 0.4], [pl, w * 0.42], [pl * 0.5, w * 0.5], [0, w * 0.4]], col, ol, 1);
      // finger block in two segments, curling toward the palm side
      const c1 = curl * grip * 1.25, c2 = curl * grip * 1.45;
      const a = [pl * 0.92, 0], b = R.add(a, R.polar(c1, S.finger * 0.55)), e = R.add(b, R.polar(c1 + c2, S.finger * 0.45));
      P.capsule(ctx, a, b, w * 0.4, w * 0.36, col, ol, 1);
      P.capsule(ctx, b, e, w * 0.36, w * 0.3, col, ol, 1);
    });
  }

  function foot(ctx, ft, C, fd, far) {
    const L = fd.footLen;
    P.at(ctx, ft.heel, ft.p, () => {
      P.poly(ctx, [[-0.012, 0.004], [L * 0.98, 0.004], [L, 0.03], [L * 0.62, 0.062], [0.08, 0.098], [0.01, 0.092],
        [-0.02, 0.045]], far ? C.shellFar : C.shell, C.outline);
      P.poly(ctx, [[-0.014, 0], [L, 0], [L, 0.016], [-0.016, 0.016]], C.sole, null);
    });
  }

  function leg(ctx, sk, s, st, far) {
    const C = st.col, S = st.shape, d = st.dims;
    const shell = far ? C.shellFar : C.shell, jc = far ? C.jointFar : C.joint;
    const hip = sk.hipJ, knee = sk['knee' + s], ankle = sk['ankle' + s];
    P.capsule(ctx, knee, ankle, S.shin[0], S.shin[1], shell, C.outline);
    foot(ctx, sk['foot' + s], C, d.foot, far);
    P.circle(ctx, ankle, S.shin[1] * 0.85, jc, null);
    P.capsule(ctx, hip, knee, S.thigh[0], S.thigh[1], shell, C.outline);
    P.circle(ctx, knee, S.joint.knee, jc, null);
    if (st.blueDots) P.circle(ctx, knee, S.joint.knee * 0.3, C.dot, null);
  }

  function arm(ctx, sk, s, st, far, pose) {
    const C = st.col, S = st.shape;
    const shell = far ? C.shellFar : C.shell, jc = far ? C.jointFar : C.joint;
    const sh = sk.shoulder, el = sk['elbow' + s], wr = sk['wrist' + s];
    P.capsule(ctx, sh, el, S.upperArm[0], S.upperArm[1], shell, C.outline);
    P.capsule(ctx, el, wr, S.foreArm[0], S.foreArm[1], shell, C.outline);
    P.circle(ctx, el, S.joint.elbow, jc, null);
    if (st.blueDots) P.circle(ctx, el, S.joint.elbow * 0.32, C.dot, null);
    P.circle(ctx, wr, S.joint.wrist, jc, null);
    const ha = sk['handAng' + s] !== undefined ? sk['handAng' + s] : R.ang(el, wr);
    hand(ctx, wr, ha, sk['grip' + s], pose['curl' + s] || -1, S, C, far);
    // rounded white shoulder shell over the joint
    P.circle(ctx, sh, S.joint.shoulder * 1.15, shell, C.outline);
    P.circle(ctx, sh, S.joint.shoulder * 0.45, jc, null);
    if (st.blueDots) P.circle(ctx, sh, S.joint.shoulder * 0.15, C.dot, null);
  }

  function torso(ctx, sk, st, pose) {
    const C = st.col;
    const breath = pose.breath || 0;
    P.at(ctx, sk.hip, -sk.lean, () => {
      // pelvis pod
      P.poly(ctx, [[-0.11, 0.07], [0.1, 0.07], [0.095, -0.02], [0.03, -0.075], [-0.06, -0.07], [-0.115, -0.01]],
        C.shell, C.outline);
      // dark waist / abdomen actuators
      P.poly(ctx, [[-0.085, 0.06], [0.075, 0.06], [0.07, 0.2], [-0.09, 0.2]], C.waist, C.outline);
      P.line(ctx, [[-0.06, 0.1], [0.05, 0.1]], '#3a3e44', 0.008);
      P.line(ctx, [[-0.065, 0.145], [0.055, 0.145]], '#3a3e44', 0.008);
      // chest shell: broad, tapering to the waist
      const b = breath;
      P.poly(ctx, [[-0.095, 0.185], [-0.122, 0.35], [-0.11, 0.48], [-0.06, 0.545 + b], [0.03, 0.56 + b],
        [0.1, 0.52 + b], [0.135 + b * 0.5, 0.42], [0.125, 0.3], [0.075, 0.2]], C.shell, C.outline);
      P.line(ctx, [[0.06, 0.205], [0.12, 0.33]], C.panel, 0.007);
      P.line(ctx, [[-0.1, 0.33], [-0.02, 0.36], [0.05, 0.47]], C.panel, 0.007);
      if (st.chestT) {
        P.line(ctx, [[0.075, 0.5], [0.122, 0.47]], '#9aa0a6', 0.009);
        P.line(ctx, [[0.1, 0.485], [0.116, 0.4]], '#9aa0a6', 0.009);
      }
    });
  }

  function head(ctx, sk, st) {
    const C = st.col;
    P.capsule(ctx, sk.neckBase, R.add(sk.headC, R.rot([0, -0.03], -sk.headAng)), 0.022, 0.02, C.joint, null); // slim neck
    P.at(ctx, R.add(sk.headC, R.rot([0, 0.045], -sk.headAng)), -sk.headAng, () => {
      // rounded helmet: white shell over top + back; glossy black face plate on the front, wrapping round the side
      const outer = [[0.0, 0.122], [-0.075, 0.098], [-0.106, 0.02], [-0.088, -0.06], [-0.035, -0.105], [0.035, -0.115],
        [0.083, -0.083], [0.103, -0.015], [0.097, 0.055], [0.06, 0.105]];
      P.smooth(ctx, outer, C.shell, C.outline);
      ctx.save(); P.smooth(ctx, outer, null, null); ctx.clip();
      // visor: rear edge is a curve bulging back (side wrap), white brow band left above it
      P.smooth(ctx, [[0.07, 0.072], [0.02, 0.06], [-0.022, 0.02], [-0.03, -0.035], [-0.005, -0.085], [0.06, -0.1], [0.14, -0.06], [0.14, 0.06]], C.visor, null);
      P.line(ctx, [[0.052, 0.045], [0.08, 0.01], [0.083, -0.03]], C.visorHi, 0.01);          // gloss highlight
      P.line(ctx, [[-0.006, 0.03], [-0.016, -0.02]], '#2b3036', 0.006);                         // side curvature hint
      ctx.restore();
      P.smooth(ctx, outer, null, C.outline);
      P.line(ctx, [[-0.065, 0.075], [-0.085, 0.0], [-0.07, -0.055]], C.panel, 0.006);           // rear shell seam
    });
  }

  // Static front view (idle) for the sheet.
  function drawFront(ctx, x, y, scale) {
    const st = TF3.style.optimus, C = st.col, S = st.shape, d = st.dims;
    P.begin(ctx, x, y, scale, 1);
    const hip = d.standHip, sh = hip + d.torso;
    for (const s of [-1, 1]) {
      const h = [s * 0.09, hip - 0.03], k = [s * 0.095, 0.5], a = [s * 0.1, 0.085];
      P.capsule(ctx, k, a, S.shin[0], S.shin[1], C.shell, C.outline);
      P.poly(ctx, [[s * 0.1 - 0.05, 0], [s * 0.1 + 0.05, 0], [s * 0.1 + 0.045, 0.07], [s * 0.1 - 0.045, 0.07]], C.shell, C.outline);
      P.poly(ctx, [[s * 0.1 - 0.052, 0], [s * 0.1 + 0.052, 0], [s * 0.1 + 0.052, 0.016], [s * 0.1 - 0.052, 0.016]], C.sole, null);
      P.capsule(ctx, h, k, S.thigh[0], S.thigh[1], C.shell, C.outline);
      P.circle(ctx, k, S.joint.knee, C.joint, null); P.circle(ctx, k, S.joint.knee * 0.3, C.dot, null);
      const sp = [s * 0.2, sh - 0.02], e = [s * 0.235, sh - 0.3], w = [s * 0.245, sh - 0.56];
      P.capsule(ctx, e, w, S.foreArm[0], S.foreArm[1], C.shell, C.outline);
      P.capsule(ctx, sp, e, S.upperArm[0], S.upperArm[1], C.shell, C.outline);
      P.circle(ctx, e, S.joint.elbow, C.joint, null); P.circle(ctx, e, S.joint.elbow * 0.3, C.dot, null);
      P.smooth(ctx, [[w[0] - 0.03, w[1]], [w[0] + 0.03, w[1]], [w[0] + 0.032, w[1] - 0.12], [w[0], w[1] - 0.16], [w[0] - 0.032, w[1] - 0.12]], C.hand, '#3a3f45', 1);
      P.circle(ctx, sp, S.joint.shoulder * 1.15, C.shell, C.outline); P.circle(ctx, sp, S.joint.shoulder * 0.45, C.joint, null);
    }
    P.poly(ctx, [[-0.15, hip + 0.06], [0.15, hip + 0.06], [0.12, hip - 0.07], [0.03, hip - 0.1], [-0.03, hip - 0.1], [-0.12, hip - 0.07]], C.shell, C.outline);
    P.poly(ctx, [[-0.1, hip + 0.05], [0.1, hip + 0.05], [0.11, hip + 0.19], [-0.11, hip + 0.19]], C.waist, C.outline);
    P.poly(ctx, [[-0.12, hip + 0.18], [0.12, hip + 0.18], [0.2, sh - 0.12], [0.215, sh + 0.02], [0.08, sh + 0.06], [-0.08, sh + 0.06], [-0.215, sh + 0.02], [-0.2, sh - 0.12]], C.shell, C.outline);
    P.line(ctx, [[-0.07, sh - 0.03], [0.07, sh - 0.03]], '#9aa0a6', 0.009); P.line(ctx, [[0, sh - 0.03], [0, sh - 0.12]], '#9aa0a6', 0.009);
    P.capsule(ctx, [0, sh + 0.04], [0, sh + 0.12], 0.022, 0.02, C.joint, null);
    const hc = [0, sh + d.neckUp - d.torso + d.neck + 0.045];
    P.ellipse(ctx, hc, 0.093, 0.122, 0, C.shell, C.outline);           // white helmet rim
    P.ellipse(ctx, [0, hc[1] - 0.012], 0.07, 0.09, 0, C.visor, null);  // black oval face
    P.line(ctx, [[-0.035, hc[1] + 0.05], [0.0, hc[1] + 0.062]], C.visorHi, 0.01);
    P.end(ctx);
  }

  TF3.optimus = {
    drawFront,
    style: () => TF3.style.optimus,
    skeleton: (pose) => R.skeleton(pose, TF3.style.optimus.dims),
    draw(ctx, x, y, scale, pose, opts = {}) {
      const st = TF3.style.optimus;
      const sk = R.skeleton(pose, st.dims);
      P.begin(ctx, x, y, scale, (opts.face || 1));
      if (opts.squash) ctx.scale(1 - opts.squash, 1);
      const props = pose.props || {};
      TF3.props && TF3.props.draw(ctx, props, 'behind', sk);
      arm(ctx, sk, 'F', st, true, pose);
      leg(ctx, sk, 'F', st, true);
      torso(ctx, sk, st, pose);
      P.circle(ctx, sk.hipJ, st.shape.joint.hip * 0.7, st.col.joint, null);
      leg(ctx, sk, 'N', st, false);
            head(ctx, sk, st);
      TF3.props && TF3.props.draw(ctx, props, 'held', sk);
      arm(ctx, sk, 'N', st, false, pose);
      TF3.props && TF3.props.draw(ctx, props, 'front', sk);
      P.end(ctx);
      return sk;
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
