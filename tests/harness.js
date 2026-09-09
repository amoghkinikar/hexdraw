// Stub document/window harness for HexDraw, per the handover manual.
const raw=require('fs').readFileSync('check.js','utf8');
const mk=()=>({tagName:'DIV',innerHTML:'',value:'15',checked:true,textContent:'',style:{},open:false,
  classList:{toggle(){},add(){},remove(){}},dataset:{},addEventListener(){},setAttribute(){},
  getBoundingClientRect(){return{left:0,top:0,width:800,height:600}},setPointerCapture(){},select(){},closest(){return null},files:[]});
const els={}; const sb={document:{getElementById:id=>els[id]||(els[id]=mk()),querySelectorAll:()=>[],querySelector:()=>mk(),createElement:()=>mk(),addEventListener(){}},
  window:{addEventListener(){},innerWidth:1000,innerHeight:800},navigator:{},confirm:()=>true,prompt:()=>'',
  localStorage:{getItem:()=>null,setItem(){}},FileReader:function(){},Image:function(){},ClipboardItem:function(){}};
for(const k of Object.keys(sb)) Object.defineProperty(globalThis,k,{value:sb[k],writable:true,configurable:true});
const EXPORTS = `globalThis.T={
  state:()=>state, freshState, loadState:s=>{state=s;},
  settings:()=>settings, setSetting:(k,v)=>{settings[k]=v;},
  setTool, setRingMode:m=>{ringMode=m;}, setGraphicKind, placeGraphic, newGraphic,
  addRing, kekulize, bondMap, bondKey, atomById, activeLayer, layerPrimitives, graphicPrimitives,
  exportSVG, emfBuild, exportStructure, exportXYZ, formulaOf, produceInner,
  sel:()=>sel, clearSel, selectAllActive, selBox, deleteSel,
  startFloat, floTranslate, floRotate, floMirror, commitFloat, cancelFloat, flo:()=>flo,
  pushUndo, undo, redo, undoDepth:()=>undoStack.length,
  snapAngle, snapLatticeVector, snapMove, findGraphic, findGraphicHandle,
  isFree, setRingSides:n=>{ringSides=n;}, ringSides:()=>ringSides, cycleRingSides, setRingSidesTo, activeFree,
  addRingFree, placeAtomFree, bondOutFree, placeAtom, bondAt, fillRing, connectAt,
  startFloatFragment, ringBonds, ngonOnVertex, ngonOnEdge, outwardSide, magnetPV, floPivot, floRotate, fuseNgonOnBond, floatNgon,
  flo:()=>flo, setRingMode2:m=>{ringMode=m;},
  adjacency, ringOfBond, ringsOf, ringAtPoint, freeSide, componentsOf, nbWindow, radN, cycleRadical,
  armTemplate, disarm, armed:()=>armed, templateFragAt, startTemplatePlacement, aimFloat, floAnchorWorld, floRefWorld,
  outermostAtom, resetTools, ringMode:()=>ringMode, bondMode:()=>bondMode, graphicKind:()=>graphicKind,
  macrocycleFragment, renderTemplatePanel, freeWarn:()=>freeWarn, TEMPLATES, exportMOL, findBond, findAtom, ringVertsLocal, polyCentroid, circumR, apothem,
  backfill, setBondMode:m=>{bondMode=m;}, autoH, hCount, freeAtomTarget,
  awayPoint, aimPoint, growFree, linkFree, growStart, growCommit, FREE_REACH, setToolRaw:t=>{tool=t;},
  floDragPV, floSingleSwing, floatSVG, awayDir, setElement:(el,h)=>{element=el; lastH=(h===undefined?null:h);},
  applySettings, applyPreset, PRESETS, renderPresetPanel, graphicAction, setCtxGraphic:g=>{ctxGraphic=g;}, showCtx,
  bondModeKey, curBond:()=>curBond, setCurBond:b=>{curBond=b;}, elementLabel, bondOrder, setBondStyle,
  buildGuides, bondAction, setCtxBond:b=>{ctxBond=b;}, buildMOL, bondOut,
  element:()=>element, lastH:()=>lastH,
  resetTool, SETTING_BOOLS, sanitizeSettings, DEFAULTS, renderSettingsPanel,
  bearing, wrap180, angleText, floAngle, swingAngle, turnInfo, turnSVG, angleSVG, updateTurnStatus,
  setDrag:d=>{drag=d;}, drag:()=>drag, setMouseWorld:p=>{mouseWorld=p;}, updateHover,
  fillColor:()=>fillColor, setFillColor:c=>{fillColor=c;}, FILL_DEFAULT, fillLabel, renderTools,
  selColorTargets, selAction,
  cpop:()=>cpop, openColorPop, hideColorPop, applyPopColor, popDefault, cpopColor, cpopValid, cpopHeading,
  graphicStart, graphicCommit, handleSVG, sel2:()=>sel,
  latticePick, picks:()=>picks, setPicks:ids=>{picks=ids;}, assignVector, checkCell, atomWorld,
  cellGate, cellFault, cellOverride:()=>cellOverride, setCellOverride:v=>{cellOverride=v;}, findAtomAnyLayer,
  setActive:id=>{state.active=id;}, updateStatus, snapSite, ringVertices, toCanon, fromCanon,
  customColors:()=>customColors, setCustomColors:v=>{customColors=v;},
  GKINDS, arrowLabel, setGraphicKindTo, kindMenuHTML, openKindMenu, hideKindMenu, kindOpen:()=>kindOpen,
  syncAutoBond, autoBondFn:autoBond, renderLayerPanel, render, getOrCreateAtom, addBond,
  TOOLS, HINTS, hintFor, KEYS, BOND_MODES, fillSelectedRings, renderKeysPanel, renderSelPanel, ringsOf, ui:()=>ui,
  rotateAll, labelArrow, textRuns, strWidth, runWidth,
  A, A1, A2
};
})();`;
(0,eval)(raw.replace(/\}\)\(\);\s*$/, EXPORTS));
module.exports = globalThis.T;
