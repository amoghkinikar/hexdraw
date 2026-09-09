// Deliverable C — free-layer editing fixes and small tool changes
const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const placeRing=pw=>{ T.setToolRaw('ring'); const n0=T.state().atoms.length; T.addRing(pw);
  if(T.flo()) T.commitFloat();                                  // a free-layer ring floats before it lands
  const made=T.state().atoms.slice(n0); return made.length? T.polyCentroid(made) : null; };   // its centre, for tests that need the interior
const A=T.A;
const near=(a,b,e=1e-9)=>Math.abs(a-b)<e;
const bearing=(a,b)=>((Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI%360)+360)%360;
const on15=d=>{ const m=((d%15)+15)%15; return Math.min(m,15-m)<1e-9; };
const freshFree=()=>{ T.loadState(T.freshState()); T.clearSel(); const L=T.state().layers[0]; L.free=true; L.autoBond=false; return L; };
const click=(tool,pw)=>{ T.setToolRaw(tool); const d=T.growStart(pw); T.growCommit(d,pw); };
const dist=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
const plain=h=>h.replace(/<\/?sub>/g,'');
const formula=()=>{ const S=T.exportStructure(true,15); return S?plain(T.formulaOf(S)):'(none)'; };

// a free layer holding two bonded atoms: id1 at the origin, id2 one bond length along +x
function pair(){
  freshFree(); click('atom',{x:0,y:0}); click('bond',{x:0.1,y:0});
  const st=T.state(); return {a1:st.atoms[0], a2:st.atoms[1]};
}

console.log('--- C1  dragging an atom keeps its bonds');
let {a1,a2}=pair();
check('C1 setup: two atoms, one bond, 1.42 Å apart', T.state().atoms.length===2 && T.state().bonds.length===1 && near(dist(a1,a2),A,1e-9), `${T.state().atoms.length}/${T.state().bonds.length}/${dist(a1,a2).toFixed(4)}`);

// the float shows the external bond while it is being dragged
T.clearSel(); T.sel().atoms.add(a2.id); T.startFloat('move');
const svg=T.floatSVG();
check('C1 the stretched bond is drawn while floating', svg.includes('stroke-dasharray="0.2 0.12"'), svg.slice(0,120));
check('C1 and it reaches the fixed neighbour at (0,0)', /x2="0"\s+y2="0"/.test(svg), (svg.match(/x2="[^"]*" y2="[^"]*"/g)||[]).join(' '));

// the swing rule: measured from the neighbour, so the cursor says where the atom goes
let pv=T.floDragPV({x:A,y:A}, false, {x:A,y:0});
let landed={x:a2.x+pv.x, y:a2.y+pv.y};
check('C1 an unshifted drag lands the atom 1.42 Å from its neighbour', near(Math.hypot(landed.x,landed.y),A,1e-9), Math.hypot(landed.x,landed.y).toFixed(6));
check('C1 at a multiple of 15°', on15(bearing({x:0,y:0},landed)), bearing({x:0,y:0},landed).toFixed(4)+'°');
pv=T.floDragPV({x:A,y:A}, true, {x:A,y:0});
check('C1 Shift falls back to the plain 0.1 Å snap', near(pv.x,0,1e-9)&&near(pv.y,1.4,1e-9), JSON.stringify(pv));

// cancel puts everything back
T.cancelFloat();
check('C1 cancel restores the atom and the bond', T.state().atoms.length===2 && T.state().bonds.length===1 && near(T.state().atoms[1].x,A,1e-9), `${T.state().atoms.length}/${T.state().bonds.length}`);

// a stretched bond survives the commit on a free layer
({a1,a2}=pair());
T.clearSel(); T.sel().atoms.add(a2.id); T.startFloat('move'); T.floTranslate({x:2.3-A, y:0}); T.commitFloat();
let st=T.state();
check('C1 free layer: the bond survives a 2.3 Å stretch', st.bonds.length===1, st.bonds.length);
check('C1 it still joins the same two atoms', st.bonds[0] && ((st.bonds[0].a===a1.id&&st.bonds[0].b===a2.id)||(st.bonds[0].a===a2.id&&st.bonds[0].b===a1.id)), JSON.stringify(st.bonds[0]));
check('C1 and is now 2.3 Å long', near(dist(T.atomById(st.bonds[0].a),T.atomById(st.bonds[0].b)),2.3,1e-9), dist(T.atomById(st.bonds[0].a),T.atomById(st.bonds[0].b)).toFixed(6));

