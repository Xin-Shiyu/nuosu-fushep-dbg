# FUSHEP v1.0 Product Requirements Document

**Status**: Draft
**Version**: 0.1
**Date**: 2026-05-24

---

## 1. Product Overview

**FUSHEP** (ꃚꎹ, /fū.ʂɯ̂/) is a Nuosu Yi text tool built around two input methods — stroke encoding and romanization — backed by a structured syllabary database with radical decomposition, IPA phonetics, and context-aware trigram sorting.

The current version (v0.1.9) is a functional prototype. v1.0 defines the product it should become.

---

## 2. Problem Statement

The v0.1.x release has three distinct capabilities — radical lookup, stroke input, romanization input — presented as equal tabs in an identical sidebar+grid layout. This creates three problems:

1. **No clear product identity.** The tool is simultaneously a dictionary, an IME, and a search engine, sharing one layout. Users cannot tell what the primary use case is.

2. **Information exists but is inaccessible.** The database contains radical membership, stroke decomposition, IPA phonetics, and romanization for every character. The only information channel is a transient `mouseenter` tooltip — no persistent view, no comparative view, no mobile-compatible interaction.

3. **The interaction paradigm inherits from paper.** The radical lookup mode mimics the page-turning structure of a 1984 print dictionary (radical → stroke count → character list). This is content repackaged as interaction, not a native digital tool.

---

## 3. Product Identity

FUSHEP is an **IME-first Nuosu Yi text tool**. Its core identity is text input. Everything else — dictionary lookup, character information, radical decomposition — serves as auxiliary layers around the input experience.

| Layer | Role | Visibility |
|---|---|---|
| **Input (IME)** | Core | Always present. The product *is* this. |
| **Reading & Understanding** | Persistent | Card-flow view of text with per-character information. |
| **Dictionary Lookup** | On-demand | Drawer/panel. Radical, stroke, and romanization lookup are supplementary, not tab-level peers. |

---

## 4. Target Users

- **Nuosu Yi writers**: People composing text in the Yi syllabary, who need efficient input for a script with no mainstream IME.
- **Nuosu Yi learners**: People who encounter Yi text and need to resolve characters into phonetics, radicals, and stroke decomposition.
- **Linguists & researchers**: People working with Yi text corpora who need structured character data.

All three use the same database. They do not use the same interface.

---

## 5. Core Experience Principles

1. **IME is the home screen.** The product opens to an input-ready state, not a menu.
2. **Character information is persistent, not transient.** Replaces hover tooltip with an expandable card view.
3. **Dictionary is content, not structure.** Radical taxonomy, stroke decomposition, and romanization are data assets that explain characters. They are not the primary navigation.
4. **Desktop and mobile are two products.** Desktop is a productivity workspace. Mobile is an IME with a screen keyboard. They share a data layer, not a layout.

---

## 6. Feature Breakdown

### 6.1 Core: Text Editor + IME

The primary interface is a text editing area with two input modes:

| Mode | Input Primitive | Output |
|---|---|---|
| Stroke IME | Stroke symbols (H, I, J, F, N, M, B, K, G, Z, R, O, S, U, E, L, A, C, D, P, Q, X, V) input via keyboard or on-screen keypad | Sorted character candidates with flush-to-editor |
| Romanization IME | Latin transcription (yi pinyin) via keyboard | Exact syllable match, prefix-filtered candidates with flush-to-editor |

Both IMEs share:
- Candidate list with exact-match highlighting
- Enter to commit first candidate, number keys to commit nth candidate
- Esc to cancel input

Stroke IME additionally uses:
- Context-aware trigram probability sorting (existing model)
- Edit-distance as secondary sort when trigram probability ties (existing)

Romanization IME does not need candidate sorting — Yi pinyin maps 1:1 to characters, so there is no ambiguity to resolve.

### 6.2 Reading Layer: Text → Card Flow

A toggle converts the text editor content into a scrollable card flow.

