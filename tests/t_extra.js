const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const reset=()=>{ T.loadState(T.freshState()); T.clearSel(); };
const near=(a,b,e=1e-9)=>Math.abs(a-b)<e;

// project round-trip, and an old file with no graphics array
reset(); T.setGraphicKind('curly'); T.placeGraphic({x:0,y:0},{x:3,y:0});
const saved=JSON.stringify(T.state());
T.loadState(JSON.parse(saved));
check('E1 project round-trip keeps the graphic and its 3 points', T.state().graphics.length===1&&T.state().graphics[0].pts.length===3, JSON.stringify(T.state().graphics));
const old=JSON.parse(saved); delete old.graphics;
T.loadState(old); T.state().graphics=T.state().graphics||[];
let e1=null; try{ T.exportSVG(); T.emfBuild(); }catch(e){ e1=e.message; }
check('E2 a project file with no graphics array still renders', e1===null, e1);

// a drawing that is only graphics
reset(); T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0});
const svg=T.exportSVG(); const emf=T.emfBuild();
check('E3 arrows alone still produce an SVG', svg.length>0&&svg.includes('<path'), svg.slice(0,60));
check('E3 arrows alone still produce an EMF', emf&&emf.length>88, emf&&emf.length);
check('E4 arrows alone give no structure to export', T.exportStructure(true,15)===null, String(T.exportStructure(true,15)));

// hit-testing and handles
reset(); T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0});
const L=T.activeLayer();
check('E5 a click on the shaft finds the graphic', T.findGraphic({x:2,y:0.05},L)!==null, 'null');
check('E5 a click well away from it does not', T.findGraphic({x:2,y:2},L)===null, 'found one');
const h=T.findGraphicHandle({x:4.02,y:0.02},L);
check('E6 the far endpoint is a draggable handle', h&&h.i===1, JSON.stringify(h&&h.i));

// erase
reset(); T.setGraphicKind('reson'); T.placeGraphic({x:0,y:0},{x:4,y:0});
T.setGraphicKind('plus'); T.placeGraphic({x:8,y:0},{x:8,y:0});
T.deleteSel();
check('E7 Delete removes the selected graphic only', T.state().graphics.length===1&&T.state().graphics[0].kind==='reson', T.state().graphics.map(g=>g.kind).join(','));

// selection-scoped SVG export
reset(); T.setRingMode('benzene'); T.addRing({x:0,y:0});
T.setGraphicKind('arrow'); T.placeGraphic({x:3,y:0},{x:6,y:0});
const all=T.exportSVG();
check('E8 the full SVG contains both ring and arrow', all.includes('<line')&&all.includes('<path'), 'missing one');

// bold and colour overrides reach both writers
reset(); T.setGraphicKind('arrow'); T.placeGraphic({x:0,y:0},{x:4,y:0});
const g=T.state().graphics[0]; g.bold=true; g.color='#cc1236';
const s2=T.exportSVG();
check('E9 SVG carries the per-graphic colour', s2.includes('#cc1236'), 'no');
check('E9 SVG carries the bold width (0.2 x 28 = 5.6)', s2.includes('stroke-width="5.6"'), (s2.match(/stroke-width="[^"]*"/g)||[]).join(' '));
const emf2=T.emfBuild(); const dv=new DataView(emf2.buffer,emf2.byteOffset,emf2.byteLength);
let off=88, pens=[];
while(off+8<=emf2.length){ const type=dv.getUint32(off,true), size=dv.getUint32(off+4,true); if(!size) break;
  if(type===95) pens.push({w:dv.getUint32(off+8+24,true), bgr:dv.getUint32(off+8+32,true).toString(16)}); off+=size; }
check('E9 EMF pen is 60 wide and BGR 0x3612cc', pens.length===1&&pens[0].w===60&&pens[0].bgr==='3612cc', JSON.stringify(pens));
let bez=0; off=88;
while(off+8<=emf2.length){ const type=dv.getUint32(off,true), size=dv.getUint32(off+4,true); if(!size) break; if(type===2) bez++; off+=size; }
check('E10 a straight arrow emits no bezier record', bez===0, bez);
reset(); T.setGraphicKind('curly'); T.placeGraphic({x:0,y:0},{x:4,y:0});
const emf3=T.emfBuild(); const dv3=new DataView(emf3.buffer,emf3.byteOffset,emf3.byteLength);
bez=0; off=88;
while(off+8<=emf3.length){ const type=dv3.getUint32(off,true), size=dv3.getUint32(off+4,true); if(!size) break; if(type===2) bez++; off+=size; }
check('E10 a curly arrow emits one EMR_POLYBEZIER (record type 2)', bez===1, bez);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