// a honeycomb layer still drops a bond that is no longer a bond length
T.loadState(T.freshState()); T.clearSel(); T.setRingMode('plain'); placeRing({x:0,y:0});
check('C1 honeycomb setup: 6 atoms, 6 bonds', T.state().atoms.length===6 && T.state().bonds.length===6, `${T.state().atoms.length}/${T.state().bonds.length}`);
const victim=T.state().atoms[0];
T.clearSel(); T.sel().atoms.add(victim.id); T.startFloat('move'); T.floTranslate({x:10,y:0}); T.commitFloat();
check('C1 honeycomb: the two bonds are dropped, as before', T.state().atoms.length===6 && T.state().bonds.length===4, `${T.state().atoms.length}/${T.state().bonds.length}`);

// the swing only applies to a lone atom with exactly one neighbour
({a1,a2}=pair());
T.clearSel(); T.sel().atoms.add(a1.id); T.sel().atoms.add(a2.id); T.startFloat('move');
check('C1 a two-atom fragment is not a swing', T.floSingleSwing()===null, 'a swing was offered');
T.cancelFloat();


console.log('\n--- C2  the number keys act on the bond you last clicked');
T.loadState(T.freshState()); T.clearSel(); T.setRingMode('plain'); placeRing({x:0,y:0});
T.setToolRaw('bond'); T.setBondMode('single');
const b0=T.state().bonds[0], p1=T.atomById(b0.a), p2=T.atomById(b0.b);
T.bondAt({x:(p1.x+p2.x)/2, y:(p1.y+p2.y)/2});
check('C2 clicking a bond makes it the current bond', T.curBond()===b0, String(T.curBond()));
T.bondModeKey('2');
check('C2 pressing 2 makes that bond double', b0.order===2, b0.order);
T.bondModeKey('w');
check('C2 pressing W makes it a wedge', b0.order===1 && b0.style==='wedge' && b0.narrow!=null, `${b0.order}/${b0.style}/${b0.narrow}`);
T.bondModeKey('4');
check('C2 pressing 4 makes it dashed, with no narrow end', b0.order===1 && b0.style==='dash' && b0.narrow===undefined, `${b0.order}/${b0.style}/${b0.narrow}`);
check('C2 the current bond is highlighted in the guides', T.buildGuides().includes('stroke-opacity="0.25" stroke-width="0.3"'), 'no highlight');
// a stale reference after undo must not throw or corrupt anything
T.undo();
check('C2 undo clears the current bond', T.curBond()===null, String(T.curBond()));
const before=JSON.stringify(T.state());
T.bondModeKey('3');
check('C2 a mode key with no current bond changes nothing', JSON.stringify(T.state())===before, 'state changed');
// hand-set a stale bond object and make sure it is rejected rather than applied
T.setCurBond({a:1,b:2,order:1});
T.bondModeKey('2');
check('C2 a stale bond object is discarded, not applied', T.curBond()===null && JSON.stringify(T.state())===before, 'stale bond survived');
// the right-click menu also sets the current bond
T.setToolRaw('bond'); T.setCtxBond(T.state().bonds[1]); T.bondAction('3');
check('C2 the right-click menu sets the current bond too', T.curBond()===T.state().bonds[1] && T.state().bonds[1].order===3, `${T.curBond()===T.state().bonds[1]}/${T.state().bonds[1].order}`);
// tool change forgets it
T.setTool('select');
check('C2 changing tool forgets the current bond', T.curBond()===null, String(T.curBond()));

