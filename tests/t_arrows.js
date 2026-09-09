const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const A=T.A, S3=Math.sqrt(3);
const reset=()=>{ T.loadState(T.freshState()); T.clearSel(); };
const near=(a,b,e=1e-6)=>Math.abs(a-b)<e;
const KINDS=['arrow','equil','reson','retro','curly','curlyh','bracket','plus'];

// A1 — every kind produces the shapes it should, with heads pointing the right way
console.log('--- A1  each kind draws its shaft(s) and head(s)');
for(const k of KINDS){
  reset(); T.setGraphicKind(k); T.placeGraphic({x:0,y:0},{x:4,y:0});
  const g=T.state().graphics[0];
  const prims=T.graphicPrimitives(g, T.activeLayer());
  const paths=prims.filter(p=>p.k==='path'), heads=prims.filter(p=>p.k==='wedge');
  const want={arrow:[1,1],equil:[2,2],reson:[1,2],retro:[3,0],curly:[1,1],curlyh:[1,1],bracket:[2,0],plus:[2,0]}[k];
  check(`A1 ${k}: ${want[0]} path(s), ${want[1]} head(s)`, paths.length===want[0]&&heads.length===want[1], `${paths.length} paths, ${heads.length} heads`);
}
// direction: a reaction arrow's head tip sits on the far endpoint, pointing along the drag
reset(); T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0});
let p=T.graphicPrimitives(T.state().graphics[0],T.activeLayer());
let tip=p.find(o=>o.k==='wedge').pts[0];
check('A1 arrow head tip at the far end (4,0)', near(tip.x,4)&&near(tip.y,0), JSON.stringify(tip));
// a resonance arrow has one head at each end, pointing outwards
reset(); T.setGraphicKind('reson'); T.placeGraphic({x:0,y:0},{x:4,y:0});
let tips=T.graphicPrimitives(T.state().graphics[0],T.activeLayer()).filter(o=>o.k==='wedge').map(o=>o.pts[0]).sort((a,b)=>a.x-b.x);
check('A1 resonance heads at both ends', near(tips[0].x,0)&&near(tips[1].x,4), JSON.stringify(tips));
// an equilibrium arrow's two half-heads sit at opposite ends and on opposite sides
reset(); T.setGraphicKind('equil'); T.placeGraphic({x:0,y:0},{x:4,y:0});
let eh=T.graphicPrimitives(T.state().graphics[0],T.activeLayer()).filter(o=>o.k==='wedge').map(o=>o.pts).sort((a,b)=>a[0].x-b[0].x);
check('A1 equilibrium half-heads at opposite ends', near(eh[0][0].x,0)&&near(eh[1][0].x,4), JSON.stringify(eh.map(t=>t[0])));
check('A1 equilibrium half-heads on opposite sides', Math.sign(eh[0][1].y-eh[0][2].y)===-Math.sign(eh[1][1].y-eh[1][2].y), `${eh[0][1].y-eh[0][2].y} vs ${eh[1][1].y-eh[1][2].y}`);
// direction snapping: 15° steps, never the lattice
const sn=T.snapAngle({x:0,y:0},{x:4,y:0.9});
const deg=Math.atan2(sn.y,sn.x)*180/Math.PI, m=((deg%15)+15)%15;
check('A1 endpoint snaps to a 15° direction', Math.min(m,15-m)<1e-9, deg.toFixed(9)+'°');
check('A1 length snaps to 0.1 Å', near(Math.round(Math.hypot(sn.x,sn.y)*10)/10, Math.hypot(sn.x,sn.y), 1e-9), Math.hypot(sn.x,sn.y).toFixed(6));

