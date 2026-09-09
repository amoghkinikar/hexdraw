// Help text guards — the tooltip and status-hint rules from the publishing pass.
// A tooltip is one sentence (≤160 chars); a status hint fits one line at 1000 px (≤110 chars);
// neither mentions a control that no longer exists; the Keys tab lists what the handler reads.
const T=require('./harness.js');
const fs=require('fs');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+got}`); };

const HINT_MAX=110, TIP_MAX=160;
const STALE=[/dropdown/i, /Switch to Select/i, /Sanzo/i];

console.log('--- every tool has a tooltip and a hint');
for(const [id,label,key,tip] of T.TOOLS){
  const h=T.HINTS[id];
  check(`tooltip: ${id} ≤ ${TIP_MAX} chars`, typeof tip==='string' && tip.length<=TIP_MAX, `${(tip||'').length}: ${tip}`);
  check(`hint: ${id} exists`, h!==undefined, 'missing');
  const lines = typeof h==='string' ? [h] : [h.hex, h.free];
  for(const l of lines) check(`hint: ${id} ≤ ${HINT_MAX} chars`, typeof l==='string' && l.length<=HINT_MAX, `${(l||'').length}: ${l}`);
  for(const re of STALE){ check(`no stale wording in ${id}`, ![tip,...lines].some(t=>re.test(t)), re); }
  check(`key ${key} in KEYS points at ${id}`, T.KEYS[key.toLowerCase()]===id, T.KEYS[key.toLowerCase()]);
}
check('every KEYS entry is a tool', Object.values(T.KEYS).every(id=>T.TOOLS.some(t=>t[0]===id)), Object.values(T.KEYS).join(','));

console.log('--- hintFor follows the layer');
T.loadState(T.freshState()); T.clearSel();
T.setToolRaw('ring');
check('ring hint on a honeycomb layer is the hex line', T.hintFor('ring')===T.HINTS.ring.hex, T.hintFor('ring'));
T.state().layers[0].free=true;
check('ring hint on a free layer is the free line', T.hintFor('ring')===T.HINTS.ring.free, T.hintFor('ring'));
check('a plain hint is the same on both', T.hintFor('pan')===T.HINTS.pan, T.hintFor('pan'));
check('an unknown tool gives an empty string', T.hintFor('nope')==='', T.hintFor('nope'));
T.state().layers[0].free=false;

console.log('--- the Keys tab is generated from the tables');
T.renderKeysPanel();
const keys=document.getElementById('keysBody').innerHTML;
for(const [id,label,key] of T.TOOLS) check(`Keys tab lists ${key} → ${label}`, keys.includes(`<kbd>${key}</kbd>`) && keys.includes(label), 'missing');
check('Keys tab lists the bond styles', Object.values(T.BOND_MODES).every(m=>keys.includes(m)), 'missing');
check('Keys tab lists the lasso', /Alt\+drag/.test(keys) && /Lasso/.test(keys), 'missing');
check('Keys tab lists the reset keys', /<kbd>0<\/kbd>/.test(keys) && /Shift\+0/.test(keys), 'missing');

console.log('--- panel hints');
const src=fs.readFileSync('check.js','utf8');
const html=fs.readFileSync('../hexdraw.html','utf8').split('<script>')[0];
const hints=[...html.matchAll(/<p class="hint"[^>]*>([\s\S]*?)<\/p>/g)].map(m=>m[1].replace(/<[^>]+>/g,''));
check('no panel hint teaches PowerPoint or Illustrator', !hints.some(h=>/PowerPoint|Illustrator|Ungroup/.test(h)), hints.find(h=>/PowerPoint|Illustrator/.test(h)));
check('no panel hint is over 320 characters', hints.every(h=>h.length<=320), hints.filter(h=>h.length>320).map(h=>h.length).join(','));
check('no status message says Switch to Select', !/Switch to Select/.test(src), 'found');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
