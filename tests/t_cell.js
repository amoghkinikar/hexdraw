// Deliverable I — a lattice vector that is not a repeat of the drawing
const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const A=T.A, S3=Math.sqrt(3), AX=S3*A;              // 2.4595 A, the honeycomb lattice constant along x
const near=(a,b,e=1e-9)=>Math.abs(a-b)<e;
const msg=()=>document.getElementById('msg').textContent;
const ring=pw=>{ T.setToolRaw('ring'); T.addRing(pw); if(T.flo()) T.commitFloat(); };
const atAt=(x,y)=>T.state().atoms.find(a=>Math.abs(a.x-x)<0.02&&Math.abs(a.y-y)<0.02);
// a strip of n hexagons along x, on the honeycomb
function strip(n){ T.loadState(T.freshState()); T.clearSel(); T.setCellOverride(null); T.setRingMode('plain');
  for(let i=0;i<n;i++) ring({x:i*AX, y:0}); return T.state(); }
const overlaps=()=>{ const S=T.exportStructure(false,0); return S? S.overlaps : -1; };
const minSep=at=>{ let m=1e9; for(let i=0;i<at.length;i++) for(let j=i+1;j<at.length;j++)
  if(Math.abs(at[i].z-at[j].z)<0.05) m=Math.min(m,Math.hypot(at[i].x-at[j].x,at[i].y-at[j].y)); return m; };
// confirm() is stubbed to true; tests that care drive it and count the asks
let asked=0, answer=true;
globalThis.confirm=()=>{ asked++; return answer; };

console.log('--- I1  the Lattice tool picks on the active layer only');
strip(4);
T.state().layers.push({id:2,name:'Layer 2',z:3.35,dx:0,dy:0,visible:true,color:'#000000',autoBond:true,free:true});
T.state().atoms.push({id:900,x:0,y:-A,el:'C',layer:2,charge:0,radical:0,h:null});   // exactly over a Layer 1 atom
T.setActive(1); T.setPicks([]); T.setToolRaw('lattice');
T.latticePick({x:0,y:-A});
check('I1 a pick on the active layer is taken', T.picks().length===1, T.picks().length);
const gotL1 = T.atomById(T.picks()[0]).layer===1;
check('I1 and it is the active layer\'s atom, not the one stacked above it', gotL1, T.atomById(T.picks()[0]).layer);
T.setActive(2); T.setPicks([]);
T.latticePick({x:AX,y:-A});                       // a Layer 1 atom, with Layer 2 active
check('I1 a pick on another layer is refused', T.picks().length===0, T.picks().length);
check('I1 and the status bar names the layer it is on', /Layer 1/.test(msg()) && /active layer/.test(msg()), msg());
T.setActive(1);
check('I1 findAtomAnyLayer still reaches across layers for the tools that want it', T.findAtomAnyLayer({x:0,y:-A})!==null, 'null');

console.log('\n--- I2  is the vector a repeat of this drawing?');
strip(4);
const p0=atAt(0,-A), p1=atAt(AX,-A);              // two equivalent sites, one lattice constant apart
check('I2 the fixture has both atoms', !!p0 && !!p1, `${!!p0}/${!!p1}`);
T.setPicks([p0.id,p1.id]); asked=0; T.assignVector('t1');
check('I2 an exact repeat gives a1 = (2.4595, 0)', near(T.state().lattice.t1.x,AX,1e-9)&&near(T.state().lattice.t1.y,0,1e-9), JSON.stringify(T.state().lattice.t1));
check('I2 no atoms collide in the cell', overlaps()===0, overlaps());
check('I2 and nothing was asked', asked===0, asked);
// now break it by the amount that broke the user's file
T.state().lattice.t1={x:AX-0.1, y:0.2};
check('I2 a vector 0.22 A off collapses nothing: many pairs collide', overlaps()>10, overlaps());
// and prove the honeycomb bound: between two atoms on one honeycomb layer the error is only 0 or 1.42
const errs=new Set();
for(const a of T.state().atoms) for(const b of T.state().atoms){ if(a===b) continue;
  const v={x:b.x-a.x,y:b.y-a.y}, s=T.snapLatticeVector(v);
  errs.add(+Math.hypot(s.x-v.x,s.y-v.y).toFixed(4)); }
