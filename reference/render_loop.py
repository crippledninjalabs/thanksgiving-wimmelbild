#!/usr/bin/env python3
"""Render the Elon + Cybercab test loop over the stitched background.
Reusable: all motion lives in paths.json (base units = 1280x720 layout px), sprites in ../../layers/.
  python3 render_loop.py --res 4k  --out test-loop-4k.mp4
  python3 render_loop.py --res 1280 --out test-loop-preview-1280.mp4
  python3 render_loop.py --res 8k --still 0 --out still-8k-frame0.png
  python3 render_loop.py --res 1280 --frames 0,225,450,675,899 --out-dir frames/
"""
import json, math, argparse, subprocess, os, functools
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
Image.MAX_IMAGE_PIXELS=None
HERE=os.path.dirname(os.path.abspath(__file__))
P=json.load(open(os.path.join(HERE,'paths.json')))
FPS,DUR=P['fps'],P['duration']; NF=FPS*DUR
RES={'8k':(7680,4320),'4k':(3840,2160),'1280':(1280,720)}

def rp(rel): return os.path.normpath(os.path.join(HERE,rel))
def smooth(u): return u*u*(3-2*u)
EASE={'linear':lambda u:u,'in':lambda u:u*u*(3-2*u) if u<0 else (u*u if u<0.5 else 0.25+ (u-0.5)*1.0) ,'out':None}
def ease(kind,u):
    u=min(max(u,0),1)
    if kind=='linear': return u
    if kind=='out':   # decelerate to a stop: velocity ramps linearly to 0 over the last 45%
        a=0.55; vmax=1/(a+(1-a)/2)
        return vmax*u if u<a else vmax*a+vmax*((u-a)-(u-a)**2/(2*(1-a)))
    if kind=='in':    # accelerate from a stop over the first 35%
        a=0.35; vmax=1/(a/2+(1-a))
        return vmax*u*u/(2*a) if u<a else vmax*a/2+vmax*(u-a)
    return u

class Route:
    def __init__(s,pts):
        s.p=np.array(pts,float); d=np.hypot(*np.diff(s.p,axis=0).T); s.cum=np.concatenate([[0],np.cumsum(d)]); s.L=s.cum[-1]
    def at(s,dist):
        dist=min(max(dist,0),s.L); i=min(np.searchsorted(s.cum,dist,'right')-1,len(s.p)-2)
        u=(dist-s.cum[i])/max(s.cum[i+1]-s.cum[i],1e-9); return s.p[i]+(s.p[i+1]-s.p[i])*u
    def angle(s,dist,win=25):
        a=s.at(dist-win); b=s.at(dist+win); return math.degrees(math.atan2(b[1]-a[1],b[0]-a[0]))
    def dist_of_x(s,x):
        lo,hi=0,s.L
        for _ in range(50):
            m=(lo+hi)/2
            if s.at(m)[0]<x: lo=m
            else: hi=m
        return (lo+hi)/2

ROUTES={k:Route(v) for k,v in P['roads'].items()}
CABS={c['name']:c for c in P['cabs']}
def cab_def(c): return dict(CABS[c['copy_of']],name=c['name'],phase=c['phase']) if 'copy_of' in c else c

def cab_state(c,t):
    """returns None if off-duty, else (x,y,angle,door_open_weight)"""
    c=cab_def(c); R=ROUTES[c['route']]
    tr=(t-c['phase'])%DUR; segs=c['segments']
    if tr>segs[-1]['t1']: return None
    def sval(v):
        if v=='start': return 0.0
        if v=='end': return R.L
        return R.dist_of_x(v['x'])
    door=0.0
    for sg in segs:
        if sg['t0']<=tr<=sg['t1']:
            if sg.get('hold'):
                prev=segs[segs.index(sg)-1]; d=sval(prev['s1'])
                if 'door_open' in sg:
                    o0,o1=sg['door_open']; f=0.25
                    door=min(max((tr-o0)/f,0),1)*min(max((o1-tr)/f,0),1)
            else:
                u=(tr-sg['t0'])/(sg['t1']-sg['t0']); d=sval(sg['s0'])+(sval(sg['s1'])-sval(sg['s0']))*ease(sg.get('ease','linear'),u)
            x,y=R.at(d); return x,y,R.angle(d),door,d,R
    return None

# ---------------- sprites ----------------
def load_rgba(path): return Image.open(rp(path)).convert('RGBA')
def scale_rgba(im,size):
    return im.convert('RGBa').resize(size,Image.LANCZOS).convert('RGBA')

class Sprites:
    def __init__(s,k):  # k = output px per base unit
        s.k=k; cab=P['cab']; L=cab['length_base']*k
        s.cab={}
        ref_w=load_rgba(cab['sprites']['DR']).width
        for key,path in cab['sprites'].items():
            im=load_rgba(path); sc=L/ (ref_w if key!='UR' else im.width)
            s.cab[key]=scale_rgba(im,(max(1,round(im.width*sc)),max(1,round(im.height*sc))))
        e=P['elon']; H=e['height_base']*k; s.elon={}
        for f in os.listdir(rp(e['sprites_dir'])):
            if f.endswith('.png'):
                im=load_rgba(os.path.join(e['sprites_dir'],f)); sc=H/im.height
                s.elon[f[:-4]]=scale_rgba(im,(max(1,round(im.width*sc)),max(1,round(H))))
        s.rot_cache={}
    def cab_img(s,key,rot):
        q=round(rot*2)/2; ck=(key,q)
        if ck not in s.rot_cache: s.rot_cache[ck]=s.cab[key].rotate(-q,resample=Image.BICUBIC,expand=True)
        return s.rot_cache[ck]

