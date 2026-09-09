const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const placeRing=pw=>{ T.setToolRaw('ring'); const n0=T.state().atoms.length; T.addRing(pw);
  if(T.flo()) T.commitFloat();                                  // a free-layer ring floats before it lands
  const made=T.state().atoms.slice(n0); return made.length? T.polyCentroid(made) : null; };   // its centre, for tests that need the interior
const A=T.A;
const plain=h=>h.replace(/<\/?sub>/g,'');
const formula=()=>{ const S=T.exportStructure(true,15); return S?plain(T.formulaOf(S)):'(none)'; };
const freshFree=()=>{ T.loadState(T.freshState()); T.clearSel(); const L=T.state().layers[0]; L.free=true; L.autoBond=false; return L; };

// L1 — the Radical tool now cycles none / one electron / a lone pair
console.log('--- L1  lone pair on the Radical button');
let L=freshFree();
T.placeAtom({x:0,y:0});
check('L1 a lone carbon is CH4', formula()==='CH4', formula());
T.cycleRadical({x:0,y:0});
check('L1 one dot gives CH3', T.state().atoms[0].radical===1 && formula()==='CH3', `${T.state().atoms[0].radical} / ${formula()}`);
T.cycleRadical({x:0,y:0});
check('L1 two dots give CH2', T.state().atoms[0].radical===2 && formula()==='CH2', `${T.state().atoms[0].radical} / ${formula()}`);
T.cycleRadical({x:0,y:0});
check('L1 a third click clears it', T.state().atoms[0].radical===0 && formula()==='CH4', `${T.state().atoms[0].radical} / ${formula()}`);
T.state().atoms[0].radical=2;
const prims=T.layerPrimitives(T.state().layers[0], false).filter(o=>o.k==='dot');
check('L1 a lone pair draws two dots', prims.length===2, prims.length);
check('L1 the two dots are separated, not stacked', Math.hypot(prims[0].c.x-prims[1].c.x, prims[0].c.y-prims[1].c.y)>T.settings().radicalR, Math.hypot(prims[0].c.x-prims[1].c.x, prims[0].c.y-prims[1].c.y).toFixed(4));
let mol=T.exportMOL(true);
check('L1 MOL writes RAD 3 (triplet) for a pair', /M  RAD  1  1  3/.test(mol), (mol.match(/M  RAD.*/)||['none'])[0]);
T.state().atoms[0].radical=1; mol=T.exportMOL(true);
check('L1 MOL writes RAD 2 (doublet) for one electron', /M  RAD  1  1  2/.test(mol), (mol.match(/M  RAD.*/)||['none'])[0]);
T.state().atoms[0].radical=true; T.backfill();
check('L1 an older file storing radical:true reads back as one electron', T.state().atoms[0].radical===1, String(T.state().atoms[0].radical));

// L2 — the Atom and Bond tools on a free layer: click grows away, drag aims
console.log('\n--- L2  Atom and Bond tools off the lattice');
const bearing=(a,b)=>{ const d=(Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI%360+360)%360; return d; };
const on15=d=>{ const m=((d%15)+15)%15; return Math.min(m,15-m)<1e-9; };
// the gesture, driven exactly as the pointer handler drives it
const click=(tool,pw)=>{ T.setToolRaw(tool); const d=T.growStart(pw); T.growCommit(d,pw); };
const dragTo=(tool,from,to)=>{ T.setToolRaw(tool); const d=T.growStart(from); d.moved=true; T.growCommit(d,to); };