check('I2 on one honeycomb layer the snap correction is only ever 0 or 1.42 A', [...errs].sort((x,y)=>x-y).join(',')==='0,1.42', [...errs].sort((x,y)=>x-y).join(','));

console.log('\n--- I3  the diagnosis, and the snap it offers');
strip(4);
const q0=atAt(0,-A), q1=atAt(AX+A*S3/2, -A/2);    // one repeat along, but the other sublattice
check('I3 the fixture has the opposite-sublattice atom', !!q1, String(!!q1));
T.setPicks([q0.id,q1.id]); asked=0; answer=false;  // decline the snap
T.assignVector('t1');
check('I3 a wrong-sublattice pick is caught and the snap offered', asked===1, asked);
check('I3 declining leaves the vector alone', !near(T.state().lattice.t1.y,0,1e-9), JSON.stringify(T.state().lattice.t1));
check('I3 and the status bar says it is not a repeat', /not a repeat/.test(msg()), msg());
const wrong={...T.state().lattice.t1}, depth=T.undoDepth();
T.setPicks([q0.id,q1.id]); asked=0; answer=true;   // accept it
T.assignVector('t1');
const snapped=T.state().lattice.t1;
// Three lattice vectors sit exactly 1.42 A from a wrong-sublattice pick, so which one the snap lands
// on is arbitrary. What has to hold is that it IS one, and that the cell is sound afterwards.
const sn=T.snapLatticeVector(snapped);
check('I3 accepting gives a genuine lattice translation', near(sn.x,snapped.x,1e-9)&&near(sn.y,snapped.y,1e-9), JSON.stringify(snapped));
check('I3 1.42 A from the vector that was drawn', near(Math.hypot(snapped.x-wrong.x,snapped.y-wrong.y),A,1e-6), Math.hypot(snapped.x-wrong.x,snapped.y-wrong.y).toFixed(4));
check('I3 and the cell is sound', T.cellFault()===null && overlaps()===0, String(T.cellFault()));
check('I3 it says so', /snapped/.test(msg()), msg());
check('I3 the snap rides in the assignment\'s own undo step, not a second one', T.undoDepth()===depth+1, `${T.undoDepth()} vs ${depth+1}`);
check('I3 so one undo restores the vector as it was before this assignment', (T.undo(),
  near(T.state().lattice.t1.x,wrong.x,1e-9)&&near(T.state().lattice.t1.y,wrong.y,1e-9)), JSON.stringify(T.state().lattice.t1));
// a free layer has no lattice to snap to, so it is warned and not offered one
T.loadState(T.freshState()); T.clearSel(); T.setCellOverride(null);
T.state().layers[0].free=true; T.state().layers[0].autoBond=false;
T.setRingSides(5); ring({x:0,y:0}); ring({x:5.13,y:0});
const f0=T.state().atoms[0], f1=T.state().atoms[5];
T.setPicks([f0.id,f1.id]); asked=0; answer=true;
T.assignVector('t1');
check('I3 on a free layer no snap is offered', asked===0, asked);

console.log('\n--- I4  exporting the atoms inside the cell instead of folding');
strip(6);
const nAll=T.state().atoms.length;
T.state().lattice={t1:{x:AX-0.1,y:0.2}, t2:null, origin:{x:atAt(0,-A).x, y:atAt(0,-A).y}};
const fold=T.exportStructure(true,15,false), ins=T.exportStructure(true,15,true);
check('I4 folding a bad cell piles up ghosts', fold.overlaps>10, fold.overlaps);
check('I4 selecting the cell contents produces none', ins.overlaps===0, ins.overlaps);
check('I4 and far fewer atoms than were drawn', ins.atoms.length>0 && ins.atoms.length<nAll/3, `${ins.atoms.length} of ${nAll}`);
check('I4 no two of them are closer than 1.3 A', minSep(ins.atoms)>1.3, minSep(ins.atoms).toFixed(4));
check('I4 the fold, by contrast, has pairs far closer', minSep(fold.atoms)<0.5, minSep(fold.atoms).toFixed(4));
check('I4 the exported cell is still the vector the user defined', near(ins.cell[0][0],AX-0.1,1e-9), JSON.stringify(ins.cell[0]));
check('I4 it reports how many atoms sit near the cut', typeof ins.nearEdge==='number', String(ins.nearEdge));
check('I4 an exact cell is unaffected by the flag', (()=>{
  T.state().lattice.t1={x:AX,y:0};
  const a=T.exportStructure(true,15,false), b=T.exportStructure(true,15,true);
  return a.overlaps===0 && b.overlaps===0 && a.atoms.length===b.atoms.length; })(), 'the two paths disagree on a good cell');
