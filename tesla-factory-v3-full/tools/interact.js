// Interaction test: wheel zoom at the cursor, drag pan, double-click a room, Home key; checks the view changes,
// the LOD tier switches and the URL keeps ?view=. node tools/interact.js
const { open } = require('./lib');
(async () => {
  const { browser, page, errors } = await open({ w: 1400, h: 900 });
  await page.evaluate(() => { window.__setTime(3); window.TF.camera.fit(); window.__render(); });
  const st = () => page.evaluate(() => Object.assign({}, window.TF.camera.view, { lod: window.__render().lod }));
  const log = (n, v) => console.log(n.padEnd(26), `cx ${v.cx.toFixed(0)} cy ${v.cy.toFixed(0)} zoom ${v.zoom.toFixed(3)} lod ${v.lod}`);
  const ok = []; let v0 = await st(); log('fit-all', v0);
  // wheel zoom in at a point on floor 6 (the world point under the cursor must stay put)
  const pt = await page.evaluate(() => { const c = window.TF.camera, v = c.view, { w, h } = c.size(); return [Math.round(w / 2 + (2080 - v.cx) * v.zoom), Math.round(h / 2 + (1650 - v.cy) * v.zoom)]; });
  const before = await page.evaluate((pt) => window.TF.camera.toWorld(pt[0], pt[1]), pt);
  await page.mouse.move(pt[0], pt[1]);
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -300); await page.waitForTimeout(30); }
  let v1 = await st(); log('wheel in x6', v1);
  const under = await page.evaluate((pt) => window.TF.camera.toWorld(pt[0], pt[1]), pt);
  console.log('  world under cursor', under.map((a) => a.toFixed(2)).join(','), 'before', before.map((a) => a.toFixed(2)).join(','));
  ok.push(['wheel zooms in', v1.zoom > v0.zoom * 2], ['zoom anchored at cursor', Math.abs(under[0] - before[0]) < 0.5 && Math.abs(under[1] - before[1]) < 0.5], ['LOD far -> mid/near', v0.lod === 'far' && v1.lod !== 'far']);
  // drag pan
  await page.mouse.move(700, 450); await page.mouse.down(); await page.mouse.move(500, 400, { steps: 8 }); await page.mouse.up();
  const v2 = await st(); log('drag -200,-50 px', v2);
  ok.push(['drag pans', Math.abs((v2.cx - v1.cx) * v2.zoom - 200) < 3 && Math.abs((v2.cy - v1.cy) * v2.zoom - 50) < 3]);
  // double-click room 6B (on screen)
  const p6c = await page.evaluate(() => { const c = window.TF.camera, v = c.view, { w, h } = c.size(); return [w / 2 + (2080 - v.cx) * v.zoom, h / 2 + (1650 - v.cy) * v.zoom]; });
  await page.mouse.dblclick(p6c[0], p6c[1]);
  const v3 = await st(); log('dblclick 6B', v3);
  ok.push(['dblclick zooms to the room', Math.abs(v3.cx - 2070) < 1 && v3.lod === 'near']);
  await page.keyboard.press('Home');
  const v4 = await st(); log('Home', v4);
  ok.push(['Home fits all', Math.abs(v4.zoom - v0.zoom) < 1e-6 && v4.lod === 'far']);
  await page.waitForTimeout(400);
  const url = await page.evaluate(() => location.search);
  console.log('  url', url); ok.push(['URL keeps ?view=', /view=/.test(url)]);
  ok.forEach(([n, r]) => console.log((r ? 'PASS ' : 'FAIL ') + n));
  if (errors.length) console.log('ERRORS:', errors.join('\n'));
  await browser.close();
})();
