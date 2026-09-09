const T=require('./harness.js'); const fs=require('fs');
T.loadState(T.freshState());
const place=(k,x0,y0,x1,y1)=>{ T.setGraphicKind(k); T.placeGraphic({x:x0,y:y0},{x:x1,y:y1}); return T.state().graphics[T.state().graphics.length-1]; };
const label=(x,y,t)=>T.state().texts.push({x,y,layer:1,text:t,size:0.6});
const row=[['arrow',0],['equil',5],['reson',10],['retro',15]];
for(const [k,x] of row){ place(k,x,0,x+3.5,0); label(x+1.75,-1.0,k); }
place('curly',0,4,3.5,4);   label(1.75,3.0,'curly');
place('curlyh',5,4,8.5,4);  label(6.75,3.0,'curlyh');
const br=place('bracket',10,2.8,12.5,5.2); br.text='2−'; br.size=0.6; label(11.25,2.0,'bracket');
place('plus',15.5,4,15.5,4); label(15.5,3.0,'plus');
// a coloured, bold arrow to prove the per-graphic overrides survive both writers
const g=place('arrow',0,8,3.5,8); g.color='#cc1236'; g.bold=true; label(1.75,7.0,'bold + colour');
fs.writeFileSync('scheme.svg', T.exportSVG());
fs.writeFileSync('scheme.emf', Buffer.from(T.emfBuild()));
fs.writeFileSync('scheme.hexdraw.json', JSON.stringify(T.state(),null,1));
console.log('graphics:', T.state().graphics.map(x=>x.kind).join(', '));
console.log('svg bytes:', fs.statSync('scheme.svg').size, ' emf bytes:', fs.statSync('scheme.emf').size);