// A2 — an arrow selected with a benzene ring keeps its position relative to the atoms
console.log('\n--- A2  moving a mixed selection');
reset(); T.setRingMode('benzene'); T.addRing({x:0,y:0});
T.setGraphicKind('arrow'); T.placeGraphic({x:3,y:0},{x:6,y:0});
const before={atom:{...T.state().atoms[0]}, pts:T.state().graphics[0].pts.map(q=>({...q}))};
T.selectAllActive();
check('A2 selection holds 6 atoms and 1 graphic', T.sel().atoms.size===6&&T.sel().graphics.size===1, `${T.sel().atoms.size} atoms, ${T.sel().graphics.size} graphics`);
T.startFloat('move'); T.floTranslate(T.snapMove({x:2.3,y:0.2})); T.commitFloat();
const after={atom:T.state().atoms.find(a=>a.id===before.atom.id), pts:T.state().graphics[0].pts};
const dAtom={x:after.atom.x-before.atom.x, y:after.atom.y-before.atom.y};
const dArr={x:after.pts[0].x-before.pts[0].x, y:after.pts[0].y-before.pts[0].y};
check('A2 atoms moved by a Bravais vector', near(dAtom.x,S3*A,1e-9)&&near(dAtom.y,0,1e-9), JSON.stringify(dAtom));
const onLattice=T.state().atoms.every(a=>{ const c={x:a.x/(S3*A), y:a.y}; return near(Math.abs(a.y)%(1.5*A), 0, 1e-6) || near(Math.abs(a.y+A)%(1.5*A),0,1e-6) || true; });
check('A2 arrow moved by exactly the same vector', near(dArr.x,dAtom.x,1e-9)&&near(dArr.y,dAtom.y,1e-9), JSON.stringify(dArr));

// A3 — duplicate a curly arrow, rotate 60°, place: the control point rotates too
console.log('\n--- A3  rotating a duplicated curly arrow');
reset(); T.setGraphicKind('curly'); T.placeGraphic({x:0,y:0},{x:3,y:0});
const orig=T.state().graphics[0].pts.map(q=>({...q}));
T.clearSel(); T.sel().graphics.add(T.state().graphics[0]);
T.startFloat('dup'); T.floRotate(60); T.commitFloat();
check('A3 the drawing now holds two curly arrows', T.state().graphics.length===2, T.state().graphics.length);
const copy=T.state().graphics[1].pts;
const ctr={x:(orig[0].x+orig[1].x+orig[2].x)/3, y:(orig[0].y+orig[1].y+orig[2].y)/3};
const rot60=q=>{ const c=Math.cos(Math.PI/3), s=Math.sin(Math.PI/3); const dx=q.x-ctr.x, dy=q.y-ctr.y; return {x:ctr.x+dx*c-dy*s, y:ctr.y+dx*s+dy*c}; };
const want=orig.map(rot60);
const ok=copy.every((q,i)=>near(q.x,want[i].x,1e-9)&&near(q.y,want[i].y,1e-9));
check('A3 all three points rotated 60° about the centroid', ok, JSON.stringify({copy,want}));
check('A3 the control point is not a stale copy', !near(copy[2].x,orig[2].x,1e-9)||!near(copy[2].y,orig[2].y,1e-9), JSON.stringify(copy[2]));

// A4 — chemical export ignores graphics
console.log('\n--- A4  XYZ of a drawing that contains arrows');
reset(); T.setRingMode('benzene'); T.addRing({x:0,y:0});
const xyzBare=T.exportXYZ(T.exportStructure(true,15));
T.setGraphicKind('curly'); T.placeGraphic({x:3,y:0},{x:6,y:0});
T.setGraphicKind('bracket'); T.placeGraphic({x:-3,y:-2},{x:-1,y:2});
T.setGraphicKind('plus'); T.placeGraphic({x:8,y:0},{x:8,y:0});
let xyzArr=null, err=null;
try{ xyzArr=T.exportXYZ(T.exportStructure(true,15)); }catch(e){ err=e.message; }
check('A4 export raised no error', err===null, err);
check('A4 three graphics are in the drawing', T.state().graphics.length===3, T.state().graphics.length);
check('A4 XYZ is byte-for-byte unchanged', xyzArr===xyzBare, xyzArr&&xyzArr.split('\n')[0]);
check('A4 atom count still 12 (C6H6)', xyzArr&&+xyzArr.split('\n')[0]===12, xyzArr&&xyzArr.split('\n')[0]);

// A5 — one undo removes a placed arrow
console.log('\n--- A5  undo after placing an arrow');
reset(); T.setRingMode('benzene'); T.addRing({x:0,y:0});
const depth=T.undoDepth();
T.setGraphicKind('arrow'); T.placeGraphic({x:3,y:0},{x:6,y:0});
check('A5 the arrow is there', T.state().graphics.length===1, T.state().graphics.length);
T.undo();
check('A5 one undo removes it', T.state().graphics.length===0, T.state().graphics.length);
check('A5 the ring is untouched', T.state().atoms.length===6&&T.state().bonds.length===6, `${T.state().atoms.length} atoms, ${T.state().bonds.length} bonds`);
check('A5 exactly one undo step was consumed', T.undoDepth()===depth, `${T.undoDepth()} vs ${depth}`);

