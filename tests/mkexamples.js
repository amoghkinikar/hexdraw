// Builds the project files under examples/ — the six drawings the manual walks through — with the app's
// own functions, so they are exactly what the tools would have drawn. Run from tests/: node mkexamples.js
const T=require('./harness.js'); const fs=require('fs'); const path=require('path');
const OUT=path.join(__dirname,'..','examples');
const A=T.A;
const fresh=()=>{ T.loadState(T.freshState()); T.clearSel(); };
const save=(name)=>{ const s=T.state(); const f=path.join(OUT,name); fs.writeFileSync(f, JSON.stringify(s,null,1)); if(process.env.SVG) fs.writeFileSync(path.join(process.env.SVG, name.replace('.json','.svg')), T.exportSVG()); console.log(name, T.formulaOf(T.exportStructure(true,15)).replace(/<[^>]+>/g,''), '-', s.atoms.length,'atoms'); };
const ring=(x,y)=>{ T.setToolRaw('ring'); T.addRing({x,y}); if(T.flo()) T.commitFloat(); };
const centre=()=>{ const L=T.activeLayer(); const r=T.ringsOf(L); const c=T.polyCentroid(r[r.length-1]); return {x:c.x+L.dx, y:c.y+L.dy}; };   // in world coordinates
const v1=()=>T.fromCanon(T.A1), v2=()=>T.fromCanon(T.A2);
const add=(p,q,k=1)=>({x:p.x+k*q.x, y:p.y+k*q.y});
const ringAt=(c,i,j)=>{ const a=v1(), b=v2(); ring(c.x+i*a.x+j*b.x, c.y+i*a.y+j*b.y); };
const atomsNear=(p,r=0.1)=>T.state().atoms.filter(a=>Math.hypot(a.x-p.x,a.y-p.y)<r);
const bond=(a,b)=>{ if(!T.bondMap().has(T.bondKey(a.id,b.id))) T.state().bonds.push({a:a.id,b:b.id,order:1}); };

// 1. [3]triangulene — six rings in a triangle, two radicals, three Clar circles
fresh(); T.setRingMode('plain');
ring(0,0); const c0=centre();
ringAt(c0,1,0); ringAt(c0,2,0);
ringAt(c0,0,1); ringAt(c0,1,1);
ringAt(c0,0,2);
{ // Clar circles on the three corner rings: the three centres farthest from the centroid of all centres.
  // No radical dots: [3]triangulene is C22H12 as drawn — its two unpaired electrons are π electrons and
  // every edge carbon keeps its hydrogen, while a dot in HexDraw means a carbon that has lost one.
  const st=T.state(); const cs=T.ringsOf(T.activeLayer()).map(r=>T.polyCentroid(r));
  const g={x:cs.reduce((s,c)=>s+c.x,0)/cs.length, y:cs.reduce((s,c)=>s+c.y,0)/cs.length};
  cs.map(c=>({c,d:Math.hypot(c.x-g.x,c.y-g.y)})).sort((p,q)=>q.d-p.d).slice(0,3).forEach(({c})=>st.sextets.push({x:c.x,y:c.y,layer:1}));
}
save('triangulene.json');

// 2. a 7-AGNR strip with its 1D cell. After Rotate 30° the armchair direction runs along x; rings share
// edges only along a₁ = (2.13, 1.23) and a₂ = (0, 2.46), so the ribbon is columns of three rings stacked
// along a₂ alternating with columns of two, each half a repeat on from the last; the repeat is
// 2·a₁ − a₂ = (4.26, 0) and the cell is C14H4.
fresh(); T.rotateAll(); T.setRingMode('plain');
ring(0,0); const g0=centre(); const ra=v1(), rb=v2(); const rep={x:2*ra.x-rb.x, y:2*ra.y-rb.y};
for(let m=0;m<10;m++) for(let n=0;n<(m%2?2:3);n++){ const k=n-Math.floor(m/2); ring(g0.x+m*ra.x+k*rb.x, g0.y+m*ra.y+k*rb.y); }   // 3-2-3-2: seven dimer lines
{ const st=T.state(); const top=Math.max(...st.atoms.map(a=>a.y));
  const p=st.atoms.filter(a=>Math.abs(a.y-top)<0.05).sort((u,v)=>u.x-v.x)[2];   // a top-edge carbon one repeat in
  st.lattice.t1={x:rep.x, y:rep.y}; st.lattice.origin={x:p.x,y:p.y}; }
