// Deliverable D — anchored fragments: rings carried by a vertex, the magnet, the pivot
const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const A=T.A;
const near=(a,b,e=1e-9)=>Math.abs(a-b)<e;
const d2=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y);
const freshFree=()=>{ T.loadState(T.freshState()); T.clearSel(); const L=T.state().layers[0]; L.free=true; L.autoBond=false; return L; };
const click=(tool,pw)=>{ T.setToolRaw(tool); const d=T.growStart(pw); T.growCommit(d,pw); };
const ringTool=pw=>{ T.setToolRaw('ring'); T.addRing(pw); };
const bondLens=()=>T.state().bonds.map(b=>{const p=T.atomById(b.a),q=T.atomById(b.b);return Math.hypot(p.x-q.x,p.y-q.y);});
const minSep=()=>{ const as=T.state().atoms; let m=1e9;
  for(let i=0;i<as.length;i++) for(let j=i+1;j<as.length;j++) m=Math.min(m,Math.hypot(as[i].x-as[j].x,as[i].y-as[j].y)); return m; };
const edgeMid=b=>{ const p=T.atomById(b.a),q=T.atomById(b.b); return {x:(p.x+q.x)/2, y:(p.y+q.y)/2}; };

console.log('--- D4a  a ring hung off an atom');
let L=freshFree(); T.setRingMode('plain'); T.setRingSides(6);
click('atom',{x:0,y:0});
const anchorAtom={...T.state().atoms[0]};
const idBefore=T.state().nextId;
ringTool({x:0,y:0});
check('D4a the ring is offered as a float, not placed', T.flo()!==null && T.state().atoms.length===1, `flo=${!!T.flo()} atoms=${T.state().atoms.length}`);
check('D4a it holds six atoms', T.flo().atoms.length===6, T.flo().atoms.length);
check('D4a exactly one of them sits on the anchor atom', T.flo().atoms.filter(a=>d2(a,anchorAtom)<1e-9).length===1, T.flo().atoms.filter(a=>d2(a,anchorAtom)<1e-9).length);
check('D4a the anchor index points at that atom', T.flo().anchor===0 && d2(T.flo().atoms[0],anchorAtom)<1e-9, `${T.flo().anchor}`);
check('D4a floPivot is the anchor', near(T.floPivot().x,anchorAtom.x,1e-9) && near(T.floPivot().y,anchorAtom.y,1e-9), JSON.stringify(T.floPivot()));
const beforeRot=T.flo().atoms.map(a=>({x:a.x,y:a.y}));
T.floRotate(15); T.floRotate(15);
check('D4a two 15° turns leave the anchor exactly where it was', d2(T.flo().atoms[0],anchorAtom)<1e-9, d2(T.flo().atoms[0],anchorAtom).toExponential(2));
check('D4a and move every other vertex', T.flo().atoms.slice(1).every((a,i)=>d2(a,beforeRot[i+1])>0.1), 'a vertex did not move');
T.commitFloat();
check('D4a placing merges the anchor: six atoms in all', T.state().atoms.length===6, T.state().atoms.length);
check('D4a the anchor atom kept its id and gained two bonds', T.atomById(anchorAtom.id)!=null && T.state().bonds.filter(b=>b.a===anchorAtom.id||b.b===anchorAtom.id).length===2,
  `${T.atomById(anchorAtom.id)!=null}/${T.state().bonds.filter(b=>b.a===anchorAtom.id||b.b===anchorAtom.id).length}`);
check('D4a every ring edge is 1.42 Å', bondLens().every(l=>near(l,A,1e-9)), `${Math.min(...bondLens()).toFixed(6)} … ${Math.max(...bondLens()).toFixed(6)}`);
check('D4a six bonds, a closed ring', T.state().bonds.length===6, T.state().bonds.length);

// Esc puts everything back, including the id counter
L=freshFree(); click('atom',{x:0,y:0});
const idBefore2=T.state().nextId;
ringTool({x:0,y:0}); T.cancelFloat();
check('D4a Esc leaves the drawing untouched', T.state().atoms.length===1 && T.state().bonds.length===0, `${T.state().atoms.length}/${T.state().bonds.length}`);
check('D4a and does not leak ids', T.state().nextId===idBefore2, `${T.state().nextId} vs ${idBefore2}`);