Each card represents one character and displays:
- **Minimal card**: The character itself, romanization, IPA
- **Expanded card** (on click/tap): Stroke decomposition, radical membership, full character metadata

Card expansion replaces the current `mouseenter` tooltip. It works on mobile (tap), supports simultaneous viewing, and enables comparative reading.

The transition between text-editor mode and card-flow mode should have a considered animation.

### 6.3 Dictionary Panel (Auxiliary)

A unified dictionary drawer/palette accessible from any mode:

- **Radical browsing**: The existing radical taxonomy (25 radicals from 《彝文检字本》, 1984) organized as a browsable index. Selecting a radical shows its member characters as cards, not inline text.
- **Stroke search**: Existing stroke matching engine, presented as a search-within-dictionary.
- **Romanization search**: Existing romanization trie matching, presented as a search-within-dictionary.

The dictionary is not a primary navigation tab. It is invoked when the user needs to look up a character they cannot type.

On mobile, the dictionary's internal layout also follows the enter/exit model — a single-column drill-down rather than the desktop sidebar+grid split. Tapping a radical navigates into its character list; back returns to the radical index.

### 6.4 Desktop Workspace

A single-window application centered on the text editor:

```
┌──────────────────────────────────────────────┐
│  [Stroke IME | Romanization IME]  [Font ▼]  │
├──────────────────────────────────────────────┤
│                                              │
│              TEXT EDITOR AREA                │
│                                              │
├──────────────────────────────────────────────┤
│  Transliteration bar: [it][mop][sse]...      │
├──────────────────────────────────────────────┤
│  [Card Flow / Editor Toggle]  [Dictionary ☰] │
└──────────────────────────────────────────────┘
```

- IME mode switch lives in a compact toolbar
- Transliteration bar is always visible under editor
- Card flow toggle and dictionary access are secondary controls
- Professional, minimal visual language — no distracting decoration

### 6.5 Mobile States

Mobile uses mutually exclusive full-screen states, not simultaneous panels. Only one state is active at a time.

**State: Input**
```
┌──────────────────────┐
│                      │
│   TEXT EDITOR AREA   │
│                      │
├──────────────────────┤
│  Candidate bar       │
│  [ꀀ][ꀁ][ꀂ][ꀃ]...    │
├──────────────────────┤
│  Stroke keyboard     │
│  (grouped by type)   │
├──────────────────────┤
│  Transliteration bar │
│  [☰ Dict] [▦ Cards] │
└──────────────────────┘
```

**State: Reading (Card Flow)**
```
┌──────────────────────┐
│  ← Back to Input     │
├──────────────────────┤
│                      │
│   CARD FLOW          │
│   (scrollable)       │
│                      │
├──────────────────────┤
│  [☰ Dict]            │
└──────────────────────┘
```

**State transitions:**
- Tapping ▦ Cards switches from Input → Reading. Text editor content is converted to card flow. Input is locked.
- Tapping ← Back switches from Reading → Input. Cards collapse, editor returns, keyboard restores.
- ☰ Dict opens the dictionary as a full-screen overlay (not a side panel) on either state. Selecting a character from the dictionary returns to the previous state.

**State: Dictionary (Mobile)**
```
  Radical Index                    Character List
┌──────────────────────┐    ┌──────────────────────┐
│  ← Back              │    │  ← Back to Radicals  │
├──────────────────────┤    ├──────────────────────┤
│  [ꐈ] QOT 部          │    │  QOT 部 · 1画        │
│  [ꆹ] LI 部           │    │  [ꀖ] [ꀗ] [ꀘ] [ꀙ]    │
│  [ꑍ] NYIP 部         │    │  [ꀚ] [ꀛ] [ꀜ] [ꀝ]    │
│  [ꋍ] CYP 部          │    │                      │
│  [ꌬ] SSI 部          │    │  QOT 部 · 2画        │
│  [ꈥ] GGOP 部         │    │  [ꀞ] [ꀟ] [ꀠ] [ꀡ]    │
│  [ꇱ] GEP 部          │    │                      │
│  ...                  │    │  QOT 部 · 3画        │
│                       │    │  [ꀢ] [ꀣ] [ꀤ] ...    │
│  ──────────────────   │    │                      │
│  Stroke Search        │    │  ...                 │
│  Romanization Search  │    │                      │
└──────────────────────┘    └──────────────────────┘
      Tap a radical               Tap a character
      → drill in                  → insert & return
                                   to previous state
```

