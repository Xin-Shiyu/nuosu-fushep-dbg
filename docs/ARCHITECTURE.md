# FUSHEP Architecture

## Overview

FUSHEP (ꃚꎹ) is a vanilla-JS Nuosu Yi text tool with two input methods (stroke encoding and romanization), backed by a structured syllabary database with radical decomposition, IPA phonetics, and trigram probability sorting.

There is no build step. All scripts are loaded via `<script>` tags in dependency order and communicate through the global namespace.

## Layer Model

Code is organized into three conceptual layers, analogous to database / backend / frontend:

| Layer | Role | Files |
|-------|------|-------|
| **Database** | Static data definitions. Could be pure JSON. | `data_chars.js`, `data_strokes.js`, `data_radicals.js`, `model/model.js` (`_PROBS_B64`) |
| **Backend** | Data derivation, index building, query logic. No DOM access. | `phonetics.js`, `lang.js`, `model/compress.js`, `model/model.js`, `strokes.js` (query logic) |
| **Frontend** | DOM interaction, event handling, rendering. | `init.js`, `strokes.js` (IME UI), `radicals.js` (UI), `pinyin.js`, `style.css`, `index.html` |

## File Inventory

### `data_chars.js` — Database
- `const charInfo` — 1363 Yi characters → romanization (Yi pinyin) mapping
- `const quotationMirror` — Chinese quotation mark pairs
- `const charLookupReverse` — Auto-generated: romanization → character reverse lookup

### `data_strokes.js` — Database + Backend
- `const strokeExpansionRules` — Symbolic stroke rewrite system (26 base types, ~80 rules)
- `const charStrokes` — 1363 characters → stroke encoding arrays
- `function expandStrokes()` — Recursive derivation engine, produces all valid expansions
- `const charStrokesExpanded` — Pre-computed: all valid stroke decompositions per character
- `const charStrokesLookupReverse` — Pre-computed: stroke symbol → character reverse index (keyed by count)
- `const inputtableStrokes` — Set of strokes the user can actually type (terminal symbols)
- `const strokeExpansionRulesCleaned` — Pre-processed rules in count-vector form

### `data_radicals.js` — Database
- `const radicalMap` — 25 radicals (from 1984 Yi dictionary), each with name, variants, syllabary membership grouped by stroke count

### `phonetics.js` — Backend
- `const initials`, `finals`, `tones` — Yi pinyin → IPA mapping tables
- `function toIPA(pinyin)` — Converts a Yi pinyin syllable string to IPA notation

### `lang.js` — Backend
- `const translations` — 8-language translation dictionary (zh-CN, zh-TW, en, ja, ko, ii, za, la)
- `function t(key)` — Translation lookup
- `function setLanguage(lang)` — Applies translations to DOM elements with `data-i18n` attributes

### `model/compress.js` — Backend
- `function compress(char)` — Maps a Unicode character to a numeric code (0–1361)
- `function decompress(c)` — Inverse of compress

### `model/model.js` — Database + Backend
- `const _PROBS_B64` — Base64-encoded trigram probability table (111,692 entries)
- `function getProb(currentChar, nextChar)` — Looks up trigram probability of `nextChar` given `currentChar`

### `init.js` — Frontend
- DOM element references (`editor`, `candidateBar`, etc.) as `window.*` globals
- `showInfo(char)` — Displays character details (pinyin, IPA, strokes) in status bar
- `createCharButton(char, exact)` — Creates a reusable clickable character button
- `insertAtCursor(field, value)` — Inserts text into the textarea
- `clearCandidates()` / `showCandidates(chars)` — Manages the candidate bar
- IME mode toggle event wiring
- Copy button, font selector, transliteration bar, edit/view mode switch
- Calls `initStrokeIME()` and `initPinyinIME()` on load

### `strokes.js` — Backend + Frontend
- `function resolveCharsFromStrokes(strokes, getPrevChar)` — Core query engine: given stroke symbols, finds matching characters via reverse index, filters by expansion match, sorts by edit distance and trigram probability
- `function initStrokeIME()` — Stroke IME UI: screen keyboard construction, stroke collection & display, candidate filtering, keyboard shortcut handling

### `radicals.js` — Frontend
- `function initRadicals()` — Renders radical selection buttons from `radicalMap`
- `function renderRadicalChars(radicalChar, radicalData)` — Renders character grid for a selected radical, grouped by stroke count

### `pinyin.js` — Frontend
- `function initPinyinIME()` — Builds a trie from `charLookupReverse`, provides `cutQuery()` for multi-syllable parsing, `filterCharsByPinyin()` for prefix matching, keyboard and shortcut handling

### `style.css` — Frontend
- Design token system with 5 color families (bone, neutral, brand, bamboo, hay), each with 6 shades
- Layout, buttons, segmented control, stroke keyboard, candidate bar

### `index.html` — Frontend
- Entry point. DOM structure, script loading order.

## Script Loading Order

Scripts must load in this exact dependency order:

```
data_chars.js        — charInfo, charLookupReverse
data_strokes.js      — charStrokes, strokeExpansionRules, expandStrokes, derived data
data_radicals.js     — radicalMap
model/compress.js     — compress, decompress
model/model.js        — _PROBS_B64, getProb
phonetics.js          — initials, finals, tones, toIPA
lang.js               — translations, t, setLanguage
init.js               — DOM references, createCharButton, showCandidates, etc.
radicals.js           — initRadicals, renderRadicalChars
strokes.js            — resolveCharsFromStrokes, initStrokeIME
pinyin.js             — initPinyinIME
```

## Data Flow

```
charStrokes ──expandStrokes──► charStrokesExpanded ──► charStrokesLookupReverse
                                        │                      │
user strokes ──► resolveCharsFromStrokes ◄──────────────────────┘
                        │
              compress + getProb ──► trigram sorting
                        │
              showCandidates / initStrokeIME
```

```
charLookupReverse ──► pinyinTrie (built in initPinyinIME)
        │
user pinyin ──► cutQuery ──► filterCharsByPinyin ──► showCandidates
```

```
radicalMap ──► initRadicals (renders buttons)
                    │
              click radical ──► renderRadicalChars (queries charLookupReverse)
```

## Design Constraints

- **Vanilla JS** — No framework, no build step, no module system
- **`file://` openable** — Works without a server; no CORS, no fetch
- **Global namespace** — All data and functions are `window.*` globals
- **Static loading** — Script dependency order is explicit in `index.html`