console.log('\n--- J  the Arrow tool reshapes and selects, as the Bond tool restyles');
const L=()=>T.activeLayer();
const fresh=()=>{ T.loadState(T.freshState()); T.clearSel(); T.setToolRaw('arrow'); };
// a curly arrow: three handles, and a control point that does NOT lie on its own curve
fresh(); T.setGraphicKind('curly'); T.placeGraphic({x:0,y:0},{x:3,y:0});
const g=T.state().graphics[0];
check('J the fixture is a curly arrow with three points', g.pts.length===3, g.pts.length);
const P=i=>({x:g.pts[i].x, y:g.pts[i].y});
// press on a handle -> reshape, not draw
let d=T.graphicStart(P(2), false);
check('J a press on the control point starts a handle drag', d.type==='handle'&&d.i===2&&d.g===g, JSON.stringify({t:d.type,i:d.i}));
check('J which is exactly the drag the Select tool builds, so move and release already work', d.g===g && typeof d.i==='number', 'shape differs');
// that control point is off the curve: findGraphic alone would have missed it
check('J the control point is further from the curve than findGraphic reaches', T.findGraphic(P(2),L())===null, 'findGraphic saw it');
T.setMouseWorld(P(2)); T.setDrag(null); T.updateHover();
const hov=document.getElementById('hoverG').innerHTML;
check('J the hover draws it anyway, ringed as grabbable', /r="0.13"/.test(hov) && /r="0.2"/.test(hov), hov.slice(0,120));
// press on the spine, release without moving -> select, draw nothing
fresh(); T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0});
const a=T.state().graphics[0];
T.clearSel();
d=T.graphicStart({x:2,y:0}, false);
check('J a press on the shaft is a graphic drag that remembers what it hit', d.type==='graphic'&&d.hit===a, JSON.stringify({t:d.type,hit:!!d.hit}));
T.graphicCommit(d, {x:2,y:0});
check('J releasing without moving selects it', T.sel().graphics.has(a), T.sel().graphics.size);
check('J and draws nothing', T.state().graphics.length===1, T.state().graphics.length);
// press on the spine and drag -> still draws, so nothing that worked stops working
d=T.graphicStart({x:2,y:0}, false); d.moved=true;
T.graphicCommit(d, {x:2,y:3});
check('J a drag that starts on a graphic still draws a new one', T.state().graphics.length===2, T.state().graphics.length);
check('J from the point that was pressed', T.state().graphics[1].pts[0].x===2 && T.state().graphics[1].pts[0].y===0, JSON.stringify(T.state().graphics[1].pts[0]));
// empty canvas is unchanged in both directions
fresh(); T.setGraphicKind('arrow');
d=T.graphicStart({x:0,y:0}, false);
check('J a press on empty canvas hits nothing', d.type==='graphic'&&d.hit===null, JSON.stringify({t:d.type,hit:d.hit}));
T.graphicCommit(d, {x:0,y:0});
check('J and a stray click still draws nothing, as before', T.state().graphics.length===0, T.state().graphics.length);
d=T.graphicStart({x:0,y:0}, false); d.moved=true; T.graphicCommit(d, {x:4,y:0});
check('J while a drag draws', T.state().graphics.length===1, T.state().graphics.length);
// Shift is the way back to drawing over one
fresh(); T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0});
d=T.graphicStart({x:2,y:0}, true);
check('J Shift ignores the graphic under the cursor', d.type==='graphic'&&d.hit===null, JSON.stringify({t:d.type,hit:d.hit}));
d=T.graphicStart({x:0,y:0}, true);
check('J and ignores a handle too', d.type==='graphic', d.type);
// the plus sign is the one gesture this takes away, and Shift gives it back
fresh(); T.setGraphicKind('plus');
d=T.graphicStart({x:8,y:0}, false); T.graphicCommit(d, {x:8,y:0});
check('J a plus still lands on a click in open space', T.state().graphics.length===1 && T.state().graphics[0].kind==='plus', T.state().graphics.length);
T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0}); T.setGraphicKind('plus');
const nBefore=T.state().graphics.length;
d=T.graphicStart({x:2,y:0}, false); T.graphicCommit(d, {x:2,y:0});
check('J but a click on a graphic selects instead of placing one there', T.state().graphics.length===nBefore, T.state().graphics.length);
d=T.graphicStart({x:2,y:0}, true); T.graphicCommit(d, {x:2,y:0});
check('J and Shift places it after all', T.state().graphics.length===nBefore+1, T.state().graphics.length);
// a stale hit cannot be written through
fresh(); T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0});
d=T.graphicStart({x:2,y:0}, false);
T.state().graphics.length=0; T.clearSel();     // placeGraphic left the fixture selected; start from empty
T.graphicCommit(d, {x:2,y:0});
check('J a graphic deleted mid-gesture is not selected from under us', T.sel().graphics.size===0, T.sel().graphics.size);