console.log('\n--- D4b  fusing onto a bond goes outward, every time');
let outward=0, tried=0, edges=[], seps=[];
for(let k=0;k<5;k++){
  L=freshFree(); T.setRingMode('plain'); T.setRingSides(5);
  ringTool({x:0,y:0}); T.commitFloat();                       // a pentagon, carried by a vertex
  const pent=T.state().atoms.slice(); const P=T.polyCentroid(pent);
  const b=T.state().bonds[k], mid=edgeMid(b);
  const n0=T.state().atoms.length;
  T.setRingSides(6); ringTool(mid);
  if(T.flo()){ T.cancelFloat(); continue; }                    // a bond click must not float
  tried++;
  const made=T.state().atoms.slice(n0);
  const c=T.polyCentroid(made);
  if(d2(c,P) > d2(mid,P)) outward++;
  edges.push(...bondLens()); seps.push(minSep());
}
check('D4b a click on a bond fuses immediately, never floats', tried===5, tried);
check('D4b all five fusions went outward', outward===5, outward);
check('D4b every edge stays 1.42 ± 0.01 Å', edges.every(l=>Math.abs(l-A)<0.01), `${Math.min(...edges).toFixed(4)} … ${Math.max(...edges).toFixed(4)}`);
check('D4b no two atoms closer than 1.3 Å', seps.every(s=>s>1.3), Math.min(...seps).toFixed(4));

// an isolated bond has no ring and no substituents: the cursor decides, and decides the same way twice
const isolated=(cy)=>{ L=freshFree(); click('atom',{x:0,y:0}); click('bond',{x:0.1,y:0});
  T.setRingSides(6); T.setRingMode('plain');
  const n0=T.state().atoms.length; ringTool({x:A/2, y:cy});
  if(T.flo()) { T.cancelFloat(); return null; }
  return T.polyCentroid(T.state().atoms.slice(n0)); };
const up=isolated(-0.05), down=isolated(0.05);
check('D4b an isolated bond takes the side the cursor is on', up && down && Math.sign(up.y)===-1 && Math.sign(down.y)===1, `${up&&up.y.toFixed(3)} / ${down&&down.y.toFixed(3)}`);
const again=isolated(-0.05);
check('D4b and gives the same answer every time', again && near(again.x,up.x,1e-12) && near(again.y,up.y,1e-12), `${JSON.stringify(up)} vs ${JSON.stringify(again)}`);

console.log('\n--- D4c  a ring on empty canvas floats, carried by its top vertex');
L=freshFree(); T.setRingSides(6); T.setRingMode('plain');
ringTool({x:2,y:3});
check('D4c it floats rather than landing', T.flo()!==null, 'it landed');
check('D4c vertex 0 is exactly under the cursor', near(T.flo().atoms[0].x,2,1e-9) && near(T.flo().atoms[0].y,3,1e-9), JSON.stringify(T.flo().atoms[0]));
check('D4c and is the pivot', T.flo().anchor===0, T.flo().anchor);
T.floRotate(60);
check('D4c a turn leaves it under the cursor', near(T.flo().atoms[0].x,2,1e-9) && near(T.flo().atoms[0].y,3,1e-9), JSON.stringify(T.flo().atoms[0]));
T.commitFloat();
check('D4c placing gives a closed six-ring', T.state().atoms.length===6 && T.state().bonds.length===6, `${T.state().atoms.length}/${T.state().bonds.length}`);

console.log('\n--- D2  the magnet');
L=freshFree(); click('atom',{x:5,y:0});
const lone={...T.state().atoms[0]};
T.setRingSides(6); T.setRingMode('plain'); ringTool({x:0,y:0});
const pv=T.floDragPV({x:4.8,y:0.1}, false, {x:0,y:0});
check('D2 a vertex within 0.35 Å is pulled exactly onto the atom', near(pv.x,5,1e-9) && near(pv.y,0,1e-9), JSON.stringify(pv));
T.floTranslate(pv); T.commitFloat();
check('D2 and the two merge on placing', T.state().atoms.length===6, T.state().atoms.length);
check('D2 the existing atom kept its id', T.atomById(lone.id)!=null, 'the original was replaced');
// out of range, nothing is pulled
L=freshFree(); click('atom',{x:5,y:0}); ringTool({x:0,y:0});
const pv2=T.floDragPV({x:4.2,y:0}, false, {x:0,y:0});
check('D2 a vertex 0.8 Å away is left alone', near(pv2.x,4.2,1e-9) && near(pv2.y,0,1e-9), JSON.stringify(pv2));
T.cancelFloat();

