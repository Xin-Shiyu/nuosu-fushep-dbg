# FUSHEP Design Principles

## 1. Token Palette

The design token system (`style.css :root`) defines five color families, each with a six-shade ramp:

| Ramp Step | Role |
|---|---|
| `air` | Backgrounds, large surfaces |
| `stain` | Borders, dividers, hover surfaces |
| `ink` | Main interactive color |
| `weight` | Hovered/pressed variant of `ink` |
| `fade` | Secondary text, disabled state, ghost hover |
| `deep` | Pressed state, dark foregrounds |

### Families

| Family | Hue | Primary Use |
|---|---|---|
| **bone** | warm off-white/beige | UI canvas. Backgrounds, containers, dividers. The dominant surface color. |
| **neutral** | dark gray | Body text, icons. The dominant text color. |
| **brand** | red/burgundy | Primary actions, logo identity. Sparse, deliberate, never timid. |
| **bamboo** | muted green | Exact-match candidates, affirming states. Content-level, not chrome-level. |
| **hay** | gold/amber | Highlights, warnings, attention cues. Content-level. |

---

## 2. Color Usage Rule

**Bone is the canvas. Neutral carries information. Brand punctuates.**

- The UI is bone-colored by default — backgrounds, borders, inactive controls.
- Text and core content are neutral.
- Brand color appears in **exactly two places**: the logo headline, and the single primary action button on screen. It is never used for utility controls (selects, toggles).
- Bamboo and hay are reserved for **content-level signals** (exact IME match, data highlight) — they never appear in chrome.

When brand is used, it is **filled, saturated, confident** — `ink` as background with white text, not a pale `air` tint that looks hesitant.

---

## 3. Controls

### Buttons

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| `btn-primary` | `--c-brand-ink` | `#fff` | `--c-brand-ink` | The single primary action on screen |
| `btn-subtle` | `--c-bone-ink` | `--c-neutral-ink` | transparent | Secondary actions (dictionary, card toggle) |

- `btn-primary` is a **fill** button. Bold, red, unmistakable. There is at most one on screen.
- `btn-subtle` is a **ghost** button. It recedes into the UI — noticeable on hover, invisible when not needed.

All buttons have `hover` (+darken) and `active` (+further darken) states with a 0.12s transition.

### Segmented Control

For mutually exclusive mode toggles (IME mode: stroke / romanization):

- Items sit inside a container with `border: 1px solid --c-bone-ink` and `border-radius` with `overflow: hidden`.
- Active item uses `--c-bone-ink` background with `--c-neutral-ink` text.
- Inactive items are transparent with `--c-neutral-fade` text.

### Select

- Base style: bone background, neutral text, custom SVG dropdown arrow.
- Variants: `select-neutral` (bone), `select-brand` (for rare accent uses).
- Hover darkens the background to `stain`.

---

## 4. Layout Philosophy

### Desktop

A single fixed-size window (1000x625px) centered on screen. The product is a **workspace**, not a webpage.

Layout is vertical: header → toolbar → editor (flex:1) → transliteration bar → status bar.

- The editor is the hero region — it fills all available vertical space (`flex: 1`).
- Bars above and below the editor are compact, single-row, no stacking.
- All interactions happen within this frame. No scrolling the window itself (panels scroll internally).

### Mobile

**State machine, not panel layout.** Only one state is active at a time.

- **Input state**: editor + screen keyboard + candidate bar.
- **Reading state**: card flow, no input. Editor is hidden.
- **Dictionary state**: full-screen overlay, drill-down (radical list → character list → back).

Navigation between states is explicit — button or tap, never automatic (except paste-and-view as an opt-in action).

The principle: mobile treats every mode as an **enter-and-exit context**, not a simultaneous panel.

---

## 5. IME vs Dictionary

IME and dictionary are fundamentally different interaction models and must not share a layout template.

- **IME**: The product's core identity. Always accessible. Input primitive → compute → candidate output → flush to editor.
- **Dictionary**: Auxiliary. Invoked on demand. Browsing/searching a structured database. Returns a character to the previous context.

On desktop, the dictionary opens as a **palette** (not a tab). On mobile, as a **full-screen overlay**.

Character information (romanization, IPA, strokes, radical) lives in the **reading layer** (card flow), not exclusively in the dictionary. The dictionary is for finding characters you cannot type; card flow is for understanding characters you already have.

---

## 6. Typography

- Yi text in the editor uses `--current-editor-font` (togglable between sans-serif and cursive).
- UI text uses system/Chinese fonts inherited from `body`.
- No font-weight tricks — one weight per context. Clarity through spacing, not variation.
- Yi characters are ~1.25x larger than Latin text to maintain visual parity.

---

## 7. Technical Constraints

- **Vanilla JS.** No framework, no build step.
- **Static loading.** Scripts via `<script>` tags in dependency order.
- **`file://` openable.** Must work without a server.
- **GitHub Pages.** The only deployment target.
- **External font.** NiepshaExtremum by Keedizhang, not bundled.

These are not temporary limitations. They are permanent design constraints that shape every decision.

---

## 8. Class Naming Convention

CSS classes use semantic prefixes, not utility concatenation:

| Pattern | Example | Meaning |
|---|---|---|
| `btn-{role}` | `btn-primary`, `btn-subtle` | Button intent/priority |
| `select-{tone}` | `select-neutral`, `select-brand` | Select visual weight |
| `seg-item` | Component internals | Child of `.segmented` |
| `{state}` | `.active`, `.visible` | Transient state, toggled by JS |

Class names describe **what the element is**, not **what tokens it consumes**. Tokens map through CSS rules, not through class composition.

---

## 9. What We Avoid

- **Special Unicode characters in UI labels.** No ▦, ☰, emoji, or decorative glyphs in button text. Labels are locale strings only.
- **Brand-colored chrome.** Selects, toggles, dividers, status bars do not use brand tokens.
- **Panel tabs as navigation.** No `tab-btn` / `mode-panel` pattern. Modes are states or overlays.
- **Hover-only information.** Character details must be accessible by tap (mobile) and persistent (card flow), not exclusively through `mouseenter` tooltips.
- **Auto-triggered mode switches.** Paste does not auto-enter card flow. Card flow does not auto-return on editor focus. All transitions are user-initiated.