// a molecule that straddles the boundary is kept whole rather than sliced
T.loadState(T.freshState()); T.clearSel(); T.setCellOverride(null);
T.state().layers[0].free=true; T.state().layers[0].autoBond=false;
T.setRingSides(5); T.setRingMode('plain'); ring({x:0,y:0});
const cen=T.polyCentroid(T.state().atoms);
T.state().lattice={t1:{x:8,y:0}, t2:null, origin:{x:cen.x-4+0.9, y:0}};   // the ring straddles the f=1 edge
const whole=T.exportStructure(false,15,true);
check('I4 a molecule straddling the cut is kept entire, not sliced', whole.atoms.length===5, whole.atoms.length);

console.log('\n--- I5  the export gate');
strip(6);
T.state().lattice={t1:{x:AX-0.1,y:0.2}, t2:null, origin:{x:atAt(0,-A).x, y:atAt(0,-A).y}};
T.setCellOverride(null); asked=0; answer=true;
check('I5 a bad cell asks, and offers the cell contents', T.cellGate()==='inside' && asked===1, `${T.cellGate()}/${asked}`);
asked=0;
check('I5 the answer is remembered, so it does not ask twice', T.cellGate()==='inside' && asked===0, asked);
T.setCellOverride(null); asked=0; answer=false;
check('I5 declining stops the export', T.cellGate()==='stop' && asked===1, `${asked}`);
T.setCellOverride(null); asked=0;
const r=T.produceInner('xyz', true, 15);
check('I5 and produceInner reports it as aborted, writing nothing', r.aborted===true && r.text==='', JSON.stringify(r).slice(0,60));
T.setCellOverride(null); answer=true; asked=0;
const r2=T.produceInner('xyz', true, 15);
check('I5 accepting writes a file', !r2.aborted && r2.text.length>0, String(r2.aborted));
check('I5 whose atom count is one cell, not six', +r2.text.split('\n')[0] < 60, r2.text.split('\n')[0]);
T.state().lattice.t1={x:AX,y:0}; T.setCellOverride(null); asked=0;
check('I5 a good cell is never questioned', T.cellGate()==='fold' && asked===0, `${T.cellGate()}/${asked}`);
check('I5 and a drawing with no lattice is not either', (()=>{ strip(2); T.setCellOverride(null); asked=0;
  const x=T.produceInner('xyz',true,15); return !x.aborted && asked===0; })(), 'it asked');
// assigning a vector forgets a remembered answer
strip(6); T.state().lattice={t1:{x:AX-0.1,y:0.2},t2:null,origin:{x:0,y:0}};
T.setCellOverride(true);
T.setPicks([atAt(0,-A).id, atAt(AX,-A).id]); T.assignVector('t1');
check('I5 defining a vector clears the remembered answer', T.cellOverride()===null, String(T.cellOverride()));

console.log('\n--- I6  the status bar shows it before you ever export');
strip(6);
T.state().lattice={t1:{x:AX,y:0}, t2:null, origin:{x:0,y:0}};
T.updateStatus();
let f=document.getElementById('formula').innerHTML;
check('I6 a good cell prints its formula', /1D cell:/.test(f) && !/not a repeat/.test(f), f.slice(0,60));
T.state().lattice.t1={x:AX-0.1,y:0.2}; T.updateStatus();
f=document.getElementById('formula').innerHTML;
check('I6 a bad one says so instead, in the warning colour', /not a repeat/.test(f) && /--vec/.test(f), f.slice(0,90));
check('I6 and prints no formula anybody might believe', !/<sub>/.test(f), f.slice(0,90));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
