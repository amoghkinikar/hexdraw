// Ring size set outright — the setter behind the 3-8 keys and the reset key
const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const freshFree=()=>{ T.loadState(T.freshState()); T.clearSel(); const L=T.state().layers[0]; L.free=true; L.autoBond=false; return L; };

console.log('--- G1  setRingSidesTo');
freshFree();
T.setRingSides(6);
check('G1 the layer is free, so a ring size means something', T.activeFree()===true, T.activeFree());
check('G1 5 is accepted', T.setRingSidesTo(5)===true, T.setRingSidesTo);
check('G1 and takes effect', T.ringSides()===5, T.ringSides());
check('G1 3 and 8, the ends of the range, are accepted', T.setRingSidesTo(3)&&T.ringSides()===3&&T.setRingSidesTo(8)&&T.ringSides()===8, T.ringSides());

console.log('--- G2  everything outside the range is refused, and changes nothing');
T.setRingSidesTo(6);
for(const bad of [2, 9, 0, -1, 1.5, NaN, Infinity, undefined, null, 'x']){
  const r=T.setRingSidesTo(+bad);
  check(`G2 ${String(bad)} is refused`, r===false, r);
}
check('G2 and the size is untouched after all of them', T.ringSides()===6, T.ringSides());
check('G2 NaN in particular did not land in ringSides', !Number.isNaN(T.ringSides()), T.ringSides());

console.log('--- G3  it cooperates with the other two ways in');
T.setRingSidesTo(8); T.cycleRingSides();
check('G3 N still wraps 8 back to 3', T.ringSides()===3, T.ringSides());
T.setRingSidesTo(5); T.resetTools();
check('G3 the reset key still returns to 6', T.ringSides()===6, T.ringSides());

console.log('\n--- H1  0 resets the active tool, Shift+0 (resetTools) resets all of them');
const msg=()=>document.getElementById('msg').textContent;
// Bond: its own mode and the bond it remembers, and nothing else
freshFree();
T.setRingSides(5); T.setRingMode('clar'); T.setBondMode('double'); T.setElement('O',null); T.setGraphicKind('retro');
T.setCurBond({a:1,b:2,order:1});
T.setToolRaw('bond'); T.resetTool();
check('H1 bond: the mode goes back to single', T.bondMode()==='single', T.bondMode());
check('H1 bond: the current bond is forgotten', T.curBond()===null, String(T.curBond()));
check('H1 bond: the ring size is left alone', T.ringSides()===5, T.ringSides());
check('H1 bond: the ring mode is left alone', T.ringMode()==='clar', T.ringMode());
check('H1 bond: the Atom element is left alone', T.element()==='O', T.element());
check('H1 bond: the arrow kind is left alone', T.graphicKind()==='retro', T.graphicKind());
// Ring: size and mode, and nothing else
T.setBondMode('wedge');
T.setToolRaw('ring'); T.resetTool();
check('H1 ring: the size goes back to 6', T.ringSides()===6, T.ringSides());
check('H1 ring: the mode goes back to plain', T.ringMode()==='plain', T.ringMode());
check('H1 ring: the bond mode is left alone', T.bondMode()==='wedge', T.bondMode());
check('H1 ring: the Atom element is left alone', T.element()==='O', T.element());
// Atom, Arrow
T.setToolRaw('atom'); T.resetTool();
check('H1 atom: the element goes back to carbon', T.element()==='C' && T.lastH()===null, `${T.element()}/${T.lastH()}`);
check('H1 atom: the bond mode is still left alone', T.bondMode()==='wedge', T.bondMode());
T.setToolRaw('arrow'); T.resetTool();
check('H1 arrow: the kind goes back to a straight arrow', T.graphicKind()==='arrow', T.graphicKind());
// a tool with no modes says so and changes nothing
T.setRingSides(4); T.setBondMode('hash');
T.setToolRaw('select'); T.resetTool();
check('H1 select: nothing is reset', T.ringSides()===4 && T.bondMode()==='hash', `${T.ringSides()}/${T.bondMode()}`);
check('H1 select: and the status bar says so', /nothing to reset/.test(msg()), msg());
T.setToolRaw('erase'); T.resetTool();
check('H1 erase: same again', /nothing to reset/.test(msg()) && T.ringSides()===4, `${msg()} / ${T.ringSides()}`);
// an armed template is not a Ring-tool mode
T.armTemplate('pc');
T.setToolRaw('ring'); T.resetTool();
check('H1 a plain reset leaves an armed template armed', T.armed()!==null, String(T.armed()));
T.resetTools();
check('H1 Shift+0 (resetTools) disarms it and resets everything', T.armed()===null && T.ringSides()===6 && T.bondMode()==='single' && T.element()==='C' && T.graphicKind()==='arrow',
  `${T.armed()}/${T.ringSides()}/${T.bondMode()}/${T.element()}/${T.graphicKind()}`);
// neither reset touches the drawing
freshFree(); T.setRingSides(6); T.setToolRaw('ring'); T.addRing({x:0,y:0}); T.commitFloat();
const snap=JSON.stringify(T.state());
T.setToolRaw('ring'); T.resetTool(); T.resetTools();
check('H1 neither reset touches the drawing', JSON.stringify(T.state())===snap, 'the drawing changed');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