- Dictionary opens as a full-screen overlay from any state
- Radical index is a single-column scrollable list — no sidebar
- Tapping a radical drills into its character list, grouped by stroke count (as in current `radicalMap` data)
- Back returns to radical index
- Stroke Search and Romanization Search are secondary entry points within the same overlay
- Selecting a character returns to the previous state (Input or Reading) and inserts/selects that character

### 6.6 Character Information (Cross-cutting)

Every character — whether in editor, card flow, candidate list, or dictionary — should surface the same structured data:

| Field | Source |
|---|---|
| Romanization (Yi pinyin) | `charInfo` |
| IPA phonetics | `phonetics.js` → `toIPA()` |
| Stroke decomposition | `charStrokes` (expanded) |
| Radical membership | `radicalMap` reverse lookup |
| Radical stroke group | `radicalMap[*].syllables` |

Currently available but only partially surfaced in the UI.

### 6.7 Languages & Locale

Existing 8-language locale system (zh-CN, zh-TW, en, ja, ko, ii, za, la) preserved. New UI strings added as needed.

---

## 7. Data Architecture (Existing Assets, Unchanged)

The following data layers are complete and form the product's technical moat:

| Asset | Description | Status |
|---|---|---|
| `charInfo` | 1363 characters → romanization mapping | Complete |
| `charStrokes` | 1363 characters → stroke encoding | Complete (radicals pending) |
| `strokeExpansionRules` | Symbolic stroke rewrite system (26 base types + composites) | Complete |
| `charStrokesExpanded` | All valid stroke decompositions per character | Complete |
| `charStrokesLookupReverse` | Stroke → character reverse index with multiplicity | Complete |
| `radicalMap` | 25 radicals with syllabary membership by stroke count | Complete |
| `phonetics.js` | Yi pinyin → IPA mapping (initials, finals, tones) | Complete |
| `model/compress.js` | Character codec for Markov model (1360 tokens) | Complete |
| `model/model.js` | Trigram probability model (111,692 entries, base64-encoded) | Complete |
| `lang.js` | 8-language i18n system | Complete |

---

## 8. Constraints (Non-Negotiable for v1.0)

- No build step or framework migration — vanilla JS, `<script>` tag loading, `file://` openable

---

## 9. Open Questions

1. **`new-ui` branch disposition.** → **Decided: v1.0 baseline.** The `new-ui` branch is the starting point for v1.0 work. Current main branch (v0.1.x) becomes legacy.

2. **Radical stroke encoding.** → **Deferred.** Radical chars (꒐–꓆) have empty `charStrokes`. This is a content task, not a design task. Skip for v1.0 unless a concrete use case emerges.

3. **Card-flow primary use case.** → **Decided: Reading.** Card flow is for understanding text — your own after composing, or someone else's after pasting. The transliteration bar already serves quick self-verification during writing; card flow is the deeper "unpack this text" layer.

4. **Paste flow.** → **Decided: Explicit action, not auto-trigger.** A "paste and view" button or command is sufficient. Paste should not auto-switch to card flow — the user may want to edit pasted text first.

5. **Stroke keyboard pedagogy.** → **Deferred to post-v1.0.** v1.0 ships with Latin-letter key labels on the screen keyboard. Learning aids (tooltips, guided intro, reference) are a content layer on top of the layout, not a layout prerequisite.

6. **v0.1.x sunset.** → **Undecided.** v0.1.x may remain deployed alongside v1.0, or be replaced. No commitment yet.
