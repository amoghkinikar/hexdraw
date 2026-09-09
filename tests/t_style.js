// Deliverable E — journal presets, chain angle, retrosynthetic arrow width
const T=require('./harness.js');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const A=T.A, near=(a,b,e=1e-4)=>Math.abs(a-b)<e;
const freshFree=()=>{ T.loadState(T.freshState()); T.clearSel(); const L=T.state().layers[0]; L.free=true; L.autoBond=false; return L; };
const click=(tool,pw)=>{ T.setToolRaw(tool); const d=T.growStart(pw); T.growCommit(d,pw); };
const bearing=(a,b)=>((Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI%360)+360)%360;
const ang=(o,p,q)=>{ const u={x:p.x-o.x,y:p.y-o.y}, v={x:q.x-o.x,y:q.y-o.y};
  return Math.acos((u.x*v.x+u.y*v.y)/(Math.hypot(u.x,u.y)*Math.hypot(v.x,v.y)))*180/Math.PI; };

console.log('--- E1  journal presets');
check('E1 both presets are offered', T.PRESETS.map(p=>p.id).join(',')==='nature,acs1996', T.PRESETS.map(p=>p.id).join(','));
T.applyPreset('nature');
let S=T.settings();
check('E1 Nature: 0.021/0.381 of a bond as the line width', near(S.stroke, 0.021/0.381*A), S.stroke);
check('E1 Nature: 3 mm per Å in EMF', S.emfScale===Math.round(3.81/A*100), S.emfScale);
T.applyPreset('acs1996');
S=T.settings();
// 14.4 pt per 1.42 Å bond = 5.08 mm per bond = 3.5775 mm per Å
const mmPerA=14.4*(25.4/72)/A;
check('E1 ACS: line width 0.6 pt is 0.0592 Å', near(S.stroke,0.0592,5e-4), S.stroke);
check('E1 ACS: bold 2.0 pt is 0.1973 Å', near(S.boldStroke,0.1973,5e-4), S.boldStroke);
check('E1 ACS: double-bond spacing is 18% of the bond', near(S.dblOffset,0.18*A), S.dblOffset);
check('E1 ACS: 2.5 pt hash spacing gives 6 hash lines', S.hashLines===6, S.hashLines);
check('E1 ACS: 10 pt type is 0.9862 Å', near(S.fontSize,0.9862,5e-4), S.fontSize);
check('E1 ACS: EMF scale 358 (3.5775 mm per Å)', S.emfScale===Math.round(mmPerA*100) && S.emfScale===358, S.emfScale);
check('E1 ACS: SVG scale 13.52 px per Å', near(S.svgScale,13.52,0.01), S.svgScale);
check('E1 ACS: the chain angle comes with it', S.chainAngle===120, S.chainAngle);
// a preset must survive a round trip through the settings sanitiser, or it silently vanishes from files
const round=JSON.parse(JSON.stringify(S));
T.applySettings(round);
check('E1 every preset value survives sanitizeSettings', ['stroke','boldStroke','dblOffset','hashLines','fontSize','labelGap','chainAngle','emfScale','svgScale','retroGap']
  .every(k=>near(T.settings()[k], round[k], 1e-9)), ['stroke','chainAngle','retroGap'].map(k=>`${k}=${T.settings()[k]}`).join(' '));
T.applyPreset('nature'); T.setSetting('chainAngle',120);