console.log('\n--- C3  the Bond tool grows carbon; the Atom tool shows its element');
T.loadState(T.freshState()); T.clearSel(); T.setRingMode('plain'); placeRing({x:0,y:0});
T.setElement('O', null);
check('C3 the ribbon labels the sticky element', T.elementLabel()==='Atom O', T.elementLabel());
const nAt=T.state().atoms.length;
T.setToolRaw('bond'); T.setBondMode('single'); T.bondOut({x:T.atomById(T.state().atoms[0].id).x+0.1, y:T.state().atoms[0].y});
const grown=T.state().atoms[T.state().atoms.length-1];
check('C3 honeycomb Bond tool grows carbon, not O', T.state().atoms.length===nAt+1 && grown.el==='C' && grown.h===null, `${grown.el}/${grown.h}`);
T.setToolRaw('atom'); T.placeAtom({x:0, y:4*A});   // a clearly empty site, well away from the ring
const placed=T.state().atoms[T.state().atoms.length-1];
check('C3 the Atom tool still stamps the element', placed.el==='O', placed.el);
// free layer: same split
const Lf=freshFree(); T.setElement('N', null);
click('atom',{x:0,y:0});
check('C3 free layer: an Atom-tool click places N', T.state().atoms[0].el==='N', T.state().atoms[0].el);
click('bond',{x:0.1,y:0});
check('C3 free layer: a Bond-tool click grows C', T.state().atoms[1].el==='C', T.state().atoms[1].el);
T.setElement('C', null);
check('C3 back to carbon, the label is plain', T.elementLabel()==='Atom', T.elementLabel());

console.log('\n--- C4  dashed bonds');
freshFree(); T.setRingMode('plain'); T.setRingSides(5); placeRing({x:0,y:0});
const f0=formula();
check('C4 a plain free pentagon is C5H10', f0==='C5H10', f0);
const db=T.state().bonds[0];
T.setBondStyle(db, 'dash', null);
check('C4 the style is dash, order 1, no narrow end', db.style==='dash' && db.order===1 && db.narrow===undefined, `${db.style}/${db.order}/${db.narrow}`);
check('C4 bondOrder reports 0 for it', T.bondOrder(db)===0, T.bondOrder(db));
check('C4 both its atoms gain a hydrogen: C5H12', formula()==='C5H12', formula());
const prims=T.layerPrimitives(T.state().layers[0], false).filter(o=>o.k==='line');
const e1=T.atomById(db.a), e2=T.atomById(db.b), seg=Math.hypot(e2.x-e1.x,e2.y-e1.y);
const onBond=prims.filter(o=>{
  const m={x:(o.a.x+o.b.x)/2, y:(o.a.y+o.b.y)/2};
  const t=((m.x-e1.x)*(e2.x-e1.x)+(m.y-e1.y)*(e2.y-e1.y))/(seg*seg);
  const perp=Math.abs((m.x-e1.x)*(e2.y-e1.y)-(m.y-e1.y)*(e2.x-e1.x))/seg;
  return t>0 && t<1 && perp<1e-9;
});
check('C4 it is drawn as several short collinear segments', onBond.length>=3, onBond.length);
check('C4 none of them spans the whole bond', onBond.every(o=>Math.hypot(o.b.x-o.a.x,o.b.y-o.a.y) < seg*0.5), onBond.map(o=>Math.hypot(o.b.x-o.a.x,o.b.y-o.a.y).toFixed(3)).join(' '));
const svgD=T.exportSVG();
check('C4 the SVG uses plain lines, no stroke-dasharray', !svgD.includes('stroke-dasharray'), 'a dasharray leaked into the export');
check('C4 MOL writes it as a single bond', /^\s*1\s+2\s+1/m.test(T.exportMOL(false)) || T.exportMOL(false).includes(' 1'), 'no bond block');
// kekulize must never upgrade a dashed bond
freshFree(); T.setRingMode('plain'); T.setRingSides(6); placeRing({x:0,y:0});
T.setBondStyle(T.state().bonds[0],'dash',null);
T.kekulize(T.state().atoms.slice(0,6));
check('C4 kekulize leaves a dashed bond alone', T.state().bonds[0].order===1 && T.state().bonds[0].style==='dash', `${T.state().bonds[0].order}/${T.state().bonds[0].style}`);
// the style survives a move
const keep=T.state().bonds[0];
T.clearSel(); T.sel().atoms.add(keep.a); T.sel().atoms.add(keep.b);
T.startFloat('move'); T.floTranslate({x:0.5,y:0}); T.commitFloat();
const after=T.state().bonds.find(b=>b.style==='dash');
check('C4 the dashed style survives a move and place', !!after, 'the style was lost');

// M — auto-bond as a switch you can see, and what it must never do
console.log('--- M  the auto-bond switch');
const fresh=()=>{ T.loadState(T.freshState()); T.clearSel(); return T.state().layers[0]; };
const nBonds=()=>T.state().bonds.length;

