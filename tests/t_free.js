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
const bondLens=()=>T.state().bonds.map(b=>{const p=T.atomById(b.a),q=T.atomById(b.b);return Math.hypot(p.x-q.x,p.y-q.y);});
const minSep=()=>{ const as=T.state().atoms; let m=1e9;
  for(let i=0;i<as.length;i++) for(let j=i+1;j<as.length;j++) m=Math.min(m,Math.hypot(as[i].x-as[j].x,as[i].y-as[j].y)); return m; };
const edgeMid=b=>{ const p=T.atomById(b.a),q=T.atomById(b.b); return {x:(p.x+q.x)/2, y:(p.y+q.y)/2}; };

// B1 — pentagon, fuse a hexagon onto an edge, fuse a pentagon onto the hexagon
console.log('--- B1  fusing n-gons on a free layer');
let L=freshFree(); T.setRingMode('plain');
T.setRingSides(5); placeRing({x:0,y:0});
check('B1 a free pentagon has 5 atoms and 5 bonds', T.state().atoms.length===5&&T.state().bonds.length===5, `${T.state().atoms.length}/${T.state().bonds.length}`);
const outerBond=()=>{ let best=null,bd=-1; for(const b of T.state().bonds){ const m=edgeMid(b); const d=Math.hypot(m.x,m.y); if(d>bd){bd=d;best=b;} } return best; };
T.setRingSides(6); placeRing(edgeMid(T.state().bonds[0]));
check('B1 the fused hexagon shares an edge: 9 atoms, 10 bonds', T.state().atoms.length===9&&T.state().bonds.length===10, `${T.state().atoms.length}/${T.state().bonds.length}`);
T.setRingSides(5); placeRing(edgeMid(outerBond()));
check('B1 the fused pentagon shares an edge: 12 atoms, 14 bonds', T.state().atoms.length===12&&T.state().bonds.length===14, `${T.state().atoms.length}/${T.state().bonds.length}`);
const lens=bondLens();
check('B1 every edge is 1.42 ± 0.01 Å', lens.every(l=>Math.abs(l-1.42)<0.01), `${Math.min(...lens).toFixed(4)} … ${Math.max(...lens).toFixed(4)}`);
check('B1 no two atoms closer than 1.3 Å', minSep()>1.3, minSep().toFixed(4));
check('B1 the three rings are found by the ring finder', T.ringsOf(T.state().layers[0]).map(r=>r.length).sort().join(',')==='5,5,6', T.ringsOf(T.state().layers[0]).map(r=>r.length).sort().join(','));

// B2 — pyrrole with explicit double bonds
console.log('\n--- B2  pyrrole on a free layer');
L=freshFree(); T.setRingMode('benzene'); T.setRingSides(5); placeRing({x:0,y:0});
const ring=T.state().atoms.slice();
const und=ring.filter(a=>!T.state().bonds.some(b=>b.order===2&&(b.a===a.id||b.b===a.id)));
check('B2 the Kekulé pattern leaves exactly one atom without a double bond', und.length===1, und.length);
und[0].el='N';
check('B2 formula is C4H5N (N–H needs no override on a free layer)', formula()==='C4H5N', formula());
const ctr=T.polyCentroid(ring);
const prims=T.layerPrimitives(T.state().layers[0], false).filter(o=>o.k==='line');
let secondLines=0, allInside=true;
for(const b of T.state().bonds.filter(x=>x.order===2)){
  const p=T.atomById(b.a), q=T.atomById(b.b);
  const d=Math.hypot(q.x-p.x,q.y-p.y), u={x:(q.x-p.x)/d,y:(q.y-p.y)/d}, nv={x:-u.y,y:u.x};
  const mid={x:(p.x+q.x)/2,y:(p.y+q.y)/2};
  const offs=prims.filter(o=>{
      const dx=o.b.x-o.a.x, dy=o.b.y-o.a.y, l=Math.hypot(dx,dy)||1;
      if(Math.abs((dx/l)*nv.x+(dy/l)*nv.y)>1e-6) return false;                       // must be parallel to the bond
      const m={x:(o.a.x+o.b.x)/2,y:(o.a.y+o.b.y)/2};
      return Math.abs((m.x-mid.x)*u.x+(m.y-mid.y)*u.y)<0.5 && Math.abs((m.x-mid.x)*nv.x+(m.y-mid.y)*nv.y)<0.5;
    }).map(o=>{ const m={x:(o.a.x+o.b.x)/2,y:(o.a.y+o.b.y)/2}; return (m.x-mid.x)*nv.x+(m.y-mid.y)*nv.y; })
      .filter(v=>Math.abs(v)>0.05);
  if(offs.length!==1){ allInside=false; continue; }
  secondLines++;
  if(Math.sign(offs[0])!==Math.sign((ctr.x-mid.x)*nv.x+(ctr.y-mid.y)*nv.y)) allInside=false;
}
check('B2 each double bond draws exactly one second line', secondLines===2, secondLines);
check('B2 both second lines sit inside the ring', allInside, 'a second line fell outside');