console.log('\n--- D4  benzene and Clar survive the float');
L=freshFree(); T.setRingSides(6); T.setRingMode('benzene'); ringTool({x:0,y:0}); T.commitFloat();
check('D4 a benzene ring gets its Kekulé pattern after placing', T.state().bonds.filter(b=>b.order===2).length===3, T.state().bonds.filter(b=>b.order===2).length);
L=freshFree(); T.setRingSides(5); T.setRingMode('clar'); ringTool({x:0,y:0}); T.commitFloat();
check('D4 a Clar ring gets its circle, sized to the ring', T.state().sextets.length===1 && T.state().sextets[0].n===5, JSON.stringify(T.state().sextets));
T.setRingMode('plain');


console.log('\n--- D5/F  templates: arm, press, drag, release');
const bearing=(o,p)=>((Math.atan2(p.y-o.y,p.x-o.x)*180/Math.PI%360)+360)%360;
const on15=d=>{ const m=((d%15)+15)%15; return Math.min(m,15-m)<1e-9; };

L=freshFree();
T.armTemplate('porphine');
check('F clicking a template arms it and draws nothing', T.armed()!==null && T.flo()===null && T.state().atoms.length===0,
  `armed=${!!T.armed()} flo=${!!T.flo()} atoms=${T.state().atoms.length}`);
T.startTemplatePlacement({x:3,y:1});
check('F pressing plants it, floating', T.flo()!==null && T.flo().atoms.length===24, `${!!T.flo()}/${T.flo()&&T.flo().atoms.length}`);
check('F on blank canvas the press point is its centre', T.flo().anchorPt && near(T.flo().anchorPt.x,3,1e-9) && near(T.flo().anchorPt.y,1,1e-9), JSON.stringify(T.flo().anchorPt));
check('F the centre really is the centroid of the molecule', near(T.polyCentroid(T.flo().atoms).x,3,1e-6) && near(T.polyCentroid(T.flo().atoms).y,1,1e-6), JSON.stringify(T.polyCentroid(T.flo().atoms)));
check('F and it aims by an outer atom, since the centre cannot aim at itself', T.flo().refIdx!=null, String(T.flo().refIdx));
// aiming: the reference direction follows the cursor, snapped, and the anchor never moves
const anchor0={...T.flo().anchorPt};
T.aimFloat({x:3,y:6}, false);
let Lay=T.state().layers[0];
check('F dragging turns it so its reference points at the cursor', near(bearing(T.floAnchorWorld(Lay), T.floRefWorld(Lay)), 90, 1e-6),
  bearing(T.floAnchorWorld(Lay), T.floRefWorld(Lay)).toFixed(4));
check('F the anchor stays exactly where it was pressed', near(T.flo().anchorPt.x,anchor0.x,1e-12) && near(T.flo().anchorPt.y,anchor0.y,1e-12), JSON.stringify(T.flo().anchorPt));
check('F the centroid has not drifted either', near(T.polyCentroid(T.flo().atoms).x,3,1e-6) && near(T.polyCentroid(T.flo().atoms).y,1,1e-6), JSON.stringify(T.polyCentroid(T.flo().atoms)));
T.aimFloat({x:3+Math.cos(0.4), y:1+Math.sin(0.4)}, false);
check('F the angle snaps to 15° steps', on15(bearing(T.floAnchorWorld(Lay), T.floRefWorld(Lay))), bearing(T.floAnchorWorld(Lay), T.floRefWorld(Lay)).toFixed(6));
T.aimFloat({x:3+Math.cos(0.4), y:1+Math.sin(0.4)}, true);
check('F Shift frees the angle', !on15(bearing(T.floAnchorWorld(Lay), T.floRefWorld(Lay))), bearing(T.floAnchorWorld(Lay), T.floRefWorld(Lay)).toFixed(6));
T.commitFloat();
check('F releasing places it in one undo step', T.state().atoms.length===24 && T.state().bonds.length===28, `${T.state().atoms.length}/${T.state().bonds.length}`);
T.undo();
check('F and one undo removes the whole molecule', T.state().atoms.length===0, T.state().atoms.length);