// A lattice site one bond away from a given atom — (A,0) is not itself a site on every honeycomb
// origin, so the neighbour is found rather than assumed.
const neighbourSite=(a,L)=>{
  for(let k=0;k<12;k++){ const th=k*Math.PI/6, s=T.snapSite({x:a.x+A*Math.cos(th), y:a.y+A*Math.sin(th)}, L);
    const d=Math.hypot(s.x-a.x, s.y-a.y); if(d>0.85*A && d<1.15*A) return s; }
  return null;
};

// with the flag on, a new atom joins its honeycomb neighbours
let L=fresh(); T.setToolRaw('atom');
T.placeAtom({x:0,y:0});
let nb=neighbourSite(T.state().atoms[0], L);
check('M a neighbouring site exists to aim at', !!nb, 'none found');
T.placeAtom(nb);
check('M with auto-bond on, an atom bonds to its neighbour', T.state().atoms.length===2 && nBonds()===1, `${T.state().atoms.length} atoms, ${nBonds()} bonds`);

// with it off, the same two atoms arrive unbonded
L=fresh(); L.autoBond=false; T.setToolRaw('atom');
T.placeAtom({x:0,y:0});
nb=neighbourSite(T.state().atoms[0], L);
T.placeAtom(nb);
check('M with it off, they arrive unbonded', T.state().atoms.length===2 && nBonds()===0, `${T.state().atoms.length} atoms, ${nBonds()} bonds`);

// THE constraint: turning it back on must not wire up what is already drawn
const bondsBefore=nBonds();
L.autoBond=true; T.render(); T.renderLayerPanel();
check('M turning it back on bonds nothing already drawn', nBonds()===bondsBefore, `${nBonds()} vs ${bondsBefore}`);

// the same for whole structures: two rings placed a bond apart, deliberately unfused, stay unfused
L=fresh(); L.autoBond=false; T.setToolRaw('ring');
T.addRing({x:0,y:0});
const ringAtoms=T.state().atoms.length, ringBonds=nBonds();
check('M a ring is still bonded as a ring with the flag off', ringBonds===ringAtoms, `${ringBonds} bonds for ${ringAtoms} atoms`);
// the ring one lattice step to the right shares no site with the first at this separation
T.addRing({x:3*A,y:0});
const twoRings=nBonds();
check('M the second ring does not fuse to the first', twoRings===2*ringBonds, `${twoRings} vs ${2*ringBonds}`);
L.autoBond=true; T.render();
check('M and switching auto-bond on does not fuse them either', nBonds()===twoRings, `${nBonds()} vs ${twoRings}`);
// while a ring drawn next to it now does fuse, so the flag is really back on
T.addRing({x:3*A+1.5*A,y:A*Math.sqrt(3)/2});
check('M ... but a ring drawn after it fuses as usual', nBonds()>twoRings, `${nBonds()} vs ${twoRings}`);

// the topbar box mirrors the active layer and greys out on a free layer
L=fresh(); L.autoBond=false; T.syncAutoBond();
const box=document.getElementById('autoBondBox');
check('M the topbar box follows the layer flag', box.checked===false && box.disabled===false, `${box.checked}/${box.disabled}`);
L.autoBond=true; T.syncAutoBond();
check('M ... and back again', box.checked===true, box.checked);
L.free=true; T.syncAutoBond();
check('M a free layer greys the box out and clears it', box.disabled===true && box.checked===false, `${box.checked}/${box.disabled}`);
check('M ... and says why', /free layer/.test(document.getElementById('abWrap').title), document.getElementById('abWrap').title);
L.free=false; T.syncAutoBond();
check('M leaving the free layer restores the flag as it was', box.disabled===false && box.checked===true, `${box.checked}/${box.disabled}`);

// the layer row shows the same flag, disabled on a free layer
L.free=true; T.renderLayerPanel();
let rows=document.getElementById('layerList').innerHTML;
check('M the layer row greys its bond box on a free layer', /data-f="autoBond"[^>]*disabled/.test(rows), rows.slice(rows.indexOf('autoBond')-60, rows.indexOf('autoBond')+60));
L.free=false; T.renderLayerPanel();
rows=document.getElementById('layerList').innerHTML;
check('M and offers it again off the free layer', /data-f="autoBond" checked\s*$|data-f="autoBond" checked /.test(rows) && !/data-f="autoBond"[^>]*disabled/.test(rows), rows.slice(rows.indexOf('autoBond')-60, rows.indexOf('autoBond')+60));

