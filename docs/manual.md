# HexDraw manual

The complete reference for [HexDraw](../README.md): every tool, panel, key and export, with worked examples and the project-file format. If you are new, the README's *Getting started* is the five-minute version; this is the rest.

## Contents

- [The interface](#the-interface)
  - [Tools](#tools)
  - [Benzene rings](#benzene-rings)
  - [Individual bonds](#individual-bonds)
  - [Reaction arrows and scheme graphics](#reaction-arrows-and-scheme-graphics)
  - [Free layers: non-hexagonal molecules](#free-layers-non-hexagonal-molecules)
  - [Templates](#templates)
  - [Moving and duplicating: pick up, transform, place](#moving-and-duplicating-pick-up-transform-place)
  - [Layers](#layers)
  - [Settings](#settings)
  - [Colours](#colours)
  - [Periodic structures](#periodic-structures)
    - [When the vectors are not a repeat](#when-the-vectors-are-not-a-repeat)
  - [Export](#export)
    - [Into PowerPoint and Word](#into-powerpoint-and-word)
    - [Into Illustrator](#into-illustrator)
  - [How hydrogens are counted](#how-hydrogens-are-counted)
- [Examples](#examples)
  - [1. [3]Triangulene](#1-3triangulene)
  - [2. A 7-AGNR unit cell](#2-a-7-agnr-unit-cell)
  - [3. AB-stacked bilayer coronene](#3-ab-stacked-bilayer-coronene)
  - [4. A 2D lattice: graphene with a nitrogen dopant](#4-a-2d-lattice-graphene-with-a-nitrogen-dopant)
  - [5. A metal phthalocyanine on a free layer](#5-a-metal-phthalocyanine-on-a-free-layer)
  - [6. A reaction scheme](#6-a-reaction-scheme)
- [File formats and project files](#file-formats-and-project-files)
- [Limitations](#limitations)

## The interface

```
┌─ toolbar: tools · element palette · Rotate 30° · Undo · Redo · Fit ─────────────┐
│                                                        │ Layers                  │
│                                                        │   z, x, y per layer     │
│                     canvas                             │ Lattice                 │
│           (honeycomb snapping, hover preview)          │   a₁, a₂ definition     │
│                                                        │ Export                  │
│                                                        │   SVG / XYZ / POSCAR /  │
│                                                        │   MOL, preview, copy    │
├─ status: tool hint · live chemical formula · cursor position (Å) ──────────────┤
```

### Tools

| Tool | Key | What it does |
|---|---|---|
| Ring | `R` | Click to place a ring. On a honeycomb layer it snaps to the lattice and fuses onto adjacent rings, sharing atoms and bonds. On a free layer it draws 3- to 8-membered rings: press `3` to `8` to set the number of sides outright, or `N` to cycle through them; the count is shown in the button label. The digits only mean this while the Ring tool is active on a free layer; everywhere else they keep their bond-style meaning. Press on an atom, or on empty canvas, and the ring is offered *floating*, carried by one vertex; keep the button down and drag to turn it about that vertex — the angle is shown beside the pivot while you drag — and release to place it. A click on a bond fuses a ring onto that edge straight away, outward. `K` switches between a plain ring (all single bonds), a benzene ring (alternating) and a Clar sextet, shown in the button label and in the hover preview. `0` puts the size back to 6 and the mode back to plain. |
| Atom | `A` | Double-click an atom to edit its label (a symbol like `N` or `Fe`, or `NH2` with its hydrogens pinned); right-click one to stamp it with the last label. Click an empty lattice site to place an atom — carbon, or the last element you typed with the Text tool, which is shown in the button (`Atom O`) and reset by `0`. The Bond tool never stamps that element; it always grows carbon. Bonds to neighbouring atoms are created automatically unless the layer's auto-bonding is off. On a free layer, a click near an atom grows a new one 1.42 Å away into the space its neighbours leave; drag instead to aim at 15° steps, with the angle shown as you drag, or drag onto another atom to bond the two. A click in open space places a free atom at 0.1 Å resolution. |
| Connect | `C` | Click one atom, then another, to bond them by hand at any distance. `Esc` clears the first pick. Nothing else is bonded as a side effect, which makes this the tool to use with **auto-bond** switched off. |
| Bond | `D` | Click an atom and a bond grows to the free lattice site nearest the cursor — or, on a free layer, into the space the atom's neighbours leave. Drag to aim it at 15° steps, or drag onto another atom to bond the two. Click an existing bond and it takes the current mode. `1` `2` `3` `4` `W` `H` choose single, double, triple, dashed, wedge and hash: they set the mode, shown in the button label, *and* restyle the bond you last clicked, which stays highlighted. `0` puts the mode back to single and forgets that bond. A double bond's second line sits on the ring side; a triple gets a line either side of the centre; wedge and hash have their narrow end at the atom nearer the click. Right-click a bond for bold and colour. |
| sp³ | `S` | Click a carbon to mark it sp³. It is shown with a dashed ring in the editor (not in exports) and fills with hydrogens as CH₂ / CH₃ instead of the sp² default. |
| Fill | `F` | Click a ring to fill it with the **fill colour**, shown as a chip inside the Fill button while the tool is active; click the button to choose that colour (see *Colours* below). Clicking a ring again with the same colour removes the fill, or with another colour changes it. On a free layer the ring under the cursor is found from the bond graph, so any ring shape can be filled. |
| Radical | `.` | Click an atom to cycle none → one unpaired electron (`•`) → a lone pair of two (`••`) → none. Each dot removes one hydrogen at export, so a lone pair on a carbon is a triplet carbene site; MOL writes `RAD 2` for one electron and `RAD 3` for two. |
| Charge | `Q` | Click an atom to cycle 0 → + → − → 0. |
| H count | `H` | Click an atom to force its hydrogen count: auto → 0 → 1 → 2 → 3 → auto. Use this where the automatic rule can't tell (pyrrolic vs pyridinic nitrogen, methyl groups, …). A count you set this way is always drawn, even with *Show implicit hydrogens* switched off. |
| Text | `T` | Click an atom to set its element: a symbol like `N` or `Fe`, or a symbol with hydrogens like `NH2` or `CH3`, which also pins the H count. An empty entry resets the atom to carbon. Elements outside the built-in valence table (metals, for instance) are accepted and get no automatic hydrogens, which is what a coordination centre needs. Click empty canvas instead to add a free text label, or an existing label to edit it (empty text deletes it). Digits are subscripted where a formula would put them — see below. |
| Arrow | `G` | Drag to draw a reaction arrow, an equilibrium, resonance or retrosynthetic arrow, a curly electron-pushing arrow, a bracket or a plus sign. The ribbon button is split: the left half turns the tool on and says what it is set to draw, the ▾ half opens the list of kinds — and opening that list turns the tool on too. With the tool active, keys `1`–`8` pick the same eight kinds, so `G` `5` is a curly arrow. `0` puts it back to a straight reaction arrow. The tool also edits what it draws, the way the Bond tool restyles a bond: drag one of an existing graphic's handles to reshape it, click a graphic to select it. A drag that *starts* on a graphic still draws a new one, and `Shift` ignores whatever is under the cursor if you want to draw right over it. Right-click one for bold, colour and a bracket label. See *Reaction arrows* below. |
| Lattice | `L` | Click an atom, then its translational image, and assign the vector to a₁ or a₂ (see *Periodic structures*). Both picks must be on the **active layer** — a vector between two layers is not a repeat of either, and a pick on another layer is refused with a note saying which layer it belongs to. Changing the active layer drops a half-finished pick. |
| Select | `V` | Drag a box to select atoms (with their fills, sextets, labels and arrows) in the active layer; hold `Alt` to draw a lasso, `Shift` to add to the selection, click an atom or an arrow to select just that one. Dragging the selection picks it up for placement (see below); dragging an arrow's handle reshapes it. Right-click for duplicate, rotate, mirror, **Colour…**, copy to layer and delete. Right-clicking a *bond* opens the per-bond menu instead — a bond is not a selectable object, since it has no position of its own, but it can still be styled and coloured from here. |
| Erase | `E` | Click an atom, bond, arrow, sextet or label to delete it. Drag a box to delete all atoms and arrows inside it. |
| Pan | `P` | Drag to move the view. Middle-mouse drag, right drag or holding `Space` also pans with any tool. Scroll to zoom. |

Which tools appear in the ribbon is up to you: the Interface tab of the Settings dialog has a checklist, and sp³, Charge, H count and Lattice start switched off. Hiding a tool only removes its button — its keyboard shortcut keeps working.

Other shortcuts: `K` switches the Ring tool between plain, benzene and Clar, `3`–`8` set the n-gon size directly and `N` cycles it (free layers, Ring tool), `1` `2` `3` `4` `W` `H` restyle the bond you last clicked with the Bond tool, `1`–`8` pick the arrow kind (Arrow tool), `Ctrl+Z` undo, `Ctrl+Y` / `Ctrl+Shift+Z` redo, `Esc` closes the colour panel, then clears the selection, a half-finished Connect pick, an armed template and the lattice picks, and closes the Settings dialog.

**`0` resets the tool you are holding**, and only that tool: the Ring tool back to a plain 6-ring, the Bond tool back to single (forgetting the bond you last clicked), the Atom tool back to carbon, the Arrow tool back to a straight arrow. On a tool that carries no settings of its own — Select, Erase, Connect, Fill and the rest — it says so in the status bar and changes nothing.

**`Shift+0` resets every tool at once**, whatever tool is active, and also disarms an armed template. Neither key touches the drawing, the settings or the current tool — only the modes those tools carry. `Esc` is the other half of the pair: it cancels what you are *doing* (a placement, a selection, a pick) and never touches a mode.

With a selection: `Ctrl+D` duplicates it, arrow keys pick it up and step it, `Delete` removes it.

### Benzene rings

With the Ring tool in benzene mode (`K`), a new ring gets alternating bond orders. When it is fused onto existing structure, both alternations are scored against what is already drawn and the better one is used. A double bond is only placed where it does not clash: a shared single bond is upgraded when that is consistent, but a bond stays single if the ring already has a double bond there, if either of its atoms already carries a double bond outside the ring — which would make a cumulated diene — or if the bond is drawn as a wedge or hash. So an isolated ring is a clean benzene, a ring fused to a benzene gives naphthalene with a correct Kekulé structure, and awkward geometries such as the middle of a phenalene degrade to single bonds rather than to nonsense.

### Individual bonds

Clicking a bond with the Bond tool applies the current mode to it and makes it the **current bond**, drawn with a pale highlight. The number and letter keys then act on that bond, so you can click once and try `2`, `4`, `W` in turn. The highlight is dropped when you change tool, press `Esc`, press `0`, or undo.

A **dashed** bond (`4`) is a partial, dative or non-covalent contact: it is drawn as a row of short segments — real segments, so PowerPoint's Ungroup gives you shapes rather than a dash pattern — and it consumes no valence. On a free layer, where hydrogens follow drawn bond orders, both its atoms keep the hydrogen the bond would otherwise have taken; on a honeycomb layer neighbours are counted by distance, so nothing changes. MOL has no partial bond type, so it exports as a plain single bond.

Right-clicking a bond with the Bond tool opens a menu for that bond alone: single, double or triple; plain line, dashed, filled wedge, open wedge or hash; **Bold**, which uses the bold line width from the Style tab; and **Colour…**, which opens the colour panel on that one bond (*Default* there removes the override and puts the bond back on its layer's ink). These overrides ride along when the bond is moved, duplicated or copied to another layer, and they survive in SVG and EMF — the EMF writer groups strokes by colour and width, so a bold red bond arrives in PowerPoint as a bold red bond.

### Reaction arrows and scheme graphics

The Arrow tool (`G`) draws the non-chemical furniture of a reaction scheme. Its ribbon button is a split control: the left half turns the tool on and shows the current kind, the ▾ half opens the list below. Choosing from the list also turns the tool on, and with the tool active the number keys pick a kind directly:

| Key | Kind | Drawn as |
|---|---|---|
| `1` | Reaction arrow → | one line, one filled head at the far end |
| `2` | Equilibrium ⇌ | two parallel lines running in opposite directions, each with a half head on its outer side |
| `3` | Resonance ↔ | one line with a filled head at each end |
| `4` | Retrosynthetic ⇒ | two parallel lines with an open chevron at the far end |
| `5` | Curly arrow (2 e⁻) | a quadratic Bézier with a filled head — a two-electron push |
| `6` | Fishhook (1 e⁻) | the same curve with a half head — a single-electron push |
| `7` | Brackets [ ] | a square bracket pair, with an optional superscript label such as a charge |
| `8` | Plus + | a plus sign at the size set in the Style tab |

**Drawing.** Drag on the canvas. The direction snaps to multiples of 15° and the length to 0.1 Å — never to the honeycomb, so an arrow can sit anywhere on the page. A plus sign takes a single click. A curly arrow starts as an arc, its control point offset from the midpoint, which you then adjust.

**Reshaping.** Every point of a graphic is a small handle: the two ends of an arrow, the control point of a curly arrow, the two opposite corners of a bracket. Hover a graphic to see them — the one you can actually grab is ringed — and drag it to move that point alone. An arrow's ends keep the 15° snap while you drag them; control points and bracket corners move freely in 0.1 Å steps.

This works with the **Arrow tool as well as the Select tool**, so fixing the curvature of an arrow you have just drawn does not cost a trip to another tool. With the Arrow tool, a click on a graphic selects it (which is how you reach *Label above…* on an older arrow), a drag that starts on one still draws a new graphic from that point, and holding `Shift` ignores whatever is under the cursor — the way to start a graphic exactly on an existing handle, or drop a plus sign on top of an arrow.

**Selection and transforms.** Arrows join a box or lasso selection when the whole graphic falls inside it, and they move, duplicate, rotate, mirror, copy to another layer and delete with everything else. A curly arrow's control point rotates and mirrors along with its ends, so a rotated arrow keeps its shape. Dragging a selection that contains atoms snaps to lattice translations as it always did; a selection made only of arrows moves in 0.1 Å steps instead, and the arrow keys step it by 0.5 Å rather than by a lattice vector. Rotation and mirroring pivot on the nearest ring centre when atoms are involved and on the fragment's own centroid when they are not.

**Colour and width.** Both follow the layer's ink unless you override them. Equilibrium and retrosynthetic arrows also carry a line spacing — `arrowGap` and `retroGap` in the Style tab, the retrosynthetic one wider by default — and either can be overridden on a single arrow with **Wider** and **Narrower** in its right-click menu, which stay open so you can nudge repeatedly; **Reset width** puts it back on the style number. The chevron of a retrosynthetic arrow always spans its two lines. Right-click a graphic with the Arrow tool for **Bold**, **Colour…** and, for a bracket, **Add label…** — the label is drawn as a superscript at the top right of the closing bracket, so `2−` gives the usual bracketed-dianion notation. The same menu deletes the graphic.

**Subscripts.** Every label — an atom's, and a free text label — subscripts a run of digits when it directly follows a letter or a closing bracket, and leaves it full size otherwise. So `NH2`, `H2SO4`, `Ca(OH)2`, `C60` and a conditions label like `H2, Pd/C` come out as chemistry, while `80 °C`, `12 h`, `72%`, `7-AGNR`, `18-crown-6` and a compound number keep their digits at full size. Nothing has to be marked up: type the formula as you would say it. Superscripts are not written this way — a charge on a bracket is its own label, placed above the bracket, and an atom's charge is set with the Charge tool.

**Text on arrows.** Reagents and conditions are ordinary text objects, so they can be moved and edited independently. As a shortcut, select exactly one straight arrow and the Selection panel (and the right-click menu) offer **Label above…** and **Label below…**, which place a text object centred on the arrow and offset perpendicular to it.

**Arrows are not chemistry.** They are ignored completely by XYZ, POSCAR and MOL — a scheme full of arrows exports exactly the atoms it contains, and the status-bar formula never counts them. They appear in SVG, EMF and PNG, and they do enlarge the exported picture's bounding box. Arrows are free-floating in this version: they do not anchor to atoms, so moving a molecule does not drag its curly arrows along unless you select both.

### Free layers: non-hexagonal molecules

Tick **free** on a layer and the honeycomb goes away. Nothing snaps to the lattice, nothing is auto-bonded, and the tools get free-form counterparts. This is what phthalocyanines, porphyrins, azulenes, fullerene fragments and anything else with five- or seven-membered rings need — no atom of a phthalocyanine lies on the hexagonal grid.

The data model already stores absolute Å coordinates, so exports need no special case: the XYZ of a free layer is exactly the drawn geometry — planar, 1.42 Å bonds — which is a starting guess to relax in DFT, not a relaxed structure.

**Drawing rings.** The Ring tool draws 3- to 8-membered rings; `3` to `8` set the size outright, `N` cycles through them, and the count shows in the button. A ring is carried by one **vertex**, not by its centre, and where you press decides what happens:

- **On an atom** — the ring is planted with one vertex already on that atom and the rest swung into the space its neighbours leave. Keep the button down and drag to turn the ring about that vertex in 15° steps; release to place it and join the two atoms. `Esc` puts everything back.
- **On a bond** — the ring fuses onto that edge immediately, since two shared vertices leave nothing to turn. Outward is worked out, not guessed: away from the ring the bond already belongs to, or failing that away from its substituents, or failing that the side your cursor is on. If the outward side happens to be occupied and the other is clear, it flips and says so.
- **On empty canvas** — the ring is planted with its top vertex under the cursor, which is also what it turns about.

In Clar mode, clicking *inside* an existing ring toggles a circle there instead of drawing a new ring, and the circle is scaled to the ring it sits in. Benzene mode lays its Kekulé pattern after the ring is placed, so a ring fused onto existing structure gets a pattern that fits what is already drawn.

**The angle readout.** Whenever something is being turned by a drag — a ring, a template, a lone atom swinging on its neighbour, or a bond being aimed with the Atom or Bond tool — the angle appears beside the pivot on the canvas and in the status bar, as `105° (+45°)`: the absolute direction the fragment now points, in the usual chemical convention (0° along +x, counter-clockwise), and how far it has turned since you pressed. With the 15° snap on, both are whole degrees; hold `Shift` for a free angle and they gain a decimal place, which is how you tell at a glance that the snap is off. The readout is an editor overlay only — it never reaches SVG, EMF or PNG.

**The magnet.** While a fragment floats over a free layer, any of its atoms coming within 0.35 Å of an existing atom is pulled exactly onto it, and the overlap marker turns orange to say the two will merge. That is what makes joining a ring or a template to a molecule reliable without a lattice to snap to.

**Growing atoms and bonds: click or drag.** The Atom and Bond tools share one gesture on a free layer, and it has two halves.

- **Click** and the new atom goes 1.42 Å away *into the space the existing neighbours leave*. With two or more neighbours the direction is the negated sum of the unit vectors to them, so an atom with two neighbours grows along the bisector of the gap between them and an atom with three grows into whatever is left. With exactly one neighbour the **chain angle** decides (120° by default, in the Style tab), and the new bond leans away from the neighbour's own neighbour, so a chain grown by clicking repeatedly comes out zig-zag; set the chain angle to 180° for the straight chains earlier versions drew. Where the neighbours exactly cancel, the direction is perpendicular to the first of them; an atom with no neighbours at all grows along +x. This angle is **not** snapped to 15°: it is the geometry's own answer, and rounding it would push the new bond towards a neighbour. Click a ring atom and the substituent comes out radially, which is nearly always what you want.
- **Drag** and you aim it yourself: the direction from the atom to where you release, snapped to the nearest 15° and shown as you drag. Release the drag *on another atom* and the two are bonded instead — one continuous gesture where the Connect tool takes two clicks, which is the quick way to close a macrocycle.

The Bond tool uses the current bond mode for whichever it does, so `2` then a drag draws a double bond. The Atom tool reaches 2 Å for a source atom and the Bond tool only 0.45 Å, because the Bond tool also has to leave room for clicking a bond to restyle it. A click directly on an atom with the Atom tool does nothing, since double-click edits its label and right-click stamps the last one.

**Double bonds.** The honeycomb rule — count atoms on the two candidate hexagon centres — means nothing off the lattice, so a free layer finds the smallest ring through the bond by breadth-first search over the bond graph, capped at eight members, and puts the second line on that ring's side. A bond in no small ring falls back to the side carrying more heavy-atom substituents, which is what puts the C=N of a phthalocyanine bridge inside the macrocycle rather than outside it.

**Hydrogens are explicit.** This is the one thing most likely to surprise you. On a honeycomb layer, an atom with no drawn double bond is assumed sp² and loses one hydrogen. On a free layer that rule is off: hydrogens come from drawn bond orders alone. So you draw Kekulé structures, and

- a pyrrole drawn as a pentagon with two double bonds exports as C₄H₅N with no overrides — the nitrogen has two single bonds, so it gets its N–H automatically;
- the same pentagon with *no* double bonds exports as C₄H₉N, because every carbon then has two single bonds and two hydrogens. That is correct explicit valence, not a bug — draw the double bonds.

The geometric neighbour rule is unchanged: atoms a bond length apart count as neighbours whether or not a bond is drawn between them.

**Metal centres.** An element the valence table does not know — Fe, Ni, Cu, Zn — gets no hydrogens of its own, as before. It now also reaches further: where either atom of a pair is such an element, the neighbour distance window extends to 2.6 Å, because a metal–ligand bond is longer than a C–C bond. That is what lets a pyrrole nitrogen coordinated to an iron at 2.08 Å count the iron as a neighbour and correctly take no hydrogen. Honeycomb drawings are unaffected, since they contain no such elements.

**Selection.** Dragging a selection on a free layer snaps to 0.1 Å instead of to a lattice vector, the arrow keys step it by 0.5 Å, and rotation and mirroring pivot on the fragment's own centroid — unless it is anchored on an atom, in which case it turns about that atom. The float menu and the Selection panel add **15° ↻** and **15° ↺** alongside the 60° steps. Copying to another layer works in both directions and the copied atoms keep their coordinates exactly.

**Dragging one atom is a geometry edit.** Select a single atom on a free layer and drag it and its bonds stay: they are drawn dashed while it moves, they stretch rather than break, and they are still there when you place it. An atom with exactly one neighbour swings on the 1.42 Å circle around that neighbour in 15° steps, with the angle shown beside the neighbour, which is how you set a substituent's angle; hold Shift to move it freely instead. On a honeycomb layer a moved atom still loses any bond that is no longer a bond length, as it always did.

### Templates

The **Templates** panel in the sidebar holds ready-made molecules, grouped by category:

| Aromatics | Formula | What it is |
|---|---|---|
| Porphine | C₂₀H₁₄N₄ | The free-base porphyrin core: four pyrroles bridged by four methine carbons, two of them N–H |
| Phthalocyanine | C₃₂H₁₈N₈ | The free base: four isoindoles bridged by four aza nitrogens, two of them N–H |

Clicking one **arms** it — nothing is drawn yet, and the status bar says so. Then press on the canvas where the molecule should go, and it is planted *floating* under the cursor:

- **Press on empty canvas** and the press point is the molecule's centre. Its outermost atom is the reference that aims it, since the centre cannot aim at itself.
- **Press on an existing atom** and the molecule joins there: its own outermost atom is put exactly on the atom you pressed and becomes the pivot, and the molecule is turned to point away from that atom's neighbours.

Keep the button down and drag, and the molecule turns so its reference points at the cursor — in 15° steps, or at any angle with `Shift` held, with the angle shown beside the pivot either way. The pivot does not move while you turn. Release to place it. `Esc` cancels, and clicking the same template again disarms it. Rings behave the same way, so the two gestures are one gesture.

It goes on the active layer, and if that is a honeycomb layer the layer is switched to free for you — with a warning in the panel, because that switch changes how hydrogens are counted for anything already on the layer, from the sp² rule to explicit valence. Cancelling or undoing the placement reverts the switch along with the molecule.

Both templates are built from the same n-gon geometry the tools use — four regular pentagons around the centre, each benzo ring a regular hexagon fused on the outer edge, every bond exactly 1.42 Å — and both carry a full Kekulé structure, since a free layer counts hydrogens from drawn bond orders alone. Note that neither Kekulé structure is four-fold symmetric, and cannot be: counting valences leaves two units donating both their α-carbons to the bridges and two donating none. Relax the geometry before you trust it; regular polygons are an idealisation.

### Moving and duplicating: pick up, transform, place

Anything that moves a selection first **detaches** it from the drawing. While a fragment is floating it is drawn in blue over the canvas and the drawing underneath is untouched, so you can drag it across other atoms, rotate it, change your mind, and nothing is lost.

1. **Pick up** — drag the selection, press an arrow key, or choose Duplicate / Rotate / Mirror / Copy to layer. A duplicate leaves the original in place; a move lifts the original out, and its bonds to the rest of the drawing are set aside.
2. **Transform** — drag it (a fragment containing atoms snaps its displacement to the nearest Bravais vector i·a₁ + j·a₂, so it always lands on lattice sites; on a free layer, or for a fragment of arrows alone, it snaps to 0.1 Å and the magnet pulls it onto any atom it comes close to), step it with the arrow keys, or right-click for Rotate 60° ↻ / ↺ and Mirror ↔ / ↕. (A ring or template planted with a press turns instead by dragging while the button is held — see *Templates* above.) Rotation and mirroring are about the ring centre nearest the fragment's centroid, which are symmetries the honeycomb actually has — about the centroid itself when the fragment holds no atoms, and about the joined or anchor atom when there is one. Atoms that currently sit on top of an existing atom are marked in orange, and the side panel counts them. Bonds from the fragment to the rest of the drawing are drawn dashed while it moves, so you can see what is being stretched.
3. **Place** — click, press `Enter`, or use the Place button. `Esc` (or `Ctrl+Z`) cancels and puts everything back exactly as it was, and `Ctrl+Z` also undoes a placement after the fact.

Two selection actions do not move anything. **Colour…** recolours the whole selection (see *Colours* below). **Fill rings** — in the right-click menu and the Selection panel once three or more atoms are selected — fills every ring whose atoms are all selected with the current fill colour, in one undo step, and recolours rings that were already filled; it is the Fill tool's click applied to twenty rings at once. A ring with even one atom outside the selection is left alone, so a lasso around a region fills exactly the rings inside it.

On placing, overlapping atoms merge (a heteroatom, radical, sp³ flag or explicit H count wins over a plain carbon), duplicate bonds are dropped, and the fragment auto-bonds to its new lattice neighbours. Internal bonds keep their order and wedge/hash style, and a moved fragment's bonds to the rest of the drawing are restored if its atoms are still adjacent. Arrows are simply carried along — they never merge with anything. The whole placement is one undo step.

**Copy to layer** puts the clone in another layer at the same position, ready to place — the quickest way to build a bilayer: draw one sheet, select all, copy to Layer 2, place, then set Layer 2's y offset to 1.42 for AB stacking.

All of these actions are in the Selection section of the side panel and in the right-click menu.

**Rotate 30°** rotates the whole drawing (all layers) by 30°, which switches between zigzag-along-x and armchair-along-x. Do this before you start drawing, or at any point — the lattice snapping follows, and arrows rotate with it.

### Layers

Each layer is a separate plane — honeycomb by default, free-form if you tick **free**. Editing tools act on the **active layer** only (the one with the blue dot); other layers are drawn dimmed so you can align to them. Mixed drawings are normal: a graphene sheet on one layer and a phthalocyanine on another is exactly the intended use, and layers never bond to each other anyway.

- `z` — height of the layer in Å. The first layer is at z = 0; a new layer starts 3.35 Å above the previous one (graphite spacing).
- `x`, `y` — optional in-plane shift of the whole layer. For Bernal (AB) stacking, set `y = 1.42` on the upper layer.
- The checkbox hides a layer from the canvas *and* from all exports.
- The colour chip opens the colour panel on that layer's **ink** — the colour of its bonds, labels, radical dots, Clar circles and arrows. *Default* there puts it back to black. Ring fills are not ink and are not affected.
- **free** turns off honeycomb snapping and auto-bonding for that layer and switches the tools to their free-form behaviour: rings become regular 3- to 8-membered polygons placed where you press, nothing snaps, nothing is auto-bonded, and hydrogens follow the bond orders you draw rather than the sp² rule — so you draw Kekulé structures. See *Free layers* above. It can be toggled at any time; existing atoms are not moved, but their hydrogen counts may change, which is why switching it says so in the status bar.
- **bond** switches auto-bonding on or off for that layer — the same flag as the **auto-bond** checkbox in the top bar, which always shows the active layer. With it on (the default) a new atom bonds to every lattice neighbour it touches, which is what you want for graphene-like drawing. With it off, rings are still drawn as rings and the Bond tool still makes its one bond, but nothing else is connected for you and you draw the bonds yourself with the Connect tool. Placing a moved or duplicated fragment on such a layer keeps the fragment's own bonds and restores its old external bonds where atoms are still adjacent, but invents no new ones. On a free layer both boxes grey out, because nothing auto-bonds there in any case.

  The switch only ever governs atoms placed from that moment on. Turning it back on never wires up what is already drawn: two structures you deliberately left unfused — two anthracenes side by side, say — stay unfused. If you want a bond after the fact, draw it with the Connect tool.
- **Remove overlaps** deletes atoms that sit exactly on top of an atom in another layer (same x, y and z) — a heteroatom wins over a carbon, otherwise the atom in the lower layer is kept — and merges any atoms closer than 0.5 Å within one layer, re-pointing their bonds. It does not touch arrows.

Layers become named `<g>` groups in the exported SVG, so they arrive as separate groups in Illustrator. Arrows live in a layer like everything else, so a scheme can be kept on its own layer and hidden when you want the bare structure.

### Settings

The gear button at the right of the ribbon opens a dialog with two tabs. `Esc`, a click outside it, or *Done* closes it.

**Style** holds the drawing numbers: bond line width, bold line width, the gap left at labelled atoms, double-bond spacing and end inset, wedge width, the number of hash lines, radical dot size and offsets, Clar circle radius, label size, the arrow line width, arrowhead length, the line spacing of equilibrium and of retrosynthetic arrows, the plus-sign size, the chain angle, the SVG and EMF export scales, the PNG resolution in dpi, the C–H length used when hydrogens are added, the default vacuum, and the spacing of a new layer. Arrows have their own line width so a scheme can carry slightly heavier arrows than bonds without touching the structures; it defaults to the bond width. The **chain angle** (120° by default) is the angle a new bond makes when the atom it grows from has exactly one neighbour — set it to 180° for the straight chains earlier versions drew. Changes apply immediately to the canvas and to both exports, since all three are drawn from the same description.

Below the numbers is one checkbox, **Show implicit hydrogens on labels (NH, OH …)**, on by default. Switch it off and a labelled atom whose hydrogen count was worked out for you draws as `N`, `O` or `S` rather than `NH`, `OH` or `SH` — useful in a crowded figure, or where the convention of the journal is to leave heteroatom hydrogens implicit. A count you set yourself, with the H count tool or by typing `NH2` or `CH3` with the Text tool, is a deliberate choice and is always drawn. This is a drawing setting and nothing more: the hydrogen count is unchanged, the status-bar formula is unchanged, and XYZ, POSCAR and MOL still export every hydrogen.

**Presets.** The dropdown beside *Reset style to defaults* applies a journal's figure guidelines, converting each printed size against the 1.42 Å bond and setting the export scales so the printed size comes out right:

| Preset | Guidelines |
|---|---|
| Nature | 0.381 cm bonds, 0.021 cm lines, 0.055 cm bold, 18% bond spacing |
| ACS 1996 | 14.4 pt bonds, 0.6 pt lines, 2.0 pt bold, 18% spacing, 2.5 pt hash spacing, 10 pt Arial, 120° chains |

One caveat on ACS: its *margin width* is measured from the bond end to the edge of the atom label's glyph, while HexDraw's *gap at labelled atoms* is measured from the atom centre, so the preset sets the gap to the margin plus half the type size. That is close, not identical — nudge it if a particular figure needs it. Lengths in this tab are in Ångström, i.e. relative to the bond; the EMF scale is what fixes the physical size on paper. The bond length itself is not a setting: the drawing is the geometry, and the exporters depend on it.

**Keys** lists every shortcut — tools, modes, mouse gestures and editing keys — generated from the same tables the keyboard handler reads, so it is always current. Tools hidden from the ribbon are marked; their keys still work.

**Interface** holds the ribbon checklist — sp³, Charge, H count and Lattice start hidden, and hiding a tool only removes its button, never its shortcut — the PNG background, and how transparent colours are flattened for EMF, which has no alpha channel — blend against white (the default, right for a white slide), blend against black, or ignore the alpha and export the colour solid. SVG keeps real transparency whatever this is set to.

Both tabs persist in your browser under `hexdraw.settings` and `hexdraw.ui`. The style numbers are also written into project files, so a drawing carries its own style to whoever opens it. If your browser refuses local storage for a `file://` page the dialog says so and the app runs on the defaults.

**Style sheets.** *Save style sheet* writes a `.hexstyle.json` holding the style numbers, the ribbon checklist and your custom swatches — no drawing. *Load style sheet* applies one and makes it your new default. Opening a project applies that project's style; load a style sheet afterwards to override it.

### Colours

There are two independent kinds of colour in a drawing, and one panel that sets both.

**Ink** is the colour of everything drawn as line work on a layer: its bonds, atom labels, radical dots, Clar circles, text and arrows. It belongs to the layer, and a single bond or a single arrow can override it.

**Fill** is the colour the Fill tool paints inside rings. It is a property of the tool, not of a layer, and changing it never changes any ink.

The panel is the same in all cases — 60 swatches, a colour picker, an opacity slider, *Add to custom* and *Default* — and it opens next to whatever it is about to colour, with a heading saying which that is:

| To colour | Open the panel by | Heading | *Default* gives you |
|---|---|---|---|
| Ring fills | selecting the Fill tool (`F` or its button); the button then shows the colour as a chip. Clicking the button again closes the panel | *Fill colour* | the original pale blue |
| A layer's ink | clicking that layer's colour chip in the Layers panel | *Layer 1 ink* | black |
| One bond | right-clicking it with the Bond tool, or with the Select tool → **Colour…** | *Bond colour* | no override: back to the layer's ink |
| One arrow | right-clicking it with the Arrow tool → **Colour…** | *Arrow colour* | no override: back to the layer's ink |
| A selection | right-clicking it with the Select tool → **Colour…**, or the button in the Selection panel | *Selection colour — n objects* | no override on any of them; ring fills keep theirs |

**Individual objects.** An atom's label (and its radical dots and charge sign), a free text label, a Clar circle, a single bond and a single arrow can each override their layer's ink. Right-click a bond with the Bond tool or the Select tool, or an arrow with the Arrow tool, and choose **Colour…**; for anything else, select it and use **Colour…** in the selection menu or the Selection panel.

**A whole selection at once.** *Colour…* on a selection paints everything in it — atoms, free text, Clar circles, ring fills, arrows — and, because a bond belongs to a selection when both of its atoms do, the bonds *between* selected atoms as well. So selecting a ring and picking red gives you a red ring, not just red labels. *Default* there removes the overrides and puts everything back on the layer's ink; ring fills are left alone, because a fill has no ink to fall back to.

The panel closes on your first press on the canvas — which still applies the fill, so choosing a colour and using it is one press — or when you leave the Fill tool, or on `Esc`. A run of picks made in one opening is a single undo step, so trying four greens on a layer and settling on the third costs one `Ctrl+Z`, not four.

The 60 swatches are from Sanzo Wada's *A Dictionary of Colour Combinations* (1933), taken from an [MIT-licensed dataset](https://github.com/mattdesl/dictionary-of-colour-combinations); hovering one shows its name. *Add to custom* keeps the colour currently in the panel in a Custom row that persists in your browser and travels in style sheets; right-click a custom swatch to remove it. Colours are stored as `#rrggbb` or, when partly transparent, `#rrggbbaa`. Transparency applies to ring fills and to ink alike, and SVG carries it as `fill-opacity` / `stroke-opacity` so Illustrator reads it correctly. EMF cannot carry alpha and flattens it according to the Interface tab. Filled rings export as `<polygon>` elements behind the bonds, so they stay editable in Illustrator.

### Periodic structures

1. Open *Periodic cell* in the Export panel and press *Define cell*, or pick the Lattice tool directly, and click an atom.
2. Click the equivalent atom one repeat unit away. The status panel shows the vector and its length.
3. Click **Use as a₁**. For a 2D lattice, repeat for **a₂**.

The unit cell is drawn on the canvas. When a lattice is defined, XYZ and POSCAR exports contain **one unit cell**: all atoms are folded into the cell and duplicates are removed, so you can draw as many repeat units as you like for the picture. Hydrogens are added *after* folding, using periodic images to find neighbours, so the open ends of your drawn ribbon do not produce spurious H atoms. Finally the cell boundary is placed in the largest gap between atoms (hydrogens included) along each periodic direction, so no atom sits on the boundary and no C–H pair is split across it. Non-periodic directions are padded with the vacuum length from the Export panel.

Atoms are grouped into molecules first, by the same neighbour rule the hydrogen count uses, and a molecule that fits inside the cell is folded as one piece so it is never cut in half. Anything that spans a whole cell along a periodic direction — a sheet, a ribbon — is still folded atom by atom, exactly as before, which is what makes the fold-and-deduplicate step work at all. So a free-layer molecule sitting across a cell boundary comes out intact.

Layers are all folded into the same cell, so a bilayer ribbon needs only one set of lattice vectors.

#### When the vectors are not a repeat

Picking two atoms that are *nearly* but not exactly one repeat apart used to produce a silently wrong file, and it is easy to do: an error of a fifth of a bond length is invisible on screen. Folding a drawing into a cell it does not repeat under does not collapse the repeats you drew — each one lands a little further off than the last, nothing merges, and you get a cell holding every repeat at once, smeared over itself. Hydrogens then vanish too, because every atom looks massively over-coordinated to its own ghosts.

The app now checks, and it checks in two ways because neither alone is enough:

- **Against the lattice.** Every atom on a honeycomb layer sits exactly on a lattice site, so the vector between two of them is either an exact lattice translation or exactly one basis vector (1.42 Å) off — there is nothing in between. That makes the test exact, and it catches the wrong-sublattice mistake, which the other test cannot see because ghosts a bond length apart look like bonds.
- **By folding and looking.** Any pair of atoms landing closer than 0.5 Å in the folded cell is a repeat that failed to collapse. This needs no lattice, so it is what covers free layers, and it also catches a vector that repeats one layer but not another.

You find out at three points, earliest first. The moment you press *Use as a₁*, the status bar says what is wrong; if both picks were on a honeycomb layer it also offers the nearest lattice vector, which is almost always the one you meant — accepting it is part of the same undo step. From then on the status bar shows the fault in place of the formula, rather than a large number nobody should read. And an XYZ or POSCAR export stops and asks.

Note that a wrong-sublattice pick has three lattice vectors exactly 1.42 Å away, so which one the snap offers is arbitrary. The dialog shows it — decline and re-pick if it is not the one you wanted.

**Exporting the cell contents instead.** If you say yes at the export prompt, HexDraw exports the atoms that fall **inside** the parallelogram drawn on the canvas and discards the rest, rather than folding everything on top of them. The box is anchored on the first atom you picked, atoms are kept exactly where they are (no wrapping — wrapping an atom to the far side of a cell that is not a real period moves it away from its own neighbours), and a molecule small enough to fit in the cell is kept or dropped whole rather than sliced.

Be clear about what that gives you: no duplicates, but the repeat vector is still wrong, so bonds across the cell boundary come out wrong by that same error, and hydrogens near the seam are unreliable for the same reason. It is a starting geometry to relax, not a unit cell. Fixing the vectors is always better; this is for the cases where you meant a strained or incommensurate cell, or where there is no lattice to snap to.

### Export

| Format | Contents |
|---|---|
| SVG | Vector drawing. Element labels are `<text>`, ring fills are `<polygon>`, arrows are `<path>` with their heads as plain filled `<polygon>` shapes rather than SVG markers, one `<g>` per layer in that layer's ink colour. Drawn at 28 px per Å by default; change the scale and the line width in the Settings panel. |
| PNG | Bitmap at the resolution set in the Style tab, 300 dpi by default, sized from the EMF scale so a 300 dpi PNG matches the printed size of the EMF. Background is white or transparent (Interface tab). |
| EMF | Windows Enhanced Metafile for PowerPoint and Word. Vector lines and Bézier curves, filled wedges, arrowheads and ring fills, and real text records. Drawn at 3 mm per Å by default, set in the Settings panel. |
| XYZ | Cartesian coordinates. With a lattice defined it is *extended XYZ* with `Lattice="…"` and `pbc="…"`, readable by ASE (`ase.io.read`) and everything built on it. |
| POSCAR | VASP format, Cartesian coordinates. Without a lattice the molecule is centred in a box padded by the vacuum length. |
| MOL V2000 | Full drawing (never reduced to a unit cell) with bond orders, `M CHG` and `M RAD` records. |

**Add hydrogens** fills each atom's valence with explicit H atoms at 1.09 Å. **Vacuum** is the padding, in Å, added to every non-periodic direction (including z).

The second dropdown chooses what to export: everything visible, or the current selection only. A selection export ignores the lattice, since a fragment of a periodic drawing is not a unit cell. Chemical formats take atoms and bonds only — ring fills, Clar circles, text labels and reaction arrows are never written to XYZ, POSCAR or MOL.

**Ctrl+C** copies the drawing as an image, ready to paste into PowerPoint, Word, Slack or anywhere else; if something is selected it copies just that. The clipboard also carries the SVG source as text, which recent Illustrator versions will paste as vectors. If your browser refuses to put images on the clipboard, the PNG is downloaded instead and the status bar says so.

**Periodic cell** is a collapsed block at the foot of the Export panel — it opens by itself once a cell is defined. *Define cell* switches to the Lattice tool, which is off the ribbon by default; turn its button on in the Interface tab if you use it often.

**Preview** shows the file in the text box, **Download** saves it, **Copy** puts it on the clipboard.

#### Into PowerPoint and Word

Export EMF and use *Insert → Pictures → This Device*. The picture arrives as vector art at the EMF export scale, 3 mm per Å by default; right-click and **Ungroup** (twice, confirming the conversion prompt) to turn it into native Office shapes whose lines and fills you can recolour. Text is written as text records in Arial, so labels stay text rather than outlines. Arrowheads arrive as ordinary filled polygons, so they ungroup and recolour like any other shape.

EMF is a binary format, so the Copy button doesn't apply to it — use Download. If your Office version is recent, inserting the SVG works too and keeps the layer grouping; EMF is the safer option for older versions and for Word.

#### Into Illustrator

Illustrator can't receive vector objects from a browser clipboard, but two things work:

- Download the SVG and use *File → Place* or drag the file onto the artboard. Layers arrive as groups, labels as editable text.
- Recent Illustrator versions accept SVG *code* pasted from the clipboard: press **Copy** with the SVG format selected, then `Ctrl+V` in Illustrator. If your version doesn't, fall back to the file.

### How hydrogens are counted

For each atom the number of hydrogens is

```
H = valence(element, charge) − Σ bond orders − (1 if radical) − (1 if sp² rule applies)
```

The sp² rule subtracts one for carbon and nitrogen that have no drawn double bond and fewer neighbours than their valence — that is, every atom in the honeycomb is treated as sp², which is what you want for graphene-like structures. Marking a carbon sp³ turns the rule off for that atom, and so does putting the atom on a **free layer**, where hydrogens follow explicit valence alone. Consequences:

- An edge carbon with two neighbours gets one H; with three neighbours, none.
- A zigzag-edge carbon marked as a radical gets no H.
- Nitrogen with two neighbours is pyridinic (no H). For a pyrrolic N–H, use the H count tool and set 1.
- Drawing an explicit double bond turns the rule off for that atom, so Kekulé structures export correctly too.
- A carbon grown with the Bond tool gets CH₂ (sp²) by default; mark it sp³ for a methyl group, and its three hydrogens are placed tetrahedrally.
- A radical dot removes one hydrogen and a lone pair removes two, so a carbon marked with a lone pair and two single bonds is a carbene, not a CH₂.
- On a free layer none of the sp² subtraction applies: draw the double bonds and the count follows them.

Neighbours are normally atoms between 1.14 and 1.63 Å apart. Where one of the pair is an element outside the valence table — a metal centre — the window extends to 2.6 Å so that a coordinated ligand atom counts the metal.

Neighbours are found geometrically (atoms at bond distance in the same layer), not from the drawn bonds. Deleting a bond between two adjacent atoms changes the picture but not the exported H count; override with the H count tool if that is what you mean. For the same reason, switching a layer's auto-bonding off changes what gets bonded but not how hydrogens are counted — two atoms a bond length apart are treated as neighbours whether or not a bond is drawn between them.

The status-bar formula uses the *drawn* bonds, so on a free layer the two rules can disagree: park a template so that one of its atoms lands within 1.63 Å of an atom it is not bonded to and the export will drop a hydrogen from each, while the status bar will not. The exported number is the one that matches the coordinates you are about to relax, but if the contact was accidental the fix is to move the fragment, not to override the count.

**Showing is not counting.** *Show implicit hydrogens on labels* in the Style tab decides whether a worked-out count appears in a label — whether the nitrogen of a pyrrole reads `NH` or `N`. It changes nothing above: the hydrogen is still counted, still in the formula, and still written to XYZ, POSCAR and MOL.

## Examples

### 1. [3]Triangulene

A triangular zigzag-edged molecule with a spin-1 ground state (C₂₂H₁₂).

1. Place one ring, then two rings against its lower-left and lower-right edges, then three along the bottom: six rings in a triangle. Use Rotate 30° first if you want the base horizontal.
2. The status bar reads C₂₂H₁₂, which is the right formula: every edge carbon keeps its hydrogen, and the two unpaired electrons live in the π system, where a formula cannot show them.
3. Ring tool in Clar mode (press `K` until the button reads *Clar*): click the three corner rings for the Clar representation.
4. If you want radical dots in the figure, the Radical tool (`.`) adds one per click — but a dot in HexDraw means a carbon that has *lost* its hydrogen (C₂₂H₁₀ with two), so follow it with the H count tool (`H`) on the same atoms to force the hydrogen back to 1. That is the drawing convention for a π radical; for a σ radical the dot alone is right.
5. Export → SVG for the figure; Export → XYZ with *Add hydrogens* for a planar starting geometry you can relax in Quantum ESPRESSO or CP2K.

### 2. A 7-AGNR unit cell

An armchair graphene nanoribbon seven dimer lines wide, exported as a periodic cell.

1. Press Rotate 30° so the armchair direction runs along x.
2. Draw a strip four rings long and three rings tall (the exact length doesn't matter, only that it spans at least two repeat units).
3. Lattice tool (`L`): click a carbon on the top edge, then the equivalent carbon one repeat further along the ribbon (4.26 Å away for an armchair GNR). Click **Use as a₁**.
4. The status bar now reads *1D cell: C₁₄H₄*, the correct 7-AGNR unit cell. The cell is drawn on the canvas.
5. Export → XYZ. The file contains 18 atoms and a `Lattice=` line with a = 4.26 Å along x, vacuum in y and z, and `pbc="T F F"`.

```python
from ase.io import read
ribbon = read("structure.xyz")
print(ribbon.get_chemical_formula(), ribbon.cell, ribbon.pbc)
```

### 3. AB-stacked bilayer coronene

1. Draw coronene on Layer 1: one ring, then the six rings around it.
2. **Add layer**. Layer 2 appears at z = 3.35 Å and becomes active.
3. Set Layer 2's `y` offset to 1.42 so its ring centres sit over Layer 1's atoms.
4. Draw the second coronene on Layer 2 — Layer 1 is shown dimmed underneath so you can line them up.
5. Export → XYZ gives all 72 atoms with the correct z coordinates. Export → SVG gives two groups, `Layer 1` and `Layer 2`, so you can recolour one of them in Illustrator to make the stacking visible — or click Layer 2's colour chip and give it a different ink before you export.

### 4. A 2D lattice: graphene with a nitrogen dopant

1. Draw a patch of graphene roughly 5 × 5 rings.
2. Atom tool with N selected: click one carbon to substitute it.
3. Lattice tool: click the N atom, then click a carbon at the same sublattice position one lattice constant away (2.46 Å); **Use as a₁**. Pick the N atom again, then the equivalent site 2.46 Å away in a direction 60° from a₁; **Use as a₂**. The parallelogram shows the 2-atom graphene cell — enlarge the vectors (pick atoms further away) for a supercell with lower N concentration.
4. Export → POSCAR. `pbc` is `T T F`, with vacuum only in z.

### 5. A metal phthalocyanine on a free layer

1. Add a layer and tick **free** (or click a template and let it switch the layer for you).
2. **Templates → Phthalocyanine**. It arrives armed; press on empty canvas to plant it, drag if you want to turn it, and release to place it. The status bar reads C₃₂H₁₈N₈, the free base.
3. To put a metal in the middle: Atom tool (`A`) at the centre of the macrocycle, then Text tool (`T`) on it and type `Fe`.
4. Connect tool (`C`) from the iron to each of the four inner nitrogens, 2.08 Å away. That is all it takes: the exporter reaches further at an element outside the valence table, so those nitrogens count the iron as a neighbour, the two N–H hydrogens go on their own, and the formula becomes C₃₂H₁₆FeN₈.
5. To see how the macrocycle is put together, build one isoindole by hand: press `5` so the Ring button reads *Ring 5*, press on empty canvas, drag to turn the pentagon — the angle is shown as you go — and release. Press `6` and click the pentagon's outer edge; the hexagon fuses on the far side.
6. Export → XYZ. The geometry is planar with 1.42 Å bonds and Fe–N at about 2.08 Å: a starting guess, not a relaxed structure. Relax it in Quantum ESPRESSO or CP2K before you use it.

### 6. A reaction scheme

1. Draw the starting material, then the product to its right — the quickest way is to draw one, select it, `Ctrl+D`, and drag the duplicate across.
2. Arrow tool (`G`), set to *Reaction arrow* (`1`): drag from just right of the first structure to just left of the second. The direction snaps to horizontal.
3. With the arrow still selected, use **Label above…** in the Selection panel for the reagents and **Label below…** for the conditions. Both are ordinary text objects afterwards, so you can nudge them with the Text tool.
4. For a mechanism, switch to *Curly arrow* (`5`), drag from the bond or lone pair to where the electrons go, then switch to the Select tool and drag the middle handle to curve it the way you want.
5. Put the whole scheme on its own layer if you also want to export the bare structures: hidden layers are left out of every export.

## File formats and project files

**Save project** writes a JSON file with the complete drawing (atoms, bonds, layers, arrows, lattice); **Open project** loads it back. The schema is simple enough to generate from a script if you ever need to:

```json
{
  "rot": 0, "nextId": 3,
  "layers": [{"id": 1, "name": "Layer 1", "z": 0, "dx": 0, "dy": 0, "visible": true, "color": "#000000", "autoBond": true, "free": false}],
  "active": 1,
  "atoms": [{"id": 1, "x": 0, "y": -1.42, "el": "C", "layer": 1, "charge": 0, "radical": 0, "h": null, "sp3": false, "color": "#1c4286"}],
  "bonds": [{"a": 1, "b": 2, "order": 1, "style": "wedge", "narrow": 1}, {"a": 2, "b": 3, "order": 1, "style": "dash"}],
  "sextets": [], "texts": [], "fills": [{"x": 0, "y": 0, "layer": 1, "color": "#a5c8d1"}],
  "graphics": [{"id": 7, "kind": "curly", "layer": 1, "pts": [{"x": 0, "y": 0}, {"x": 3, "y": 0}, {"x": 1.5, "y": -1.05}]}],
  "settings": {"stroke": 0.075, "fontSize": 0.85, "svgScale": 28, "labelH": true},
  "lattice": {"t1": null, "t2": null, "origin": null}
}
```

An atom, a `texts` entry and a `sextets` entry may each carry an optional `color`, overriding their layer's ink for that object's label, dots and charge sign, that label, or that circle. Absent means the layer's ink, which is what every file written before this existed says.

`radical` is a count: `0`, `1` for one unpaired electron or `2` for a lone pair. Files written before it became a count store `true`, which loads as `1`. A layer's `free` flag defaults to `false` when absent. On a free layer a `fills` entry carries its own `pts` polygon and a `sextets` entry carries `n`, the size of the ring it sits in; on a honeycomb layer both are derived from the lattice and neither field is written.

A bond's `style` is `wedge`, `hash` or `dash`; a dashed bond carries no `narrow` end and counts as order 0 when hydrogens are added.

A `graphics` entry is `{id, kind, layer, pts, text?, size?, color?, w?, bold?, gap?}`, where `gap` overrides the style sheet's line spacing for one equilibrium or retrosynthetic arrow. `kind` is one of `arrow`, `equil`, `reson`, `retro`, `curly`, `curlyh`, `bracket`, `plus`. The straight kinds and `bracket` carry two points, the curly kinds carry start, end and control point in that order, and `plus` carries one. Project files written before arrows existed have no `graphics` array; they load unchanged.

`settings` holds the style numbers plus the one boolean, `labelH`; a file written without it loads with implicit hydrogens shown, as before. The fill colour is a property of the tool rather than of the drawing, so it is not written to project files.

Coordinates inside the project file are in Å with y pointing *down* (SVG convention); exports flip y so the chemical files are right-handed.

## Limitations

- Bond lengths are 1.42 Å everywhere, on honeycomb and free layers alike, and rings on a free layer are regular polygons. Real molecules are neither, so a free-layer structure is a starting guess for a relaxation, not a geometry. Bonds to a metal centre are the one exception and come out at whatever the surrounding ring geometry dictates — 2.08 Å in the phthalocyanine template.
- Coordinates are planar per layer. sp³ carbons keep their lattice position and only their hydrogens leave the plane, so any non-planar heavy-atom geometry needs a subsequent relaxation. Wedge and hash bonds are drawing conventions only and do not change the exported coordinates.
- Reaction arrows are free-floating: they are placed on the page, not anchored to atoms, so a curly arrow does not follow a molecule you move unless you select the two together.
- A free layer has no aromatic-ring perception: it finds rings from the bond graph but never guesses bond orders for you, so Kekulé structures have to be drawn.
- A ring fused onto a bond takes the outward side worked out from the ring or the substituents around that bond. Where a bond is isolated, outward is undefined and the side your cursor is on decides. Rings whose smallest ring is larger than eight members are not found, so the substituent fallback takes over.
- No SMILES or InChI output.
- Line width and the other style numbers are global (Settings dialog). Colour can be overridden on an atom, a bond, an arrow, a text label, a Clar circle and a ring fill, but bold is still per bond and per arrow only, and there is no per-element colouring — a nitrogen is not blue unless you make it blue. Finer control is a job for Illustrator after export.
- EMF has no alpha channel, so transparent colours are flattened on export. SVG is the better route when transparency matters.
- A cell whose vectors are not a repeat of the drawing cannot be exported as a periodic structure, only as the atoms inside it, and those carry a boundary that is wrong by the vectors' error. There is no way to fold a drawing into a cell it does not repeat under.