// pressed on an atom, it joins there by its outermost atom
L=freshFree(); click('atom',{x:0,y:0});
const target={...T.state().atoms[0]};
T.armTemplate('porphine'); T.startTemplatePlacement({x:0.05,y:0.05});
check('F pressing on an atom anchors on an atom, not a point', T.flo().anchorPt===null && T.flo().anchor!=null, `${T.flo().anchorPt}/${T.flo().anchor}`);
check('F its attachment atom sits exactly on the atom pressed', near(T.flo().atoms[T.flo().anchor].x,target.x,1e-9) && near(T.flo().atoms[T.flo().anchor].y,target.y,1e-9), JSON.stringify(T.flo().atoms[T.flo().anchor]));
check('F the attachment atom is the outermost one', T.flo().anchor===T.outermostAtom(T.macrocycleFragment(T.TEMPLATES.porphine).atoms), `${T.flo().anchor}`);
T.aimFloat({x:-5,y:0}, false);
check('F turning it leaves that atom fixed', near(T.flo().atoms[T.flo().anchor].x,target.x,1e-9) && near(T.flo().atoms[T.flo().anchor].y,target.y,1e-9), JSON.stringify(T.flo().atoms[T.flo().anchor]));
T.commitFloat();
check('F placing merges it: 24 atoms, not 25', T.state().atoms.length===24, T.state().atoms.length);

console.log('\n--- D5  a template on a honeycomb layer ticks free, and says so');
T.loadState(T.freshState()); T.clearSel(); T.setRingMode('plain');
T.setToolRaw('ring'); T.addRing({x:0,y:0}); if(T.flo()) T.commitFloat();
const hcL=T.state().layers[0], idBefore3=T.state().nextId;
check('D5 the layer starts on the honeycomb', !T.isFree(hcL) && T.state().atoms.length===6, `${T.isFree(hcL)}/${T.state().atoms.length}`);
T.armTemplate('pc'); T.startTemplatePlacement({x:9,y:9});
check('D5 the layer is switched to free', T.isFree(T.state().layers[0]), 'still a honeycomb layer');
check('D5 the warning names the atoms already there', T.freeWarn() && T.freeWarn().atomsAffected===6, JSON.stringify(T.freeWarn()));
T.cancelFloat();
check('D5 cancelling reverts the free flag with the molecule', !T.isFree(T.state().layers[0]), 'the layer stayed free');
check('D5 and the drawing is untouched', T.state().atoms.length===6 && T.state().nextId===idBefore3, `${T.state().atoms.length}/${T.state().nextId} vs ${idBefore3}`);
T.renderTemplatePanel();
check('D5 the warning clears itself once the layer is not free', T.freeWarn()===null, JSON.stringify(T.freeWarn()));
T.disarm();

console.log('\n--- F  rings turn with the mouse');
L=freshFree(); T.setRingMode('plain'); T.setRingSides(6);
click('atom',{x:0,y:0});
const A0={...T.state().atoms[0]};
const defaultDir=T.awayDir(T.state().atoms[0]);
ringTool({x:0,y:0});
check('F a ring pressed on an atom floats, anchored on it', T.flo()!==null && T.flo().anchor===0, `${!!T.flo()}/${T.flo()&&T.flo().anchor}`);
Lay=T.state().layers[0];
check('F with no drag it keeps the old default orientation (awayDir)',
  near(bearing(A0, T.floRefWorld(Lay)), bearing({x:0,y:0}, defaultDir), 1e-6),
  `${bearing(A0,T.floRefWorld(Lay)).toFixed(4)} vs ${bearing({x:0,y:0},defaultDir).toFixed(4)}`);
T.aimFloat({x:-5,y:0}, false);
check('F dragging 180° puts the ring on the far side', near(bearing(A0, T.floRefWorld(Lay)), 180, 1e-6), bearing(A0,T.floRefWorld(Lay)).toFixed(4));
check('F and the anchor atom has not moved at all', near(T.flo().atoms[0].x,A0.x,1e-12) && near(T.flo().atoms[0].y,A0.y,1e-12), JSON.stringify(T.flo().atoms[0]));
const depth=T.undoDepth();
T.commitFloat();
check('F release places it: 6 atoms, the anchor merged', T.state().atoms.length===6 && T.state().bonds.length===6, `${T.state().atoms.length}/${T.state().bonds.length}`);
check('F one undo step was used', T.undoDepth()===depth+1, `${T.undoDepth()} vs ${depth+1}`);
T.undo();
check('F undo leaves just the atom you started from', T.state().atoms.length===1, T.state().atoms.length);
// a bond press still fuses immediately, with no float to turn
L=freshFree(); T.setRingSides(5); ringTool({x:0,y:0}); T.commitFloat();
const nb0=T.state().atoms.length;
T.setRingSides(6); const floated=T.addRing(edgeMid(T.state().bonds[0]));
check('F pressing a bond fuses at once and offers nothing to turn', !floated && T.flo()===null && T.state().atoms.length===nb0+4, `${floated}/${!!T.flo()}/${T.state().atoms.length}`);

