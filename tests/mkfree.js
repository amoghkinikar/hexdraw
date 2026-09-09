const T=require('./harness.js'); const fs=require('fs');
const freeLayer=()=>{ T.loadState(T.freshState()); T.clearSel(); const L=T.state().layers[0]; L.free=true; L.autoBond=false; return L; };
const write=(n,label)=>{ if(label) T.state().texts.push(label); fs.writeFileSync(n, T.exportSVG()); };

// 1. the templates
T.loadState(T.freshState()); T.clearSel(); T.buildTemplate('pc');
write('v_pc.svg', {x:0,y:-9,layer:T.state().active,text:'phthalocyanine  C32H16FeN8',size:0.9});
T.loadState(T.freshState()); T.clearSel(); T.buildTemplate('porphine');
write('v_porphine.svg', {x:0,y:-7,layer:T.state().active,text:'porphine  C20H14N4',size:0.9});

// 2. fused n-gons, a Clar circle and a fill
freeLayer(); T.setRingMode('plain');
const mid=b=>{const p=T.atomById(b.a),q=T.atomById(b.b);return {x:(p.x+q.x)/2,y:(p.y+q.y)/2};};
T.setRingSides(5); T.addRing({x:0,y:0});
T.setRingSides(6); T.addRing(mid(T.state().bonds[0]));
let far=null,fd=-1; for(const b of T.state().bonds){ const m=mid(b); const d=Math.hypot(m.x,m.y); if(d>fd){fd=d;far=b;} }
T.setRingSides(5); T.addRing(mid(far));
T.state().texts.push({x:1.5,y:-4.2,layer:1,text:'5–6–5 fused, every edge 1.42 Å',size:0.75});
fs.writeFileSync('v_fused.svg', T.exportSVG());

// 3. pyrrole, a lone pair and a radical
freeLayer(); T.setRingMode('benzene'); T.setRingSides(5); T.addRing({x:0,y:0});
T.state().atoms.filter(a=>!T.state().bonds.some(b=>b.order===2&&(b.a===a.id||b.b===a.id)))[0].el='N';
T.setRingSides(6); T.setRingMode('plain'); T.addRing({x:5.5,y:0});
const rr=T.state().atoms.filter(a=>a.layer===1&&a.x>4.5);
rr[0].radical=1; rr[3].radical=2;
T.state().texts.push({x:0,y:-2.6,layer:1,text:'pyrrole  C4H5N',size:0.7});
T.state().texts.push({x:5.5,y:-2.6,layer:1,text:'one electron   /   lone pair',size:0.7});
fs.writeFileSync('v_radicals.svg', T.exportSVG());
console.log('written');