console.log('\n--- E2  chain angle');
T.setSetting('chainAngle',120);
let L=freshFree(); click('atom',{x:0,y:0}); click('bond',{x:0.1,y:0});
check('E2 an isolated atom still grows along +x', near(bearing(T.state().atoms[0],T.state().atoms[1]),0,1e-9), bearing(T.state().atoms[0],T.state().atoms[1]).toFixed(4));
click('bond',{x:T.state().atoms[1].x+0.1, y:T.state().atoms[1].y});
check('E2 the second bond opens 120° at the shared atom', near(ang(T.state().atoms[1],T.state().atoms[0],T.state().atoms[2]),120,1e-6), ang(T.state().atoms[1],T.state().atoms[0],T.state().atoms[2]).toFixed(4));
click('bond',{x:T.state().atoms[2].x+0.1, y:T.state().atoms[2].y});
check('E2 and the third does too', near(ang(T.state().atoms[2],T.state().atoms[1],T.state().atoms[3]),120,1e-6), ang(T.state().atoms[2],T.state().atoms[1],T.state().atoms[3]).toFixed(4));
const b1=bearing(T.state().atoms[0],T.state().atoms[1]), b2=bearing(T.state().atoms[1],T.state().atoms[2]), b3=bearing(T.state().atoms[2],T.state().atoms[3]);
check('E2 the chain zig-zags rather than curling: bearings alternate', Math.abs(b1-b3)<1e-6 && Math.abs(b2-b1)>1e-6, `${b1.toFixed(1)} ${b2.toFixed(1)} ${b3.toFixed(1)}`);
// 180° restores the old straight-chain behaviour exactly
T.setSetting('chainAngle',180);
L=freshFree(); click('atom',{x:0,y:0}); click('bond',{x:0.1,y:0}); click('bond',{x:T.state().atoms[1].x+0.1,y:T.state().atoms[1].y});
check('E2 chainAngle 180 gives a straight chain, as before', near(bearing(T.state().atoms[1],T.state().atoms[2]),0,1e-9), bearing(T.state().atoms[1],T.state().atoms[2]).toFixed(4));
// two neighbours are unaffected — the bisector rule still owns that case
T.setSetting('chainAngle',120);
L=freshFree(); click('atom',{x:0,y:0});
T.state().atoms.push({id:90,x:A,y:0,el:'C',layer:1,charge:0,radical:0,h:null});
T.state().atoms.push({id:91,x:A*Math.cos(Math.PI*2/3),y:A*Math.sin(Math.PI*2/3),el:'C',layer:1,charge:0,radical:0,h:null});
T.state().bonds.push({a:1,b:90,order:1},{a:1,b:91,order:1});
check('E2 two neighbours at 0° and 120° still bisect to 240°', near(bearing(T.state().atoms[0], T.awayPoint(T.state().atoms[0], T.state().layers[0])),240,1e-6),
  bearing(T.state().atoms[0], T.awayPoint(T.state().atoms[0], T.state().layers[0])).toFixed(4));

console.log('\n--- E3  retrosynthetic arrow width');
T.loadState(T.freshState()); T.clearSel();
T.setGraphicKind('retro'); T.placeGraphic({x:0,y:0},{x:4,y:0});
let g=T.state().graphics[0];
const shafts=()=>T.graphicPrimitives(g,T.state().layers[0]).filter(o=>o.k==='path'&&o.pts.length===2);
const sep=()=>{ const p=shafts(); return Math.abs(p[0].pts[0].y-p[1].pts[0].y); };
check('E3 the two shafts are retroGap apart by default', near(sep(), T.settings().retroGap, 1e-9), `${sep().toFixed(4)} vs ${T.settings().retroGap}`);
const chev=()=>T.graphicPrimitives(g,T.state().layers[0]).find(o=>o.k==='path'&&o.pts.length===3);
check('E3 the chevron spans the two shafts', Math.abs(chev().pts[0].y) >= sep()/2 - 1e-9, `${Math.abs(chev().pts[0].y).toFixed(4)} vs ${(sep()/2).toFixed(4)}`);
T.setCtxGraphic(g); T.graphicAction('wider'); T.graphicAction('wider');
check('E3 two Wider steps add 0.10 Å', near(g.gap, T.settings().retroGap+0.10, 1e-9), `${g.gap} vs ${T.settings().retroGap+0.10}`);
check('E3 the shafts follow', near(sep(), g.gap, 1e-9), sep().toFixed(4));
check('E3 and the chevron widens with them', Math.abs(chev().pts[0].y) >= g.gap/2 - 1e-9, Math.abs(chev().pts[0].y).toFixed(4));
T.setCtxGraphic(g); T.graphicAction('narrower'); T.graphicAction('narrower'); T.graphicAction('narrower');
check('E3 Narrower steps back down and never below 0.06', g.gap>=0.06, g.gap);
T.setCtxGraphic(g); T.graphicAction('nogap');
check('E3 Reset width removes the override', g.gap===undefined && near(sep(), T.settings().retroGap, 1e-9), `${g.gap}/${sep().toFixed(4)}`);
// the equilibrium arrow keeps its own default
T.loadState(T.freshState()); T.clearSel();
T.setGraphicKind('equil'); T.placeGraphic({x:0,y:0},{x:4,y:0});
const ge=T.state().graphics[0];
const es=T.graphicPrimitives(ge,T.state().layers[0]).filter(o=>o.k==='path'&&o.pts.length===2);
check('E3 an equilibrium arrow still uses arrowGap, not retroGap', near(Math.abs(es[0].pts[0].y-es[1].pts[0].y), T.settings().arrowGap, 1e-9), Math.abs(es[0].pts[0].y-es[1].pts[0].y).toFixed(4));
// the override serialises like any other field
T.setCtxGraphic(ge); T.graphicAction('wider');
const round2=JSON.parse(JSON.stringify(T.state()));
T.loadState(round2);
check('E3 the per-arrow width survives a project round trip', T.state().graphics[0].gap!==undefined, JSON.stringify(T.state().graphics[0]));

