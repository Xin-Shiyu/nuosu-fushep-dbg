/**
 * 
 * @param {string[]} strokes
 * @param {function(): string} getPrevChar
 * @returns {[string, bool][]}
 */
function resolveCharsFromStrokes(strokes, getPrevChar) {
    const countObj = arrToCountObj(strokes);

    const sets = Object.entries(countObj)
        .map(([stroke, count]) =>
            charStrokesLookupReverse[stroke] &&
            charStrokesLookupReverse[stroke][count]);
    if (sets.length === 0 || sets.includes(undefined)) return [];

    const setsSorted = sets.sort((set1, set2) => set1.size - set2.size);
    const candidates = new Set(setsSorted[0]);

    for (const set of sets.slice(1)) {
        candidates.forEach(candidate => {
            if (!set.has(candidate)) {
                candidates.delete(candidate);
            }
        });
    }

    let ret = [];

    const prevChar = getPrevChar();

    for (const candidate of candidates) {
        const expansions = charStrokesExpanded[candidate];
        let match = false;
        let minEditDistance = Infinity;

        for (const expansion of expansions) {
            if (Object.keys(expansion).length < Object.keys(countObj).length)
                continue;

            const expansionMatch = Object.keys(countObj)
                .every(key => key in expansion && expansion[key] >= countObj[key]);

            if (expansionMatch) {
                const editDistance = Object.entries(expansion)
                    .map(([key, value]) => value - (countObj[key] || 0))
                    .reduce((total, current) => total + current);
                match = expansionMatch;
                if (editDistance < minEditDistance || minEditDistance === Infinity) minEditDistance = editDistance;
            }
        }

        if (match) ret.push([candidate, minEditDistance]);
    }

    if (prevChar !== undefined && compress(prevChar) !== undefined && ret.length > 0) {
        const withProbs = ret.map(elem => {
            const compressed = compress(elem[0]);
            const prob = compressed !== undefined ? getProb(prevChar, elem[0]) : 0;
            return { elem, prob };
        });

        withProbs.sort((a, b) => {
            const delta = a.elem[1] - b.elem[1];
            return delta === 0 ? b.prob - a.prob : delta;
        });

        console.log(withProbs);

        ret = withProbs.map(item => item.elem).map(([char, ed]) => [char, ed === 0]);
    } else if (ret.length > 0) {
        console.log('Skipping probability sort (prevChar undefined or compress(prevChar) undefined)');
    }

    return ret;
}

function initStrokeIME() {
    let currentStrokes = "";

    const strokeDisplay = document.getElementById('stroke-display');
    const clearStrokeBtn = document.getElementById('clear-stroke-btn');
    const strokeIndicator = document.getElementById('stroke-indicator');

    function updateStrokeUI() {
        if (strokeDisplay) strokeDisplay.textContent = currentStrokes || '';
    }

    function filterCharsByStrokes() {
        if (currentStrokes.length === 0) {
            clearCandidates();
            return;
        }
        const matchedChars = resolveCharsFromStrokes(currentStrokes, () => {
            const textarea = editor;
            if (!textarea) return '\n';
            const cursorPos = textarea.selectionStart;
            if (cursorPos === 0) return '\n';
            return textarea.value[cursorPos - 1];
        }, () => {
            const textarea = editor;
            if (!textarea) return '\n';
            const cursorPos = textarea.selectionStart;
            if (cursorPos <= 1) return '\n';
            return textarea.value[cursorPos - 2];
        });
        showCandidates(matchedChars);
    }

    function addStroke(stroke) {
        currentStrokes += stroke;
        updateStrokeUI();
        filterCharsByStrokes();
    }

    function deleteStroke() {
        if (currentStrokes.length > 0) {
            currentStrokes = currentStrokes.slice(0, -1);
            updateStrokeUI();
            filterCharsByStrokes();
            return;
        }
        const start = editor.selectionStart;
        if (start === 0) return;
        editor.value = editor.value.slice(0, start - 1) + editor.value.slice(editor.selectionEnd);
        editor.selectionStart = editor.selectionEnd = start - 1;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    window.deleteStroke = deleteStroke;

    function clearStrokes() {
        currentStrokes = "";
        updateStrokeUI();
        clearCandidates();
    }

    function flushSingleChar(index) {
        const buttons = candidateBar.querySelectorAll('.char-btn');
        if (index < buttons.length) {
            insertAtCursor(editor, charFromBtn(buttons[index]));
            clearStrokes();
        }
    }

    window.flushStrokeCandidate = function(char) {
        insertAtCursor(editor, char);
        clearStrokes();
    };

    if (clearStrokeBtn) {
        clearStrokeBtn.addEventListener('click', clearStrokes);
    }

    const backspaceBtn = document.getElementById('backspace-btn');
    if (backspaceBtn) {
        backspaceBtn.addEventListener('click', () => {
            if (typeof window.deleteStroke === 'function') {
                window.deleteStroke();
            }
            if (editor) editor.focus();
        });
    }

    const strokeKeyboardEl = document.getElementById('stroke-keyboard');
    function initStrokeKeyboard() {
        if (!strokeKeyboardEl) return;
        inputtableStrokes.forEach(stroke => {
            const btn = document.createElement('button');
            btn.textContent = stroke;
            btn.className = 'stroke-key-btn';
            btn.addEventListener('click', () => addStroke(stroke));
            strokeKeyboardEl.appendChild(btn);
        });
    }
    initStrokeKeyboard();

    editor.addEventListener('selectionchange', () => {
        if (currentImeMode === 'stroke') filterCharsByStrokes();
    });

    document.addEventListener('keydown', function handleStrokeKeydown(e) {
        if (currentImeMode !== 'stroke') return;
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        const key = e.key.toUpperCase();

        if (e.key === 'Escape') {
            clearStrokes();
        } else if (document.activeElement === editor) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const buttons = candidateBar.querySelectorAll('.char-btn');
                if (buttons.length > 0) {
                    insertAtCursor(editor, charFromBtn(buttons[0]));
                    clearStrokes();
                }
            } else if (e.key === 'Backspace' && currentStrokes.length > 0) {
                e.preventDefault();
                deleteStroke();
            } else if (inputtableStrokes.has(key)) {
                e.preventDefault();
                addStroke(key);
            } else if (e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                flushSingleChar(parseInt(e.key) - 1);
            }
        } else {
            if (e.key === 'Backspace') {
                e.preventDefault();
                deleteStroke();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                flushSingleChar(0);
            } else if (inputtableStrokes.has(key)) {
                e.preventDefault();
                addStroke(key);
            } else if (e.key >= '1' && e.key <= '9') {
                e.preventDefault();
                flushSingleChar(parseInt(e.key) - 1);
            }
        }
    });

    if (strokeIndicator) {
        strokeIndicator.classList.toggle('hidden', currentImeMode !== 'stroke');
    }
    if (strokeKeyboardEl) {
        strokeKeyboardEl.classList.toggle('hidden', currentImeMode !== 'stroke');
    }
    if (clearStrokeBtn) {
        clearStrokeBtn.classList.toggle('hidden', currentImeMode !== 'stroke');
    }
    _imeModeListeners.push(function(mode) {
        if (mode !== 'stroke') {
            clearStrokes();
        }
        if (strokeIndicator) {
            strokeIndicator.classList.toggle('hidden', mode !== 'stroke');
        }
        if (strokeKeyboardEl) {
            strokeKeyboardEl.classList.toggle('hidden', mode !== 'stroke');
        }
        if (clearStrokeBtn) {
            clearStrokeBtn.classList.toggle('hidden', mode !== 'stroke');
        }
    });
}
