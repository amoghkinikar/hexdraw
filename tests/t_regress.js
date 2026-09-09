const T=require('./harness.js');
const plain=h=>h.replace(/<\/?sub>/g,'');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };
const A=T.A, S3=Math.sqrt(3);
const reset=()=>{ T.loadState(T.freshState()); T.clearSel(); };
const formula=()=>{ const S=T.exportStructure(true,15); return S?plain(T.formulaOf(S)):'(none)'; };

// R1 — benzene in benzene mode has orders 2,1,2,1,2,1
reset(); T.setRingMode('benzene'); T.addRing({x:0,y:0});
let orders=T.state().bonds.map(b=>b.order).join(',');
check('R1 benzene bond orders 2,1,2,1,2,1', orders==='2,1,2,1,2,1', orders);

// R2 — a second ring fused: 10 atoms, 11 bonds, 5 doubles, no atom with two doubles, C10H8
T.addRing({x:S3*A,y:0});
const st=T.state();
const dbl=st.bonds.filter(b=>b.order===2).length;
const twice=st.atoms.filter(a=>st.bonds.filter(b=>b.order===2&&(b.a===a.id||b.b===a.id)).length>1).length;
check('R2 naphthalene 10 atoms', st.atoms.length===10, st.atoms.length);
check('R2 naphthalene 11 bonds', st.bonds.length===11, st.bonds.length);
check('R2 naphthalene 5 double bonds', dbl===5, dbl);
check('R2 no atom carries two double bonds', twice===0, twice);
check('R2 formula C10H8', formula()==='C10H8', formula());

// R3 — a1 between the two equivalent top atoms exports a C4H2 cell
const top=st.atoms.filter(a=>Math.abs(a.y+A)<1e-6).sort((p,q)=>p.x-q.x);
st.lattice={t1:{x:top[1].x-top[0].x, y:top[1].y-top[0].y}, t2:null, origin:{x:top[0].x,y:top[0].y}};
check('R3 a1 = 2.4595 Å along x', Math.abs(st.lattice.t1.x-S3*A)<1e-9 && Math.abs(st.lattice.t1.y)<1e-9, JSON.stringify(st.lattice.t1));
check('R3 periodic cell is C4H2', formula()==='C4H2', formula());

// R4 — stroke 0.2 gives stroke-width="5.6" in SVG and elpWidth 60 in the EMF pen record
reset(); T.setRingMode('benzene'); T.addRing({x:0,y:0});
T.setSetting('stroke',0.2);
const svg=T.exportSVG();
check('R4 SVG carries stroke-width="5.6"', svg.includes('stroke-width="5.6"'), (svg.match(/stroke-width="[^"]*"/g)||[]).slice(0,3).join(' '));
const emf=T.emfBuild(); const dv=new DataView(emf.buffer,emf.byteOffset,emf.byteLength);
let off=88, widths=[];
while(off+8<=emf.length){ const type=dv.getUint32(off,true), size=dv.getUint32(off+4,true); if(!size) break;
  if(type===95) widths.push(dv.getUint32(off+8+24,true)); off+=size; }
check('R4 EMF pen record elpWidth 60', widths.length>0 && widths.every(w=>w===60), JSON.stringify(widths));
T.setSetting('stroke',0.075);

// R5 — auto-bond off still gives 10 atoms / 11 bonds for two fused rings
reset(); T.state().layers[0].autoBond=false; T.setRingMode('benzene');
T.addRing({x:0,y:0}); T.addRing({x:S3*A,y:0});
check('R5 auto-bond off: 10 atoms', T.state().atoms.length===10, T.state().atoms.length);
check('R5 auto-bond off: 11 bonds', T.state().bonds.length===11, T.state().bonds.length);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