save('agnr7-cell.json');

// 3. AB-stacked bilayer coronene
fresh(); T.setRingMode('plain');
const coronene=(x0,y0)=>{ ring(x0,y0); const c=centre(); const a=v1(), b=v2(); for(const [i,j] of [[1,0],[0,1],[-1,1],[-1,0],[0,-1],[1,-1]]) ring(c.x+i*a.x+j*b.x, c.y+i*a.y+j*b.y); };
coronene(0,0);
{ const st=T.state(); st.layers.push({id:2,name:'Layer 2',z:3.35,dx:0,dy:1.42,visible:true,color:'#1f6f8b',autoBond:true,free:false}); st.active=2; }
coronene(0,1.42);   // the upper layer's centre ring sits over an atom of the lower one — AB stacking
save('bilayer-coronene.json');

// 4. graphene with a nitrogen dopant and a 2D cell
fresh(); T.setRingMode('plain');
ring(0,0); const h0=centre();
for(let i=-2;i<=2;i++) for(let j=-2;j<=2;j++) if(Math.abs(i+j)<=2) ringAt(h0,i,j);
{ const st=T.state(); const mid=st.atoms.map(a=>({a,d:Math.hypot(a.x-h0.x,a.y-h0.y)})).sort((p,q)=>p.d-q.d)[0].a; mid.el='N';
  const a=v1(), b=v2();   // a 2×2 supercell: N and three carbons at its images 2·a₁ and 2·a₂ away
  st.lattice.t1={x:2*a.x,y:2*a.y}; st.lattice.t2={x:2*b.x,y:2*b.y}; st.lattice.origin={x:mid.x,y:mid.y}; }
save('graphene-N-2x2.json');

// 5. iron phthalocyanine on a free layer
fresh();
{ const st=T.state(); st.layers[0].free=true; st.layers[0].autoBond=false; }
T.armTemplate('pc'); T.startTemplatePlacement({x:0,y:0}); T.commitFloat();
{ const st=T.state(); const L=T.activeLayer();
  const cx=st.atoms.reduce((s,a)=>s+a.x,0)/st.atoms.length, cy=st.atoms.reduce((s,a)=>s+a.y,0)/st.atoms.length;
  const fe={id:st.nextId++, x:cx, y:cy, layer:L.id, el:'Fe', h:0}; st.atoms.push(fe);
  const inner=st.atoms.filter(a=>a.el==='N' && Math.hypot(a.x-cx,a.y-cy)<2.3);
  for(const n of inner){ bond(fe,n); if(n.h) delete n.h; }
}
save('fe-phthalocyanine.json');

// 6. a reaction scheme: anthracene → 9,10-dihydroanthracene, two structures and a labelled arrow
fresh(); T.setRingMode('benzene');
ring(0,0); const s0=centre(); ringAt(s0,1,0); ringAt(s0,2,0);
{ const st=T.state(); const right=Math.max(...st.atoms.map(a=>a.x));
  T.setGraphicKind('arrow'); T.placeGraphic({x:right+1.2,y:0},{x:right+5.2,y:0});
  st.texts.push({x:right+3.2, y:-0.75, layer:1, text:'H2, Pd/C', size:0.55});
  st.texts.push({x:right+3.2, y:0.85, layer:1, text:'EtOH', size:0.55}); }
{ // the product: the middle ring plain with two sp³ CH₂ bridgeheads, the outer rings aromatic
  const st=T.state(); const shift=Math.max(...st.atoms.map(a=>a.x))+8;
  T.setRingMode('plain'); ring(shift,0); const p0=centre(); T.setRingMode('benzene'); ringAt(p0,1,0); ringAt(p0,-1,0);
  st.atoms.filter(a=>Math.abs(a.x-p0.x)<0.2).forEach(a=>{ a.sp3=true; });
}
save('reaction-scheme.json');