L=freshFree();
click('atom',{x:0,y:0});
check('L2 a click in open space places a free atom', T.state().atoms.length===1 && T.state().bonds.length===0, `${T.state().atoms.length}/${T.state().bonds.length}`);
click('atom',{x:8,y:8});
check('L2 the free atom snapped to 0.1 Å', T.state().atoms[1].x===8 && T.state().atoms[1].y===8, `${T.state().atoms[1].x},${T.state().atoms[1].y}`);
// grow a chain from the first atom by clicking near it — direction comes from the neighbours, not the click
L=freshFree(); click('atom',{x:0,y:0});
click('atom',{x:0.9,y:0.0});
let st=T.state();
check('L2 a click near an atom grows one, bonded', st.atoms.length===2 && st.bonds.length===1, `${st.atoms.length}/${st.bonds.length}`);
check('L2 it is exactly one bond length away', Math.abs(Math.hypot(st.atoms[1].x,st.atoms[1].y)-A)<1e-9, Math.hypot(st.atoms[1].x,st.atoms[1].y).toFixed(6));
check('L2 with no neighbours the first bond runs along +x', Math.abs(bearing(st.atoms[0],st.atoms[1]))<1e-9, bearing(st.atoms[0],st.atoms[1]).toFixed(3)+'°');
click('atom',{x:1.42,y:0.6});                       // near atom 2, which has one neighbour at 180°
st=T.state();
// one neighbour: the chain angle decides, so a chain grown by clicking zig-zags instead of running straight
const ang=(o,p,q)=>{ const u={x:p.x-o.x,y:p.y-o.y}, v={x:q.x-o.x,y:q.y-o.y};
  return Math.acos((u.x*v.x+u.y*v.y)/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y)))*180/Math.PI; };
check('L2 the next click opens the chain angle, not a straight line', Math.abs(ang(st.atoms[1],st.atoms[0],st.atoms[2])-T.settings().chainAngle)<1e-6, ang(st.atoms[1],st.atoms[0],st.atoms[2]).toFixed(3)+'°');
check('L2 the click position did not steer it', st.atoms.length===3, st.atoms.length);
// two neighbours: the bisector of the gap they leave
L=freshFree(); click('atom',{x:0,y:0});
T.placeAtom({x:A,y:0});                             // hand-place the two neighbours
let a0=T.state().atoms[0];
dragTo('bond',{x:0,y:0},{x:-0.71,y:1.23});          // second neighbour at 120°
let b120=bearing(a0, T.state().atoms[T.state().atoms.length-1]);
check('L2 a drag aims at the 15° step nearest the cursor', on15(b120) && Math.abs(b120-120)<1e-9, b120.toFixed(3)+'°');
click('bond',{x:0.1,y:0.1});
const grown=T.state().atoms[T.state().atoms.length-1];
check('L2 a click then bisects the gap the two leave (240°)', Math.abs(bearing(a0,grown)-240)<1e-6, bearing(a0,grown).toFixed(3)+'°');
// the exact angle is kept, even when it is off the 15° grid
L=freshFree(); click('atom',{x:0,y:0});
a0=T.state().atoms[0];
T.state().atoms.push({id:99,x:A*Math.cos(0),y:0,el:'C',layer:1,charge:0,radical:0,h:null});
T.state().atoms.push({id:98,x:A*Math.cos(Math.PI*105/180),y:A*Math.sin(Math.PI*105/180),el:'C',layer:1,charge:0,radical:0,h:null});
T.state().bonds.push({a:a0.id,b:99,order:1},{a:a0.id,b:98,order:1});
const away=T.awayPoint(a0, T.state().layers[0]);
check('L2 neighbours at 0° and 105° give an unsnapped 232.5°', Math.abs(bearing(a0,away)-232.5)<1e-6, bearing(a0,away).toFixed(3)+'°');
// drag released on an existing atom bonds to it instead of making a new one
L=freshFree(); click('atom',{x:0,y:0}); click('atom',{x:4,y:0}); click('atom',{x:4,y:3});
const n0=T.state().atoms.length, e0=T.state().bonds.length;
T.setBondMode('double');
dragTo('bond',{x:0,y:0},{x:4.02,y:0.01});
st=T.state();
check('L2 a drag onto another atom bonds them, adding no atom', st.atoms.length===n0 && st.bonds.length===e0+1, `${st.atoms.length} atoms, ${st.bonds.length} bonds`);
check('L2 and the bond takes the current mode', st.bonds[st.bonds.length-1].order===2, st.bonds[st.bonds.length-1].order);
dragTo('bond',{x:0,y:0},{x:4.02,y:0.01});
check('L2 dragging the same pair again adds nothing', T.state().bonds.length===e0+1, T.state().bonds.length);
T.setBondMode('single');
// a click directly on an atom with the Atom tool is reserved for double-click editing
L=freshFree(); click('atom',{x:0,y:0});
click('atom',{x:0.05,y:0.05});
check('L2 an Atom-tool click on the atom itself does nothing', T.state().atoms.length===1, T.state().atoms.length);
check('L2 but the Bond tool grows from there', (click('bond',{x:0.05,y:0.05}), T.state().atoms.length===2), T.state().atoms.length);

