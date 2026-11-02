#!/usr/bin/env python3
"""Run the original render_loop math and write test/expected.json."""
import importlib.util
import json
import os
import shutil
import tempfile

from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
TIMES = [0, 0.4, 1, 2.9, 3, 3.5, 3.625, 5, 6, 6.5, 7, 8, 10, 12, 14.5, 14.51,
         15, 16, 17, 18.5, 20, 24, 25, 29.5, 29.599, 29.6, 29.9, 30, 45.5]
PASTE_TIMES = [0, 5, 10, 20]
K = 6


def main():
    paths = json.load(open(os.path.join(ROOT, 'motion', 'paths.json'), encoding='utf-8'))
    tmp = tempfile.mkdtemp(prefix='wimmel-ref-')
    try:
        data = json.loads(json.dumps(paths))
        data['background'] = {
            '8k': os.path.join(ROOT, 'assets', 'background-8k.jpg'),
            '4k': os.path.join(ROOT, 'assets', 'background-4k.jpg'),
            '1280': os.path.join(ROOT, 'assets', 'background-4k.jpg'),
        }
        data['cab']['sprites'] = {
            'DR': os.path.join(ROOT, 'assets', 'sprites', 'cybercabs', 'cab_closed_DR.png'),
            'DR_open': os.path.join(ROOT, 'assets', 'sprites', 'cybercabs', 'cab_door_open_DR.png'),
            'UR': os.path.join(ROOT, 'assets', 'sprites', 'cybercabs', 'cab_closed_UR.png'),
        }
        data['elon']['sprites_dir'] = os.path.join(ROOT, 'assets', 'sprites', 'elon')
        with open(os.path.join(tmp, 'paths.json'), 'w', encoding='utf-8') as f:
            json.dump(data, f)
        shutil.copy(os.path.join(ROOT, 'reference', 'render_loop.py'), os.path.join(tmp, 'render_loop.py'))
        spec = importlib.util.spec_from_file_location('render_loop', os.path.join(tmp, 'render_loop.py'))
        R = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(R)
        S = R.Sprites(K)
        cab = R.P['cab']
        hd = cab['heading_deg']
        damp = cab['rotation_damping']

        def layers_at(t):
            items = []
            seq = 0
            for c in R.P['cabs']:
                st = R.cab_state(c, t)
                if st is None:
                    continue
                x, y, ang, door, dist, _route = st
                wUR = R.smooth(min(max((2 - ang) / 10, 0), 1))
                qDR = round((ang - hd['DR']) * damp * 2) / 2
                qUR = round((ang - hd['UR']) * damp * 2) / 2
                X, Y = x * K, y * K
                specs = []
                if wUR < 1:
                    specs.append(('DR', qDR, 1 - wUR))
                    if door > 0:
                        specs.append(('DR_open', qDR, (1 - wUR) * door))
                if wUR > 0:
                    specs.append(('UR', qUR, wUR))
                for key, rot, alpha in specs:
                    if alpha <= 0.001:
                        continue
                    im = S.cab_img(key, rot)
                    raw = S.cab[key]
                    tlx = int(round(X - im.width * 0.5))
                    tly = int(round(Y - im.height * cab['anchor_y']))
                    items.append((y, seq, {
                        'image': f'cab:{key}',
                        'alpha': alpha,
                        'rotation': rot,
                        'w': raw.width,
                        'h': raw.height,
                        'bw': im.width,
                        'bh': im.height,
                        'tlx': tlx,
                        'tly': tly,
                    }))
                    seq += 1
            (ex, ey), ekey, bob = R.elon_state(t)
            im = S.elon[ekey]
            X, Y = ex * K, ey * K
            py = Y - bob * im.height
            items.append((ey, seq, {
                'image': f'elon:{ekey}',
                'alpha': 1,
                'rotation': 0,
                'w': im.width,
                'h': im.height,
                'bw': im.width,
                'bh': im.height,
                'tlx': int(round(X - im.width * 0.5)),
                'tly': int(round(py - im.height * 0.97)),
                'bob': bob,
            }))
            items.sort(key=lambda it: (it[0], it[1]))
            return [it[2] for it in items]

        poses = []
        for t in TIMES:
            el = R.elon_state(t)
            cabs = []
            for c in R.P['cabs']:
                st = R.cab_state(c, t)
                if st is None:
                    cabs.append(None)
                    continue
                x, y, ang, door, dist, _route = st
                wUR = R.smooth(min(max((2 - ang) / 10, 0), 1))
                cabs.append({
                    'name': c['name'],
                    'x': x,
                    'y': y,
                    'angle': ang,
                    'door': door,
                    'dist': dist,
                    'wUR': wUR,
                    'qDR': round((ang - hd['DR']) * damp * 2) / 2,
                    'qUR': round((ang - hd['UR']) * damp * 2) / 2,
                })
            poses.append({
                't': t,
                'elon': {'x': el[0][0], 'y': el[0][1], 'sprite': el[1], 'bob': el[2]},
                'cabs': cabs,
            })

        sizes = {'cab': {}, 'elon': {}}
        for key, im in S.cab.items():
            sizes['cab'][key] = [im.width, im.height]
        for key, im in S.elon.items():
            sizes['elon'][key] = [im.width, im.height]

        rounds = []
        for v in [0, 0.5, 1.5, 2.5, -0.5, -1.5, -2.5, 1.2, -1.2, 3, -4]:
            rounds.append({'x': v, 'y': int(round(v))})

        out = {
            'times': TIMES,
            'k': K,
            'rounds': rounds,
            'poses': poses,
            'sizes': sizes,
            'pastes': [{'t': t, 'layers': layers_at(t)} for t in PASTE_TIMES],
        }
        dest = os.path.join(ROOT, 'test', 'expected.json')
        with open(dest, 'w', encoding='utf-8') as f:
            json.dump(out, f)
            f.write('\n')
        print('wrote', dest)
    finally:
        shutil.rmtree(tmp)


if __name__ == '__main__':
    main()