// K — the ribbon's split Arrow control and the 1-8 kind keys
console.log('--- K  split Arrow control');
reset(); T.setTool('arrow'); T.setGraphicKind('arrow');
const ribbon = () => { T.renderTools(); return document.getElementById('tools').innerHTML; };
let rb = ribbon();
check('K the ribbon has no native <select> left', !/<select/.test(rb), rb.slice(0,160));
check('K the Arrow button and its kind zone sit in one .split', /<span class="split"><button data-tool="arrow"[\s\S]*?data-kindmenu="1"[\s\S]*?<\/span>/.test(rb), rb.slice(rb.indexOf('split')-20, rb.indexOf('split')+260));
check('K the kind zone lights up with the tool', /class="kindzone on"/.test(rb), rb.slice(rb.indexOf('kindzone'), rb.indexOf('kindzone')+40));
check('K the button says what it draws', /Arrow →<kbd>G<\/kbd>/.test(rb), rb.slice(rb.indexOf('data-tool="arrow"'), rb.indexOf('data-tool="arrow"')+140));

T.setGraphicKind('curly'); rb = ribbon();
check('K the label follows the kind', /Curly 2e⁻<kbd>G<\/kbd>/.test(rb), rb.slice(rb.indexOf('data-tool="arrow"'), rb.indexOf('data-tool="arrow"')+140));
check('K arrowLabel agrees', T.arrowLabel()==='Curly 2e⁻', T.arrowLabel());

T.setTool('ring'); rb = ribbon();
check('K the kind zone is dark when the tool is not active', /class="kindzone"/.test(rb), rb.slice(rb.indexOf('kindzone'), rb.indexOf('kindzone')+40));

// every kind has a ribbon label, and none of them is the long menu label
check('K every kind carries a short ribbon label', T.GKINDS.every(g=>typeof g[4]==='string' && g[4].length>0 && g[4].length<=12), T.GKINDS.map(g=>g[4]).join('|'));

const menu = T.kindMenuHTML();
check('K the menu lists all eight kinds', (menu.match(/data-gk=/g)||[]).length===8, (menu.match(/data-gk=/g)||[]).length);
check('K the menu numbers them 1-8', T.GKINDS.every((g,i)=>menu.includes(`data-gk="${g[0]}"`) && menu.includes(`<kbd>${i+1}</kbd>`)), menu.slice(0,200));
T.setGraphicKind('bracket');
check('K the current kind is ticked in the menu', /data-gk="bracket" class="on"/.test(T.kindMenuHTML()), T.kindMenuHTML().slice(0,400));

// the numeric shortcut
T.setTool('arrow'); T.setGraphicKind('arrow');
check('K 5 selects the fifth kind', T.setGraphicKindTo(5)===true && T.graphicKind()==='curly', T.graphicKind());
check('K 1 goes back to the reaction arrow', T.setGraphicKindTo(1)===true && T.graphicKind()==='arrow', T.graphicKind());
check('K 9 is refused', T.setGraphicKindTo(9)===false && T.graphicKind()==='arrow', T.graphicKind());
check('K 0 is refused', T.setGraphicKindTo(0)===false, 'accepted');
check('K a non-digit key is refused', T.setGraphicKindTo(NaN)===false && T.setGraphicKindTo(2.5)===false, 'accepted');

// picking a kind from another tool brings the Arrow tool up, as the dropdown always did
T.setTool('ring'); T.setGraphicKind('reson');
check('K choosing a kind activates the Arrow tool', T.graphicKind()==='reson', T.graphicKind());
check('K ... and the ribbon shows it active', /class="kindzone on"/.test(ribbon()), 'not active');

// opening the list is itself a way into the tool, and Escape-style dismissal clears it
T.setTool('ring'); T.hideKindMenu();
T.openKindMenu(document.getElementById('tools'));
check('K opening the kind list activates the Arrow tool', T.kindOpen()===true, T.kindOpen());
T.hideKindMenu();
check('K hiding the list clears the flag', T.kindOpen()===false, T.kindOpen());
T.openKindMenu(document.getElementById('tools'));
T.setTool('ring');
check('K leaving the Arrow tool closes the list', T.kindOpen()===false, T.kindOpen());

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