// B3 — phthalocyanine
console.log('\n--- B3  phthalocyanine');
T.loadState(T.freshState()); T.clearSel(); T.state().layers[0].free=true; T.state().layers[0].autoBond=false;
T.startFloatFragment(T.macrocycleFragment(T.TEMPLATES.pc), T.state().layers[0].id); T.commitFloat();
const S=T.exportStructure(true,15);
check('B3 40 heavy atoms, no metal centre', S.atoms.length===40 && !S.atoms.some(a=>a.el==='Fe'), S.atoms.length);
check('B3 formula is C32H18N8, the free base', formula()==='C32H18N8', formula());
const nH=S.hAtoms.filter(h=>S.atoms[h.parent].el==='N').length;
check('B3 exactly two of the eight nitrogens carry an H', nH===2, nH);
check('B3 the other sixteen hydrogens are on benzo carbons', S.hAtoms.length===18 && S.hAtoms.filter(h=>S.atoms[h.parent].el==='C').length===16, `${S.hAtoms.length}/${S.hAtoms.filter(h=>S.atoms[h.parent].el==='C').length}`);
const cc=T.state().bonds.map(b=>{const p=T.atomById(b.a),q=T.atomById(b.b);return Math.hypot(p.x-q.x,p.y-q.y);});
check('B3 every bond is 1.42 ± 0.01 Å', cc.every(d=>Math.abs(d-1.42)<0.01), `${Math.min(...cc).toFixed(4)} … ${Math.max(...cc).toFixed(4)}`);
check('B3 no two atoms closer than 1.3 Å', minSep()>1.3, minSep().toFixed(4));

// porphine
console.log('\n--- B3b  porphine');
T.loadState(T.freshState()); T.clearSel(); T.state().layers[0].free=true; T.state().layers[0].autoBond=false;
T.startFloatFragment(T.macrocycleFragment(T.TEMPLATES.porphine), T.state().layers[0].id); T.commitFloat();
check('B3b formula is C20H14N4', formula()==='C20H14N4', formula());
check('B3b 24 heavy atoms', T.state().atoms.length===24, T.state().atoms.length);
check('B3b every bond is 1.42 ± 0.01 Å', bondLens().every(l=>Math.abs(l-1.42)<0.01), `${Math.min(...bondLens()).toFixed(4)} … ${Math.max(...bondLens()).toFixed(4)}`);
const Sp=T.exportStructure(true,15);
const nh=Sp.hAtoms.filter(h=>Sp.atoms[h.parent].el==='N').length;
check('B3b exactly two of the four nitrogens carry an H', nh===2, nh);

// B4 — every double bond in both templates has its second line on the right side
console.log('\n--- B4  double-bond sides across whole macrocycles');
for(const name of ['pc','porphine']){
  T.loadState(T.freshState()); T.clearSel(); T.state().layers[0].free=true; T.state().layers[0].autoBond=false; T.startFloatFragment(T.macrocycleFragment(T.TEMPLATES[name]), T.state().layers[0].id); T.commitFloat();
  const Ly=T.state().layers[T.state().layers.length-1];
  const adj=T.adjacency(Ly), cache=new Map();
  let bad=0, ringed=0, macro=0, macroIn=0;
  for(const b of T.state().bonds.filter(x=>x.order===2)){
    const p=T.atomById(b.a), q=T.atomById(b.b);
    const ring=T.ringOfBond({a:b.a,b:b.b},Ly,8,adj);
    const s=T.freeSide(p,q,Ly,cache,adj);
    const d=Math.hypot(q.x-p.x,q.y-p.y), nv={x:-(q.y-p.y)/d, y:(q.x-p.x)/d};
    const mid={x:(p.x+q.x)/2, y:(p.y+q.y)/2};
    if(ring){ ringed++;
      const c=T.polyCentroid(ring);
      if(Math.sign((c.x-mid.x)*nv.x+(c.y-mid.y)*nv.y)!==s) bad++;
    } else { macro++; if(Math.sign(-mid.x*nv.x-mid.y*nv.y)===s) macroIn++; }
  }
  check(`B4 ${name}: all ${ringed} ring double bonds draw inside their ring`, bad===0, `${bad} misplaced`);
  check(`B4 ${name}: all ${macro} bridge double bonds draw inside the macrocycle`, macro===macroIn, `${macroIn}/${macro}`);
}

// B5 — copy to layer from a free layer to a lattice layer keeps coordinates
console.log('\n--- B5  copy-to-layer, free → lattice');
L=freshFree(); T.setRingMode('benzene'); T.setRingSides(5); placeRing({x:0,y:0});
T.state().layers.push({id:2,name:'Layer 2',z:3.35,dx:0,dy:0,visible:true,color:'#000000',autoBond:true,free:false});
const bx=T.state().atoms.map(a=>({x:a.x,y:a.y}));
T.selectAllActive(); T.startFloat('dup',2); T.commitFloat();
const copied=T.state().atoms.filter(a=>a.layer===2);
check('B5 five atoms landed on the lattice layer', copied.length===5, copied.length);
check('B5 the copies keep their free-layer coordinates', copied.every(c=>bx.some(o=>Math.abs(o.x-c.x)<1e-9&&Math.abs(o.y-c.y)<1e-9)), JSON.stringify(copied.map(c=>[+c.x.toFixed(3),+c.y.toFixed(3)])));
check('B5 the originals are still on the free layer', T.state().atoms.filter(a=>a.layer===1).length===5, T.state().atoms.filter(a=>a.layer===1).length);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
