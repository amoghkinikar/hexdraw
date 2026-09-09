// Browser suite — the things the node harness cannot see: real DOM events, hit-testing, key handling.
// The double-click regression in H2 was invisible to every other suite by construction.
// Skips cleanly (exit 0) if Playwright is not installed.
let chromium;
try { ({chromium} = require('playwright')); }
catch(e){ console.log('SKIP  playwright is not installed — browser suite not run'); process.exit(0); }

const PAGE = 'file://' + require('path').resolve(__dirname, '..', 'hexdraw.html');
let pass=0, fail=0;
const check=(name,ok,got)=>{ (ok?pass++:fail++); console.log(`${ok?'PASS':'FAIL'}  ${name}${ok?'':'   got: '+JSON.stringify(got)}`); };

(async()=>{
  const browser=await chromium.launch();
  const page=await browser.newPage({viewport:{width:1200,height:800}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  // Playwright dismisses dialogs by default, which quietly turned every confirm() into a "no" — the
  // Clear-all button did nothing and drawings accumulated across sections. Accept them.
  page.on('dialog', d=>d.accept());
  await page.goto(PAGE);
  await page.waitForTimeout(300);

  // the ribbon button text without its <kbd> shortcut
  const label = id => page.evaluate(t=>{ const b=[...document.querySelectorAll('#tools button')].find(x=>x.dataset.tool===t).cloneNode(true);
    b.querySelectorAll('kbd').forEach(k=>k.remove()); return b.textContent.trim(); }, id);
  const msg  = () => page.evaluate(()=>document.getElementById('msg').textContent);
  const setFree = on => page.evaluate(v=>{ const cb=document.querySelector('#layerList input[data-f="free"]');
    if(cb.checked!==v){ cb.checked=v; cb.dispatchEvent(new Event('change',{bubbles:true})); } }, on);
  const formula = () => page.evaluate(()=>document.getElementById('formula').textContent);
  // The hover preview is drawn at the snapped site under the cursor — which is exactly where the atom
  // just placed from that cursor position went. It is the only way to read an atom's screen position
  // from outside the closure, and a lone carbon draws nothing of its own.
  const hoverDot = () => page.evaluate(()=>{ const c=document.querySelector('#hoverG circle'); if(!c) return null;
    const r=c.getBoundingClientRect(); return {x:r.left+r.width/2, y:r.top+r.height/2}; });

  const R=await page.evaluate(()=>{ const r=document.getElementById('canvas').getBoundingClientRect(); return {x:r.left,y:r.top,w:r.width,h:r.height}; });
  const cx=R.x+R.w/2, cy=R.y+R.h/2;

  console.log('--- H1  the drawing is not a pointer target');
  const pe = await page.evaluate(()=>getComputedStyle(document.getElementById('world')).pointerEvents);
  check('H1 #world is pointer-events:none, so the target of a click is always the canvas', pe==='none', pe);
  // a drag on the canvas is a drawing gesture: without user-select:none the browser selects the angle
  // readout and any label the drag crosses, and paints them highlighted
  const us = await page.evaluate(()=>getComputedStyle(document.getElementById('canvas')).userSelect);
  check('H1 the canvas is not selectable, so a drag never highlights text', us==='none', us);

  console.log('--- H2  double-click an atom to edit its label');
  await page.evaluate(()=>{ window.__p=[]; window.prompt=m=>{ window.__p.push(m); return 'N'; }; });
  await page.keyboard.press('a');
  await page.mouse.move(cx,cy);
  await page.mouse.click(cx,cy);
  await page.waitForTimeout(120);
  check('H2 honeycomb: one click placed a carbon', /^CH4$/.test(await formula()), await formula());
  const site = await hoverDot();
  check('H2 the atom was snapped away from the cursor, so the test must aim at the site', !!site && Math.abs(site.y-cy)>4, site);
  await page.mouse.dblclick(site.x, site.y);
  await page.waitForTimeout(150);
  check('H2 the element prompt opened', (await page.evaluate(()=>window.__p)).some(m=>/Element for this atom/.test(m)), await page.evaluate(()=>window.__p));
  check('H2 and the answer was applied (Hill notation puts H first with no carbon)', /^H3N$/.test(await formula()), await formula());

  await page.evaluate(()=>{ window.__p=[]; });
  await page.keyboard.down('Control'); await page.keyboard.press('z'); await page.keyboard.up('Control');
  await setFree(true);
  await page.keyboard.press('a');
  await page.mouse.click(cx+120, cy+80);
  await page.waitForTimeout(120);
  await page.mouse.dblclick(cx+120, cy+80);
  await page.waitForTimeout(150);
  check('H2 free layer: the same double-click works there too', (await page.evaluate(()=>window.__p)).some(m=>/Element for this atom/.test(m)), await page.evaluate(()=>window.__p));

  console.log('--- H3  digits 3-8 set the ring size on a free layer');
  await page.evaluate(()=>{ window.prompt=()=>null; });
  await page.keyboard.press('r');
  check('H3 the Ring button shows the size on a free layer', await label('ring')==='Ring 6', await label('ring'));
  await page.keyboard.press('5');
  check('H3 pressing 5 gives a five-ring', await label('ring')==='Ring 5', await label('ring'));
  check('H3 and says so', /5-membered/.test(await msg()), await msg());
  await page.keyboard.press('8');
  check('H3 pressing 8 gives an eight-ring', await label('ring')==='Ring 8', await label('ring'));
  await page.keyboard.press('3');
  check('H3 pressing 3 gives a three-ring', await label('ring')==='Ring 3', await label('ring'));
  await page.keyboard.press('9');
  check('H3 9 is out of range and changes nothing', await label('ring')==='Ring 3', await label('ring'));
  await page.keyboard.press('n');
  check('H3 N still cycles on from there', await label('ring')==='Ring 4', await label('ring'));

  console.log('--- H4  the digits keep their bond meaning everywhere else');
  check('H4 the bond mode was left alone while the Ring tool had the digits', await label('bond')==='Bond 1', await label('bond'));
  await setFree(false);
  await page.keyboard.press('r');
  check('H4 a honeycomb layer shows no size on the Ring button', await label('ring')==='Ring', await label('ring'));
  await page.keyboard.press('3');
  check('H4 and there 3 is a triple bond again', await label('bond')==='Bond 3', await label('bond'));
  await page.keyboard.press('d');
  await page.keyboard.press('2');
  check('H4 the Bond tool still takes the digits', await label('bond')==='Bond 2', await label('bond'));

  console.log('--- H5  0 resets the active tool, Shift+0 resets all of them');
  await setFree(true);
  await page.keyboard.press('r');
  await page.keyboard.press('7');
  await page.keyboard.press('0');
  check('H5 0 on the Ring tool puts the ring size back to 6', await label('ring')==='Ring 6', await label('ring'));
  check('H5 and leaves the bond mode where it was', await label('bond')==='Bond 2', await label('bond'));
  await page.keyboard.press('d');
  await page.keyboard.press('0');
  check('H5 0 on the Bond tool puts the mode back to single', await label('bond')==='Bond 1', await label('bond'));
  await page.keyboard.press('r'); await page.keyboard.press('4');
  await page.keyboard.press('v');
  await page.keyboard.press('0');
  check('H5 0 on a tool with no modes changes nothing', await label('ring')==='Ring 4', await label('ring'));
  check('H5 and says so', /nothing to reset/.test(await msg()), await msg());
  // Shift+0 is read from e.code: e.key is ')' on a US layout and '=' on a German one
  await page.keyboard.press('Shift+0');
  check('H5 Shift+0 resets every tool from any tool', await label('ring')==='Ring 6' && await label('bond')==='Bond 1', `${await label('ring')} / ${await label('bond')}`);

  console.log('--- H6  the colour panel');
  const popShown = () => page.evaluate(()=>getComputedStyle(document.getElementById('colorPop')).display!=='none');
  const popTitle = () => page.evaluate(()=>document.getElementById('cpopTitle').textContent);
  const fillChip = () => page.evaluate(()=>{ const c=document.querySelector('#tools [data-tool="fill"] .chip'); return c? c.style.background : null; });
  const layerChipColor = () => page.evaluate(()=>document.querySelector('#layerList [data-chip]').style.background);
  const firstFill = () => page.evaluate(()=>{ const p=document.querySelector('#layersG polygon'); return p? p.getAttribute('fill') : null; });
  await page.keyboard.press('0');
  await setFree(false);
  await page.evaluate(()=>{ document.getElementById('clearBtn').click(); });
  await page.waitForTimeout(80);
  check('H6 the panel starts hidden', (await popShown())===false, await popShown());
  check('H6 and the Fill button carries no chip', (await fillChip())===null, await fillChip());
  await page.keyboard.press('r');
  await page.mouse.click(cx, cy);                              // a ring to fill
  await page.waitForTimeout(80);
  await page.keyboard.press('f');
  await page.waitForTimeout(80);
  check('H6 pressing F opens the panel on the fill colour', (await popShown())===true && /^Fill colour/.test(await popTitle()), await popTitle());
  check('H6 and puts the chip in the Fill button', /165, 200, 209/.test(await fillChip()||''), await fillChip());
  const box = await page.evaluate(()=>{ const p=document.getElementById('colorPop').getBoundingClientRect();
    const b=document.querySelector('#tools [data-tool="fill"]').getBoundingClientRect(); return {pt:p.top, bb:b.bottom, pl:p.left, br:p.right}; });
  check('H6 it hangs below the Fill button', box.pt>=box.bb-1, box);
  await page.click('#swatches button[data-hex="#cc1236"]');
  await page.waitForTimeout(80);
  check('H6 a swatch changes the fill colour', /204, 18, 54/.test(await fillChip()||''), await fillChip());
  check('H6 and leaves the layer ink black', /0, 0, 0/.test(await layerChipColor()), await layerChipColor());
  check('H6 the panel is still open for a second pick', (await popShown())===true, await popShown());
  await page.mouse.click(cx, cy);                              // the first press on the canvas
  await page.waitForTimeout(100);
  check('H6 pressing on the canvas closes the panel', (await popShown())===false, await popShown());
  check('H6 and that same press still applied the fill', (await firstFill())==='#cc1236', await firstFill());
  await page.click('#tools [data-tool="fill"]');
  await page.waitForTimeout(80);
  check('H6 clicking the Fill button reopens it', (await popShown())===true, await popShown());
  await page.keyboard.press('d');
  await page.waitForTimeout(80);
  check('H6 leaving the Fill tool hides it', (await popShown())===false, await popShown());
  check('H6 and the chip goes with it', (await fillChip())===null, await fillChip());
  // a layer chip opens the same panel on that layer's ink
  await page.click('#layerList [data-chip]');
  await page.waitForTimeout(80);
  check('H6 a layer chip opens the panel on that layer', (await popShown())===true && /^Layer 1 ink/.test(await popTitle()), await popTitle());
  check('H6 its right edge stays inside the window', await page.evaluate(()=>document.getElementById('colorPop').getBoundingClientRect().right<=window.innerWidth), 'it overflowed');
  await page.click('#swatches button[data-hex="#489b6e"]');
  await page.waitForTimeout(80);
  check('H6 a pick changes the layer ink', /72, 155, 110/.test(await layerChipColor()), await layerChipColor());
  check('H6 and does not touch the fill', (await firstFill())==='#cc1236', await firstFill());
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  check('H6 Escape closes the panel', (await popShown())===false, await popShown());
  await page.keyboard.down('Control'); await page.keyboard.press('z'); await page.keyboard.up('Control');
  await page.waitForTimeout(80);
  check('H6 one undo puts the layer ink back to black', /0, 0, 0/.test(await layerChipColor()), await layerChipColor());

  console.log('--- H7  the angle readout while turning');
  const readout = () => page.evaluate(()=>{ const t=[...document.querySelectorAll('#hoverG text')].map(x=>x.textContent).find(x=>/\u00b0/.test(x)); return t||null; });
  await setFree(true);
  await page.keyboard.press('r');
  await page.mouse.move(cx-150, cy+120);
  await page.mouse.down();
  await page.mouse.move(cx-150, cy+60);
  await page.mouse.move(cx-150, cy+20);
  await page.waitForTimeout(80);
  const rd = await readout();
  check('H7 dragging a ring shows the angle on the canvas', rd!==null && /\u00b0 \([+-]/.test(rd), rd);
  check('H7 and the status line says Turning', /^Turning /.test(await msg()), await msg());
  check('H7 the snapped readout carries no decimal point', rd!==null && !/\d\.\d/.test(rd), rd);
  await page.keyboard.down('Shift');
  await page.mouse.move(cx-100, cy-30);
  await page.waitForTimeout(80);
  const rdFree = await readout();
  check('H7 Shift frees the angle and the readout gains a decimal', rdFree!==null && /\d\.\d\u00b0/.test(rdFree), rdFree);
  await page.keyboard.up('Shift');
  await page.mouse.up();
  await page.waitForTimeout(120);
  check('H7 releasing places the ring and clears the readout', (await readout())===null, await readout());
  check('H7 and the status line goes back to the tool hint', !/^Turning /.test(await msg()), await msg());
  check('H7 nothing of the readout reaches the SVG export', await page.evaluate(()=>{
    const sel=document.getElementById('fmt'); sel.value='svg'; document.getElementById('prevBtn').click();
    return !/\u00b0/.test(document.getElementById('out').value); }), 'a degree sign leaked into the export');

  console.log('--- I  the Lattice tool and the active layer');
  await page.evaluate(()=>{ document.getElementById('clearBtn').click(); });
  await page.waitForTimeout(80);
  await setFree(false);
  await page.keyboard.press('a');
  await page.mouse.move(cx, cy);
  await page.mouse.click(cx, cy);                       // one atom on Layer 1, at the snapped site
  await page.waitForTimeout(120);
  const atom = await hoverDot();                        // the hover preview marks where it went
  check('I the fixture atom is on screen', !!atom, atom);
  const panel = () => page.evaluate(()=>document.getElementById('latticePanel').textContent);
  await page.evaluate(()=>document.getElementById('addLayer').click());
  await page.waitForTimeout(80);
  await page.keyboard.press('l');
  await page.mouse.click(atom.x, atom.y);               // an atom, but it belongs to Layer 1
  await page.waitForTimeout(120);
  check('I a pick on another layer is refused, and says why', /Lattice tool picks on the active layer/.test(await msg()), await msg());
  check('I nothing was picked', !/Now click/.test(await panel()), await panel());
  // a pick, then a layer change, must not leave half of a cross-layer pair behind
  await page.click('#layerList .layer:nth-child(1) .dot');
  await page.waitForTimeout(80);
  await page.keyboard.press('l');
  await page.mouse.click(atom.x, atom.y);
  await page.waitForTimeout(120);
  check('I on the active layer the pick is taken', /Now click/.test(await panel()), await panel());
  await page.click('#layerList .layer:nth-child(2) .dot');
  await page.waitForTimeout(120);
  check('I changing the active layer drops the half-finished pick', !/Now click/.test(await panel()), await panel());

  console.log('--- J  the Arrow tool reshapes and selects without a trip to Select');
  await page.evaluate(()=>{ document.getElementById('clearBtn').click(); });
  await page.waitForTimeout(80);
  const nGraphics = () => page.evaluate(()=>document.querySelectorAll('#layersG path').length);
  const selCount = () => page.evaluate(()=>document.getElementById('selCount').textContent);
  const selShown = () => page.evaluate(()=>document.getElementById('selSec').style.display!=='none');
  await page.keyboard.press('g');
  await page.mouse.move(cx-160, cy);                    // draw one straight arrow
  await page.mouse.down(); await page.mouse.move(cx+40, cy); await page.mouse.up();
  await page.waitForTimeout(120);
  const drew = await nGraphics();
  check('J one arrow was drawn', drew>0, drew);
  const dBefore = await page.evaluate(()=>document.querySelector('#layersG path').getAttribute('d'));
  // its far endpoint is a handle: press there and drag, and it must reshape rather than draw
  await page.mouse.move(cx+40, cy);
  await page.waitForTimeout(80);
  check('J hovering the endpoint rings it as grabbable', await page.evaluate(()=>/r="0.2"/.test(document.getElementById('hoverG').innerHTML)), await page.evaluate(()=>document.getElementById('hoverG').innerHTML.slice(0,80)));
  await page.mouse.down(); await page.mouse.move(cx+40, cy-90); await page.mouse.up();
  await page.waitForTimeout(120);
  check('J dragging the handle drew no second arrow', await nGraphics()===drew, `${await nGraphics()} vs ${drew}`);
  // Compared against the path as drawn, not against a fixed coordinate: the earlier form of this check
  // assumed the arrow was not drawn on y = 0, which depended on the status bar's height at the time.
  check('J and the arrow now points somewhere else', await page.evaluate(d0=>document.querySelector('#layersG path').getAttribute('d')!==d0, dBefore), 'unchanged');
  // a click on the shaft selects it, without a trip to the Select tool
  await page.evaluate(()=>{ document.getElementById('canvas').dispatchEvent(new Event('x')); });
  await page.mouse.click(cx-60, cy-45);
  await page.waitForTimeout(120);
  check('J clicking the shaft selects the arrow', await selShown() && /1 other/.test(await selCount()), await selCount());
  check('J and drew nothing', await nGraphics()===drew, `${await nGraphics()} vs ${drew}`);
  check('J with the Arrow tool still active', await page.evaluate(()=>!!document.querySelector('#tools [data-tool="arrow"].on')), 'the tool changed');
  // a drag that starts on the arrow still draws, so nothing that worked stops working
  await page.mouse.move(cx-60, cy-45);
  await page.mouse.down(); await page.mouse.move(cx-60, cy+90); await page.mouse.up();
  await page.waitForTimeout(120);
  check('J a drag starting on it draws a second arrow', await nGraphics()>drew, `${await nGraphics()} vs ${drew}`);

  console.log('--- K  colouring from the Select tool, bonds included');
  await page.evaluate(()=>{ document.getElementById('clearBtn').click(); });
  await page.waitForTimeout(80);
  await setFree(false);
  await page.keyboard.press('r');
  await page.mouse.click(cx, cy);                        // a ring
  await page.waitForTimeout(100);
  const menu = () => page.evaluate(()=>document.getElementById('ctxMenu').innerHTML);
  const menuShown = () => page.evaluate(()=>getComputedStyle(document.getElementById('ctxMenu')).display!=='none');
  const popTitle2 = () => page.evaluate(()=>document.getElementById('cpopTitle').textContent);
  const bondStrokes = () => page.evaluate(()=>[...document.querySelectorAll('#layersG line')].map(l=>l.getAttribute('stroke')));
  await page.keyboard.press('v');
  await page.keyboard.down('Shift'); await page.keyboard.press('KeyA'); await page.keyboard.up('Shift');
  await page.waitForTimeout(100);
  await page.mouse.click(cx, cy, {button:'right'});
  await page.waitForTimeout(120);
  check('K right-clicking a selection opens a menu with Colour…', await menuShown() && /data-act="color"/.test(await menu()), (await menu()).slice(0,100));
  await page.click('#ctxMenu [data-act="color"]');
  await page.waitForTimeout(120);
  check('K which opens the panel on the selection', /^Selection colour/.test(await popTitle2()), await popTitle2());
  await page.click('#swatches button[data-hex="#cc1236"]');
  await page.waitForTimeout(120);
  check('K and a swatch paints the whole ring, bonds included', (await bondStrokes()).every(c=>c==='#cc1236'), (await bondStrokes()).join(' '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  // a bond is not selectable, but the Select tool can still reach its own menu
  await page.keyboard.down('Control'); await page.keyboard.press('z'); await page.keyboard.up('Control');
  await page.waitForTimeout(100);
  await page.keyboard.press('v');
  await page.keyboard.press('Escape');                   // drop the selection so the bond is reachable
  await page.waitForTimeout(80);
  const bondPt = await page.evaluate(()=>{ const l=document.querySelector('#layersG line'); const r=l.getBoundingClientRect();
    return {x:r.left+r.width/2, y:r.top+r.height/2}; });
  await page.mouse.move(bondPt.x, bondPt.y);
  await page.waitForTimeout(80);
  check('K hovering a bond with Select marks it as targetable', await page.evaluate(()=>/stroke-width="0.3"/.test(document.getElementById('hoverG').innerHTML)), await page.evaluate(()=>document.getElementById('hoverG').innerHTML.slice(0,80)));
  await page.mouse.click(bondPt.x, bondPt.y, {button:'right'});
  await page.waitForTimeout(120);
  check('K right-clicking it opens the per-bond menu, not the selection one', /data-act="b:color"/.test(await menu()) && !/data-act="dup"/.test(await menu()), (await menu()).slice(0,120));
  await page.click('#ctxMenu [data-act="b:color"]');
  await page.waitForTimeout(120);
  check('K whose Colour… opens the panel on that one bond', (await popTitle2()).startsWith('Bond colour'), await popTitle2());
  await page.click('#swatches button[data-hex="#489b6e"]');
  await page.waitForTimeout(120);
  const strokes = await bondStrokes();
  check('K painting exactly one bond', strokes.filter(c=>c==='#489b6e').length===1, strokes.join(' '));
  check('K and leaving the rest on the layer ink', strokes.filter(c=>c==='#000000').length===strokes.length-1, strokes.join(' '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);

  // ---- L  the split Arrow control ---------------------------------------
  console.log('--- L  split Arrow control and the 1-8 kind keys');
  const menuOpen = () => page.evaluate(()=>getComputedStyle(document.getElementById('kindMenu')).display!=='none');
  const toolOn = t => page.evaluate(id=>!!document.querySelector(`#tools [data-tool="${id}"].on`), t);

  await page.keyboard.press('v');
  await page.waitForTimeout(60);
  check('L the Arrow tool starts inactive', !(await toolOn('arrow')), 'active');
  await page.click('#tools [data-kindmenu]');
  await page.waitForTimeout(80);
  check('L pressing the ▾ half opens the kind list', await menuOpen(), 'closed');
  check('L ... and activates the Arrow tool', await toolOn('arrow'), 'inactive');

  await page.click('#kindMenu button[data-gk="reson"]');
  await page.waitForTimeout(80);
  check('L choosing a kind closes the list', !(await menuOpen()), 'still open');
  check('L ... and the button says what it draws', (await label('arrow'))==='Arrow ↔', await label('arrow'));

  // the point of drawing the list ourselves: the keyboard is still ours straight afterwards
  await page.keyboard.press('7');
  await page.waitForTimeout(80);
  check('L a digit right after using the list still reaches the app', (await label('arrow'))==='Bracket [ ]', await label('arrow'));

  await page.keyboard.press('2');
  await page.waitForTimeout(60);
  check('L 2 picks the equilibrium arrow', (await label('arrow'))==='Arrow ⇌', await label('arrow'));
  await page.keyboard.press('9');
  await page.waitForTimeout(60);
  check('L 9 is not a kind and changes nothing', (await label('arrow'))==='Arrow ⇌', await label('arrow'));

  // digits must still mean bond order everywhere else
  await page.keyboard.press('d');
  await page.keyboard.press('3');
  await page.waitForTimeout(80);
  check('L 3 is still a triple bond on the Bond tool', (await label('bond'))==='Bond 3', await label('bond'));
  await page.keyboard.press('g');
  await page.waitForTimeout(60);
  check('L G still just puts the Arrow tool up', await toolOn('arrow') && (await label('arrow'))==='Arrow ⇌', await label('arrow'));

  // the ▾ half toggles, and Escape closes
  await page.click('#tools [data-kindmenu]');
  await page.waitForTimeout(80);
  check('L the ▾ half opens the list again', await menuOpen(), 'closed');
  await page.click('#tools [data-kindmenu]');
  await page.waitForTimeout(80);
  check('L pressing it again closes the list', !(await menuOpen()), 'still open');
  await page.click('#tools [data-kindmenu]');
  await page.waitForTimeout(80);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  check('L Escape closes the list', !(await menuOpen()), 'still open');
  // and it does not survive leaving the tool
  await page.click('#tools [data-kindmenu]');
  await page.waitForTimeout(80);
  await page.keyboard.press('r');
  await page.waitForTimeout(80);
  check('L leaving the Arrow tool closes the list', !(await menuOpen()), 'still open');
  check('L no <select> is left in the ribbon', await page.evaluate(()=>!document.querySelector('#tools select')), 'a select remains');

  // ---- M  the auto-bond switch in the topbar -----------------------------
  console.log('--- M  the auto-bond switch');
  const abBox  = () => page.evaluate(()=>{ const b=document.getElementById('autoBondBox');
    return {checked:b.checked, disabled:b.disabled, dimmed:document.getElementById('abWrap').classList.contains('dimmed')}; });
  const rowBox = () => page.evaluate(()=>{ const b=document.querySelector('#layerList input[data-f="autoBond"]');
    return {checked:b.checked, disabled:b.disabled}; });

  check('M the switch starts on', JSON.stringify(await abBox())==='{"checked":true,"disabled":false,"dimmed":false}', await abBox());
  await page.click('#autoBondBox');
  await page.waitForTimeout(80);
  check('M clicking it turns auto-bond off', (await abBox()).checked===false, await abBox());
  check('M ... and the layer row agrees', (await rowBox()).checked===false, await rowBox());
  // it costs exactly one undo step, and the focus does not swallow Ctrl+Z
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(80);
  check('M Ctrl+Z undoes it straight away', (await abBox()).checked===true, await abBox());

  await setFree(true);
  await page.waitForTimeout(80);
  check('M a free layer greys the switch out', (await abBox()).disabled===true && (await abBox()).dimmed===true, await abBox());
  check('M ... and the layer row box too', (await rowBox()).disabled===true, await rowBox());
  await setFree(false);
  await page.waitForTimeout(80);
  check('M leaving the free layer gives it back', (await abBox()).disabled===false && (await abBox()).checked===true, await abBox());

  // ---- N  help text fits, the Keys tab, Fill rings --------------------------
  console.log('--- N  the status bar keeps its height, the Keys tab, Fill rings');
  const statusH = () => page.evaluate(()=>document.querySelector('.status').getBoundingClientRect().height);
  const narrow = await browser.newPage({viewport:{width:1000,height:700}});
  narrow.on('dialog', d=>d.accept());
  await narrow.goto(PAGE); await narrow.waitForTimeout(3300);          // let the welcome message expire
  const hN = async()=>narrow.evaluate(()=>document.querySelector('.status').getBoundingClientRect().height);
  const keysAll='radcsf.qhtglvep'.split('');
  let heights=[];
  for(const k of keysAll){ await narrow.keyboard.press(k); await narrow.waitForTimeout(30); heights.push(await hN()); }
  check('N at 1000 px every honeycomb hint is one line', new Set(heights).size===1, heights.join(','));
  await narrow.evaluate(()=>{ const cb=document.querySelector('#layerList input[data-f="free"]'); cb.checked=true; cb.dispatchEvent(new Event('change',{bubbles:true})); });
  await narrow.waitForTimeout(3300);
  heights=[];
  for(const k of keysAll){ await narrow.keyboard.press(k); await narrow.waitForTimeout(30); heights.push(await hN()); }
  check('N ... and every free-layer hint too', new Set(heights).size===1, heights.join(','));
  await narrow.close();

  await page.evaluate(()=>document.getElementById('gearBtn').click());
  await page.waitForTimeout(80);
  await page.click('.tabs [data-tab="keys"]');
  await page.waitForTimeout(80);
  check('N the Keys tab shows the lasso', await page.evaluate(()=>{ const p=document.querySelector('[data-panel="keys"]'); return p.style.display!=='none' && /Alt\+drag/.test(p.textContent); }), 'not shown');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);

  // Fill rings from the right-click menu: three rings, everything selected, one action
  await page.evaluate(()=>{ document.getElementById('clearBtn').click(); });
  await page.waitForTimeout(80);
  await page.keyboard.press('r');
  await page.mouse.click(cx, cy); await page.waitForTimeout(60);
  await page.mouse.click(cx+70, cy); await page.waitForTimeout(60);
  await page.mouse.click(cx-70, cy); await page.waitForTimeout(60);
  await page.keyboard.press('v');
  await page.keyboard.press('Shift+a');
  await page.waitForTimeout(80);
  await page.mouse.click(cx, cy, {button:'right'});
  await page.waitForTimeout(80);
  check('N the selection menu offers Fill rings', await page.evaluate(()=>!!document.querySelector('#ctxMenu [data-act="fillrings"]')), 'absent');
  await page.click('#ctxMenu [data-act="fillrings"]');
  await page.waitForTimeout(120);
  const nFills = await page.evaluate(()=>document.querySelectorAll('#layersG polygon').length);   // fills are the only polygons here: no arrows, no Clar
  check('N ... and one click fills every ring', nFills===3, nFills);

  check('H8 no page errors throughout', errors.length===0, errors);
  await browser.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
})();