// L3 — Fill and Clar circles on a free layer
console.log('\n--- L3  Fill and Clar on a free layer');
L=freshFree(); T.setRingMode('plain'); T.setRingSides(6); let ctr6=placeRing({x:0,y:0});
T.fillRing(ctr6);
check('L3 the fill stores its own polygon', T.state().fills.length===1 && T.state().fills[0].pts.length===6, JSON.stringify(T.state().fills[0]&&T.state().fills[0].pts&&T.state().fills[0].pts.length));
const fp=T.layerPrimitives(T.state().layers[0],false).find(o=>o.k==='fill');
check('L3 it renders as that polygon, not a lattice hexagon', fp && fp.pts.length===6 && fp.pts.every(v=>Math.abs(Math.hypot(v.x-ctr6.x,v.y-ctr6.y)-A)<1e-9), fp&&fp.pts.map(v=>Math.hypot(v.x-ctr6.x,v.y-ctr6.y).toFixed(3)).join(' '));
T.setRingMode('clar'); placeRing(ctr6);
check('L3 Clar mode inside an existing ring toggles a circle, adds no atoms', T.state().sextets.length===1 && T.state().atoms.length===6, `${T.state().sextets.length} sextets, ${T.state().atoms.length} atoms`);
T.setRingSides(5); T.loadState(T.freshState()); T.state().layers[0].free=true; T.state().layers[0].autoBond=false;
T.setRingMode('clar'); placeRing({x:0,y:0});
const sx=T.state().sextets[0];
check('L3 a Clar circle on a pentagon records its ring size', sx && sx.n===5, JSON.stringify(sx));
const rr=T.layerPrimitives(T.state().layers[0],false).find(o=>o.k==='ring');
check('L3 and is drawn smaller than a hexagon circle', rr && rr.r < T.settings().sextetR, rr && rr.r.toFixed(4));
T.setRingMode('plain'); T.setRingSides(6);

// L4 — a finite molecule is folded into a periodic cell in one piece
console.log('\n--- L4  molecule-wise folding into a periodic cell');
L=freshFree(); T.setRingSides(5); placeRing({x:11.5,y:0});
T.state().lattice={t1:{x:12,y:0}, t2:null, origin:{x:0,y:0}};
const S=T.exportStructure(true,15);
check('L4 all five heavy atoms survive the fold', S.atoms.length===5, S.atoms.length);
let maxd=0; for(let i=0;i<S.atoms.length;i++) for(let j=i+1;j<S.atoms.length;j++) maxd=Math.max(maxd,Math.hypot(S.atoms[i].x-S.atoms[j].x,S.atoms[i].y-S.atoms[j].y));
check('L4 the ring is not cut across the cell boundary', maxd<2.5, maxd.toFixed(4));
check('L4 the cell is still one repeat long', Math.abs(S.cell[0][0]-12)<1e-9, S.cell[0][0]);
check('L4 componentsOf sees it as one molecule', T.componentsOf(S.atoms).length===1, T.componentsOf(S.atoms).length);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