console.log('\n--- H2  hiding implicit hydrogens on labels');
// pyrrole on a free layer: one N with an implicit H, four CH carbons that draw no label at all
const plain=h=>h.replace(/<\/?sub>/g,'');
const formula=()=>{ const S=T.exportStructure(true,15); return S?plain(T.formulaOf(S)):'(none)'; };
const labelOf=el=>{ const o=T.layerPrimitives(T.state().layers[0],false)
  .filter(x=>x.k==='text').map(x=>x.runs.map(r=>r.t).join(''))
  .find(t=>t.startsWith(el)); return o===undefined? null : o; };
T.setSetting('labelH', true);
let Lp=freshFree(); T.setRingMode('benzene'); T.setRingSides(5);
T.setToolRaw('ring'); T.addRing({x:0,y:0}); if(T.flo()) T.commitFloat();
const n=T.state().atoms.filter(a=>!T.state().bonds.some(b=>b.order===2&&(b.a===a.id||b.b===a.id)))[0];
n.el='N';
check('H2 the default is on', T.DEFAULTS.labelH===true, T.DEFAULTS.labelH);
check('H2 labelH on: the nitrogen label reads NH', labelOf('N')==='NH', labelOf('N'));
const fWith=formula(), xyzWith=T.exportXYZ(T.exportStructure(true,15));
T.setSetting('labelH', false);
check('H2 labelH off: it reads N', labelOf('N')==='N', labelOf('N'));
check('H2 the formula is C4H5N either way', formula()==='C4H5N' && formula()===fWith, formula());
check('H2 and the XYZ is byte-for-byte identical', T.exportXYZ(T.exportStructure(true,15))===xyzWith, 'the export changed');
check('H2 no H reaches the SVG label', !/>NH</.test(T.exportSVG()) && /<tspan>N<\/tspan>/.test(T.exportSVG()), (T.exportSVG().match(/<tspan>[^<]*<\/tspan>/g)||[]).join(' '));
// an explicit count is the user's own decision and is always shown
n.h=1;
check('H2 an explicit NH is shown even with labelH off', labelOf('N')==='NH', labelOf('N'));
T.setSetting('labelH', true);
check('H2 and with labelH on', labelOf('N')==='NH', labelOf('N'));
n.h=null;
// the same on a honeycomb carbon whose count was forced with the H-count tool
T.loadState(T.freshState()); T.clearSel(); T.setRingMode('plain');
T.setToolRaw('ring'); T.addRing({x:0,y:0}); if(T.flo()) T.commitFloat();
T.state().atoms[0].h=3;
T.setSetting('labelH', false);
check('H2 a forced CH3 stays CH3 with labelH off', labelOf('C')==='CH3', labelOf('C'));
T.setSetting('labelH', true);
check('H2 and with labelH on', labelOf('C')==='CH3', labelOf('C'));
// persistence: a boolean has to be declared or sanitizeSettings eats it
check('H2 labelH is declared in SETTING_BOOLS', T.SETTING_BOOLS.some(d=>d[0]==='labelH'), JSON.stringify(T.SETTING_BOOLS));
check('H2 sanitizeSettings keeps a boolean', T.sanitizeSettings({labelH:false}).labelH===false, JSON.stringify(T.sanitizeSettings({labelH:false})));
check('H2 and drops a non-boolean', T.sanitizeSettings({labelH:'no'}).labelH===undefined, JSON.stringify(T.sanitizeSettings({labelH:'no'})));
T.applySettings({labelH:false});
check('H2 it survives a project round trip', T.settings().labelH===false, T.settings().labelH);
T.applySettings({});
check('H2 and a file without it falls back to the default', T.settings().labelH===true, T.settings().labelH);
// the charge sign moves in with the label it sits beside
T.state().atoms[0].h=null; T.state().atoms[0].el='N'; T.state().atoms[0].charge=1;
T.setSetting('labelH', true);
const withH=T.layerPrimitives(T.state().layers[0],false).filter(o=>o.k==='text').find(o=>o.runs[0].t==='+');
T.setSetting('labelH', false);
const noH=T.layerPrimitives(T.state().layers[0],false).filter(o=>o.k==='text').find(o=>o.runs[0].t==='+');
check('H2 the charge sign closes up when the H is hidden', noH.x < withH.x, `${noH.x.toFixed(3)} vs ${withH.x.toFixed(3)}`);
T.setSetting('labelH', true);