console.log('\n--- F  the reset key');
T.setRingSides(8); T.setRingMode('clar'); T.setBondMode('double'); T.setGraphicKind('retro'); T.setElement('Br',null);
T.setCurBond({a:1,b:2,order:1}); T.armTemplate('pc');
check('F everything is off its default first', T.ringSides()===8 && T.ringMode()==='clar' && T.bondMode()==='double' && T.graphicKind()==='retro' && T.element()==='Br' && !!T.armed(),
  `${T.ringSides()}/${T.ringMode()}/${T.bondMode()}/${T.graphicKind()}/${T.element()}`);
T.resetTools();
check('F 0 puts the n-gon size back to 6', T.ringSides()===6, T.ringSides());
check('F and the ring mode to plain', T.ringMode()==='plain', T.ringMode());
check('F and the bond mode to single', T.bondMode()==='single', T.bondMode());
check('F and the Atom element to carbon', T.element()==='C' && T.lastH()===null, `${T.element()}/${T.lastH()}`);
check('F and the arrow kind to a straight arrow', T.graphicKind()==='arrow', T.graphicKind());
check('F it also drops the current bond and any armed template', T.curBond()===null && T.armed()===null, `${T.curBond()}/${T.armed()}`);
check('F it resets tools whatever tool is active', (T.setToolRaw('select'), T.setRingSides(3), T.resetTools(), T.ringSides()===6), T.ringSides());

console.log('\n--- H7  the angle readout');
// the convention: 0 along +x, counter-clockwise, y up (the internal frame has y down)
check('H7 bearing east is 0', T.bearing({x:0,y:0},{x:1,y:0})===0, T.bearing({x:0,y:0},{x:1,y:0}));
check('H7 bearing up the screen is 90', near(T.bearing({x:0,y:0},{x:0,y:-1}),90,1e-9), T.bearing({x:0,y:0},{x:0,y:-1}));
check('H7 bearing west is 180', near(T.bearing({x:0,y:0},{x:-1,y:0}),180,1e-9), T.bearing({x:0,y:0},{x:-1,y:0}));
check('H7 bearing down the screen is 270', near(T.bearing({x:0,y:0},{x:0,y:1}),270,1e-9), T.bearing({x:0,y:0},{x:0,y:1}));
check('H7 wrap180(350) is -10', near(T.wrap180(350),-10,1e-9), T.wrap180(350));
check('H7 wrap180(-350) is 10', near(T.wrap180(-350),10,1e-9), T.wrap180(-350));
check('H7 wrap180(180) is -180: a half-turn is reported the short way round', near(T.wrap180(180),-180,1e-9), T.wrap180(180));
check('H7 angleText rounds when the angle is snapped', T.angleText(105,45,false)==='105\u00b0 (+45\u00b0)', T.angleText(105,45,false));
check('H7 and shows a decimal when Shift frees it', T.angleText(78.69,-11.31,true)==='78.7\u00b0 (-11.3\u00b0)', T.angleText(78.69,-11.31,true));

// a ring anchored on a lone atom: the readout follows aimFloat exactly
L=freshFree(); T.setRingMode('plain'); T.setRingSides(6);
click('atom',{x:0,y:0});
ringTool({x:0,y:0});
const a0=T.floAngle();
check('H7 floAngle reads the fragment before any drag', a0!==null && isFinite(a0), String(a0));
T.aimFloat({x:0,y:-5}, false);
check('H7 after aiming straight up the reference bears 90', near(T.floAngle(),90,1e-6), T.floAngle());
T.setDrag({type:'place', start:{x:0,y:0}, moved:true, angle0:a0, free:false});
let ti=T.turnInfo();
check('H7 turnInfo reports the pivot and the reference of a place drag', !!ti && near(ti.pivot.x,0,1e-9) && near(ti.pivot.y,0,1e-9), JSON.stringify(ti&&ti.pivot));
check('H7 the readout is drawn into the hover layer', /<text[^>]*>[^<]*\u00b0/.test(T.turnSVG()), T.turnSVG().slice(0,80));
check('H7 and it never reaches an export', !/\u00b0/.test(T.exportSVG()), 'a degree sign leaked into the SVG');
T.updateTurnStatus();
check('H7 the status line carries the angle while turning', /^Turning .*\u00b0/.test(document.getElementById('msg').textContent), document.getElementById('msg').textContent);
// nothing is shown before the drag has moved
T.setDrag({type:'place', start:{x:0,y:0}, moved:false, angle0:a0});
check('H7 nothing is shown until the pointer has moved', T.turnInfo()===null && T.turnSVG()==='', T.turnSVG());
T.setDrag(null); T.cancelFloat();