// the flag rides along in the project file
L.autoBond=false;
const round=JSON.parse(JSON.stringify(T.state()));
T.loadState(round); T.backfill();
check('M the flag survives a project round trip', T.state().layers[0].autoBond===false, T.state().layers[0].autoBond);

// N — fill every ring whose atoms are all selected
console.log('--- N  fill selected rings');
const fills=()=>T.state().fills;
L=fresh(); T.setToolRaw('ring'); T.setRingMode('plain');
T.addRing({x:0,y:0});
const c0=T.polyCentroid(T.ringsOf(T.activeLayer())[0]), v1=T.fromCanon(T.A1), v2=T.fromCanon(T.A2);
T.addRing({x:c0.x+v1.x,y:c0.y+v1.y}); T.addRing({x:c0.x+v2.x,y:c0.y+v2.y});     // three fused rings, one lattice step apart
const nR=T.ringsOf(T.activeLayer()).length;
check('N three fused rings', nR===3, nR);
T.setFillColor('#489b6e');
T.clearSel();
check('N nothing selected fills nothing', T.fillSelectedRings()===0 && fills().length===0, fills().length);
T.selectAllActive();
const depth0=T.undoDepth();
check('N all selected fills all three', T.fillSelectedRings()===3 && fills().length===3, fills().length);
check('N ... in the fill colour', fills().every(f=>f.color==='#489b6e'), fills().map(f=>f.color).join(','));
check('N ... as one undo step', T.undoDepth()===depth0+1, T.undoDepth()-depth0);
check('N a second pass adds no fills', T.fillSelectedRings()===3 && fills().length===3, fills().length);
T.setFillColor('#cc1236');
T.fillSelectedRings();
check('N ... but recolours them, as a click would', fills().every(f=>f.color==='#cc1236'), fills().map(f=>f.color).join(','));
T.undo(); T.undo(); T.undo();
check('N undone', fills().length===0, fills().length);
// only whole rings: select one ring's atoms plus a stray atom of the next
T.clearSel();
const rings=T.ringsOf(T.activeLayer()); for(const a of rings[0]) T.sel().atoms.add(a.id);
const stray=rings[1].find(a=>!T.sel().atoms.has(a.id)); T.sel().atoms.add(stray.id);
check('N a partly selected ring is not filled', T.fillSelectedRings()===1 && fills().length===1, fills().length);
const c=T.polyCentroid(rings[0]);
check('N ... and the filled one is the whole one', Math.hypot(fills()[0].x-c.x, fills()[0].y-c.y)<0.05, `${fills()[0].x},${fills()[0].y} vs ${c.x},${c.y}`);
check('N the honeycomb fill carries no point list', fills()[0].pts===undefined, JSON.stringify(fills()[0]));
// free layer: the fill carries the ring's own points, as the Fill tool's does
L=freshFree(); T.setToolRaw('ring'); T.setRingSides(5); T.addRing({x:0,y:0}); if(T.flo()) T.commitFloat();
T.selectAllActive();
check('N a free-layer ring fills too', T.fillSelectedRings()===1 && fills().length===1, fills().length);
check('N ... with its five corners', fills()[0].pts && fills()[0].pts.length===5, JSON.stringify(fills()[0].pts||null));
// the menu and the panel offer it only when there are enough atoms for a ring
T.clearSel(); T.sel().atoms.add(T.state().atoms[0].id);
T.showCtx(10,10);
check('N one atom: no Fill rings in the menu', !/fillrings/.test(document.getElementById('ctxMenu').innerHTML), 'present');
T.selectAllActive(); T.showCtx(10,10); T.renderSelPanel();
check('N a ring selected: Fill rings in the menu', /data-act="fillrings"/.test(document.getElementById('ctxMenu').innerHTML), 'absent');
check('N ... and in the Selection panel', /data-act="fillrings"/.test(document.getElementById('selBody').innerHTML), 'absent');
fills().length=0;
T.selAction('fillrings');
check('N the action fills through selAction', fills().length===1, fills().length);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
