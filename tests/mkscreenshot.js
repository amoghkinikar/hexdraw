// Renders docs/screenshot.png: the app with examples/agnr7-cell.json open. Run from tests/ after
// mkexamples.js; needs Playwright with chromium. Re-run after any visual change so the picture stays true.
const {chromium}=require('playwright'); const path=require('path');
const PAGE='file://'+path.resolve(__dirname,'..','hexdraw.html');
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:1360,height:760}, deviceScaleFactor:2});
  await p.goto(PAGE); await p.waitForTimeout(200);
  await p.setInputFiles('#fileIn', path.resolve(__dirname,'..','examples','agnr7-cell.json'));
  await p.waitForTimeout(300);
  await p.evaluate(()=>document.getElementById('fitBtn').click());
  await p.keyboard.press('r'); await p.mouse.move(1300,700);
  await p.waitForTimeout(3300);                                    // let "Project opened." expire so the hint shows
  await p.screenshot({path:path.resolve(__dirname,'..','docs','screenshot.png')});
  await b.close(); console.log('docs/screenshot.png written');
})();