def shadow(w,h,alpha=90):
    im=Image.new('RGBA',(int(w*1.4)+8,int(h*1.4)+8),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.ellipse([im.width/2-w/2,im.height/2-h/2,im.width/2+w/2,im.height/2+h/2],fill=(20,15,10,alpha))
    return im.filter(ImageFilter.GaussianBlur(max(1,h*0.18)))

def paste(canvas,im,cx,cy,ax=0.5,ay=0.5):
    canvas.alpha_composite(im,(int(round(cx-im.width*ax)),int(round(cy-im.height*ay))))

# ---------------- elon ----------------
def elon_state(t):
    e=P['elon']; tr=t%DUR
    for seg in e['timeline']:
        if seg['t0']<=tr<seg['t1'] or (seg is e['timeline'][-1] and tr>=seg['t0']):
            if seg['mode']=='work':
                i=int(tr*e['work_fps'])%2; return seg['at'],f"elon_work_{i+1}_{seg['facing']}",0.0
            if seg['mode']=='stand':
                return seg['at'],f"elon_walk_2_{seg['facing']}",0.0
            R=Route(seg['waypoints']); u=(tr-seg['t0'])/(seg['t1']-seg['t0'])
            # ease in/out over the first/last 4% so he starts and stops gently
            d=R.L*u; x,y=R.at(d); a,b=R.at(d-3),R.at(d+3); facing='R' if b[0]>=a[0] else 'L'
            ph=(tr-seg['t0'])*e['walk_fps']; i=int(ph)%4
            bob=abs(math.sin(math.pi*ph/2))*e['bob_frac']
            return (x,y),f"elon_walk_{i+1}_{facing}",bob
    return e['timeline'][0]['at'],'elon_work_1_R',0.0

# ---------------- frame ----------------
def render_frame(bg,S,t,k):
    fr=bg.copy(); items=[]
    for c in P['cabs']:
        st=cab_state(c,t)
        if st is None: continue
        x,y,ang,door,_,_=st; items.append((y,'cab',(x,y,ang,door)))
    (ex,ey),ekey,bob=elon_state(t); items.append((ey,'elon',(ex,ey,ekey,bob)))
    items.sort(key=lambda i:i[0])
    cab=P['cab']; hd=cab['heading_deg']; damp=cab['rotation_damping']
    for _,kind,d in items:
        if kind=='cab':
            x,y,ang,door=d; X,Y=x*k,y*k
            wUR=smooth(min(max((2-ang)/10,0),1))            # angle <-8 deg -> UR sprite, >2 deg -> DR sprite
            paste(fr,shadow(cab['length_base']*k*0.95,cab['length_base']*k*0.32),X,Y+cab['length_base']*k*0.05)
            layers=[]
            if wUR<1:
                base='DR'; layers.append((S.cab_img('DR',(ang-hd['DR'])*damp),1-wUR,1-door))
                if door>0: layers.append((S.cab_img('DR_open',(ang-hd['DR'])*damp),(1-wUR)*door,None))
            if wUR>0: layers.append((S.cab_img('UR',(ang-hd['UR'])*damp),wUR,None))
            for im,w,_ in layers:
                if w<=0.001: continue
                if w<0.999:
                    a=np.asarray(im).copy(); a[...,3]=(a[...,3]*w).astype(np.uint8); im=Image.fromarray(a)
                paste(fr,im,X,Y,0.5,cab['anchor_y'])
        else:
            ex,ey,ekey,bob=d; im=S.elon[ekey]; X,Y=ex*k,ey*k
            paste(fr,shadow(im.width*0.9,im.width*0.28,80),X,Y)
            paste(fr,im,X,Y-bob*im.height,0.5,0.97)
    return fr

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--res',default='1280'); ap.add_argument('--out'); ap.add_argument('--still',type=int)
    ap.add_argument('--frames'); ap.add_argument('--out-dir'); ap.add_argument('--crf',default='18'); ap.add_argument('--preset',default='medium')
    a=ap.parse_args(); W,H=RES[a.res]; k=W/1280
    bgp=rp(P['background'][a.res]); bg=Image.open(bgp).convert('RGBA')
    if bg.size!=(W,H): bg=bg.resize((W,H),Image.LANCZOS)
    S=Sprites(k)
    if a.still is not None:
        render_frame(bg,S,a.still/FPS,k).convert('RGB').save(a.out); print('wrote',a.out); return
    if a.frames:
        os.makedirs(a.out_dir,exist_ok=True)
        for f in [int(x) for x in a.frames.split(',')]:
            render_frame(bg,S,f/FPS,k).convert('RGB').save(os.path.join(a.out_dir,f'frame_{f:04d}.png'))
        return
    cmd=['ffmpeg','-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
         '-c:v','libx264','-preset',a.preset,'-crf',a.crf,'-pix_fmt','yuv420p','-movflags','+faststart','-tag:v','avc1',a.out]
    pr=subprocess.Popen(cmd,stdin=subprocess.PIPE)
    for f in range(NF):
        pr.stdin.write(render_frame(bg,S,f/FPS,k).convert('RGB').tobytes())
        if f%150==0: print('frame',f,flush=True)
    pr.stdin.close(); pr.wait(); print('wrote',a.out)

if __name__=='__main__': main()