// S — subscripts in free text labels, not only in atom labels
console.log('--- S  subscripts');
const runsOf = t => T.textRuns(t).map(r=>r.sub?`[${r.t}]`:r.t).join('');
for(const [inp,want] of [
  ['NH2','NH[2]'], ['CH3','CH[3]'], ['H2SO4','H[2]SO[4]'], ['CH2Cl2','CH[2]Cl[2]'],
  ['Ca(OH)2','Ca(OH)[2]'], ['C60','C[60]'],                       // formulas subscript, brackets included
  ['H2, Pd/C','H[2], Pd/C'],                                      // and inside a conditions label
  ['80 °C, 12 h','80 °C, 12 h'], ['72%','72%'], ['7-AGNR','7-AGNR'],
  ['1,2-dichloroethane','1,2-dichloroethane'], ['18-crown-6','18-crown-6'], ['2a','2a'], ['pH 7','pH 7'],
]) check(`S ${inp} → ${want}`, runsOf(inp)===want, runsOf(inp));
check('S plain text stays one run', T.textRuns('xylene, Δ').length===1, T.textRuns('xylene, Δ').length);

// the primitive list is what every writer reads, so check there rather than in the SVG alone
T.loadState(T.freshState()); T.clearSel();
T.state().texts.push({x:0,y:0,layer:1,text:'H2, Pd/C',size:0.6});
const tp=T.layerPrimitives(T.state().layers[0],false).filter(o=>o.k==='text');
check('S a free text label carries subscript runs', tp.length===1 && tp[0].runs.some(r=>r.sub&&r.t==='2'), JSON.stringify(tp[0]&&tp[0].runs));
const svg=T.exportSVG();
check('S ... and the SVG writes it as a smaller tspan', /<tspan font-size="[^"]+" dy="[^"]+">2<\/tspan>/.test(svg), svg.slice(svg.indexOf('<text'), svg.indexOf('<text')+240));
check('S ... and the whole label is still there', svg.includes('>H</tspan>') && svg.includes('>, Pd/C</tspan>'), 'text lost');
const emf=T.emfBuild();
check('S the EMF still writes the label', emf.length>0, emf.length);
// The EMF lays runs out itself from the advance-width table, so a character missing from it shows as a
// gap before the following subscript. Punctuation must not fall back to the uppercase-letter width.
for(const c of '(),./°[]') check(`S the width table knows ${c}`, T.strWidth(c,1)<0.5, T.strWidth(c,1));
check('S ... and % is wide, as Arial has it', Math.abs(T.strWidth('%',1)-0.889)<1e-9, T.strWidth('%',1));
check('S ... and a capital is still wide', T.strWidth('C',1)>0.6, T.strWidth('C',1));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