// Shift frees the angle, and the readout says so with a decimal
L=freshFree(); click('atom',{x:0,y:0}); ringTool({x:0,y:0});
const a1=T.floAngle();
T.aimFloat({x:1,y:-5}, true);
const free=T.floAngle();
check('H7 a free angle is not a multiple of 15', Math.min(((free%15)+15)%15, 15-((free%15)+15)%15)>1e-6, free.toFixed(4));
check('H7 and it is the direction of the cursor', near(free, T.bearing({x:0,y:0},{x:1,y:-5}), 1e-6), `${free.toFixed(4)} vs ${T.bearing({x:0,y:0},{x:1,y:-5}).toFixed(4)}`);
T.setDrag({type:'place', start:{x:0,y:0}, moved:true, angle0:a1, free:true});
check('H7 the free readout carries a decimal point', /\d\.\d\u00b0/.test(T.turnSVG()), T.turnSVG().slice(-90));
check('H7 the delta is measured from the press, not accumulated', near(T.wrap180(free-a1), T.wrap180(T.floAngle()-a1), 1e-12), `${T.wrap180(free-a1)}`);
T.setDrag(null); T.cancelFloat();

// the lone-atom swing reports the angle about its neighbour
L=freshFree(); click('atom',{x:0,y:0}); click('bond',{x:0.1,y:0});
const swung=T.state().atoms[1];
T.clearSel(); T.sel().atoms.add(swung.id); T.startFloat('move');
const s0=T.swingAngle();
check('H7 swingAngle reads from the neighbour to the atom', near(s0,0,1e-9), s0);
T.setDrag({type:'float', start:{x:A,y:0}, moved:true, angle0:s0, free:false});
const pvSwing=T.floDragPV({x:A*Math.cos(Math.PI/3), y:-A*Math.sin(Math.PI/3)}, false, {x:A,y:0});
T.state().atoms;   // the pending move is not baked in; turnInfo has to add it itself
T.flo().pv=pvSwing;
ti=T.turnInfo();
check('H7 a swing turns about the neighbour', !!ti && near(ti.pivot.x,0,1e-9) && near(ti.pivot.y,0,1e-9), JSON.stringify(ti&&ti.pivot));
check('H7 and its reference is the atom with the pending move applied', near(T.bearing(ti.pivot,ti.ref), 60, 1e-6), T.bearing(ti.pivot,ti.ref).toFixed(4));
T.setDrag(null); T.cancelFloat();

// the Atom/Bond drag-aim reports against the direction a plain click would have taken
L=freshFree(); click('atom',{x:0,y:0}); click('bond',{x:0.1,y:0});
T.setToolRaw('bond');
const gd=T.growStart({x:A,y:0});
check('H7 growStart records the click-default direction', gd.angle0!=null && isFinite(gd.angle0), String(gd.angle0));
gd.moved=true; T.setDrag(gd); T.setMouseWorld({x:A, y:-5});
ti=T.turnInfo();
check('H7 an aiming drag turns about the atom it grows from', !!ti && near(ti.pivot.x,A,1e-9) && near(ti.pivot.y,0,1e-9), JSON.stringify(ti&&ti.pivot));
check('H7 and its reference is the snapped target', near(T.bearing(ti.pivot,ti.ref),90,1e-6), T.bearing(ti.pivot,ti.ref).toFixed(4));
T.updateTurnStatus();
check('H7 the status line says Aiming for a grow drag', /^Aiming /.test(document.getElementById('msg').textContent), document.getElementById('msg').textContent);
T.setMouseWorld({x:0.02, y:0.01});
check('H7 no angle is offered when the drag would bond to another atom', T.turnInfo()===null, JSON.stringify(T.turnInfo()));
T.setDrag(null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
