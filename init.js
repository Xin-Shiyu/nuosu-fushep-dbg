function charFromBtn(btn) {
  const glyph = btn.querySelector('.char-glyph');
  return glyph ? glyph.textContent : btn.textContent;
}

function isMobile() {
    return window.matchMedia('(max-width: 480px)').matches;
}

function insertAtCursor(myField, myValue) {
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    } else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        var scrollTop = myField.scrollTop;
        myField.value = myField.value.substring(0, startPos) + myValue + myField.value.substring(endPos, myField.value.length);
        myField.scrollTop = scrollTop;
        myField.selectionStart = startPos + myValue.length;
        myField.selectionEnd = startPos + myValue.length;
        if (!(currentImeMode === 'stroke' && isMobile())) {
            myField.focus();
        }
    } else {
        myField.value += myValue;
        if (!(currentImeMode === 'stroke' && isMobile())) {
            myField.focus();
        }
    }

    const event = new Event('input', { bubbles: true });
    myField.dispatchEvent(event);
}

function createCharButton(char, exact = false, extra = null) {
    const btn = document.createElement('button');
    btn.className = exact ? 'char-btn exact-match' : 'char-btn';

    const pinyin = charInfo[char];
    const showLabels = pinyin && pinyin !== 'w' && !pinyin.endsWith('=');

    if (extra) {
        const extraSpan = document.createElement('span');
        if (extra.index !== undefined && extra.index < 9) {
            extraSpan.className = 'char-index';
            extraSpan.textContent = extra.index + 1;
        } else if (extra.suffix) {
            extraSpan.className = 'char-suffix';
            extraSpan.textContent = extra.suffix;
        }
        if (extraSpan.className) btn.appendChild(extraSpan);
    }

    if (showLabels) {
        const pinyinSpan = document.createElement('span');
        pinyinSpan.className = 'char-pinyin';
        pinyinSpan.textContent = pinyin;
        btn.appendChild(pinyinSpan);
    }

    const glyph = document.createElement('span');
    glyph.className = 'char-glyph';
    glyph.textContent = char;
    btn.appendChild(glyph);

    if (showLabels) {
        const ipa = toIPA(pinyin);
        if (ipa) {
            const ipaSpan = document.createElement('span');
            ipaSpan.className = 'char-ipa';
            ipaSpan.textContent = `/${ipa["phonemic"]}/ [${ipa["phonetic"]}]`;
            btn.appendChild(ipaSpan);
        } else {
            const ipaSpan = document.createElement('span');
            ipaSpan.className = 'char-ipa';
            ipaSpan.innerHTML = '&nbsp;';
            btn.appendChild(ipaSpan);
        }
    }

    btn.addEventListener('click', () => {
        if (currentImeMode === 'stroke' && typeof window.flushStrokeCandidate === 'function') {
            window.flushStrokeCandidate(char);
        } else {
            insertAtCursor(editor, char);
        }
        const radicalPanel = btn.closest('.radical-panel');
        if (radicalPanel) radicalPanel.classList.add('hidden');
    });

    btn.addEventListener('mouseenter', () => {
        showInfo(char);
    });

    btn.addEventListener('mouseleave', () => {
        infoDisplay.textContent = t('info_default');
        infoDisplay.dataset.i18n = 'info_default';
    });
    return btn;
}

let currentImeMode = 'stroke';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof charInfo === 'undefined') {
        alert(t('load_error'));
        return;
    }

    window.editor = document.getElementById('editor');
    window.infoDisplay = document.getElementById('info-display');
    window.copyBtn = document.getElementById('copy-btn');
    window.transContent = document.getElementById('trans-content');
    window.candidateBar = document.getElementById('candidate-bar');
    window.candidateScroll = document.getElementById('candidate-scroll');
    window.candidateToggle = document.getElementById('candidate-toggle');
    window.modeSwitch = document.getElementById('mode-switch');
    window.dictBtn = document.getElementById('dict-btn');

    const fontSelect = document.getElementById('editor-font-select');

    infoDisplay.textContent = t('info_default');
    infoDisplay.dataset.i18n = 'info_default';

    window.showInfo = (char) => {
        const pinyin = charInfo[char] || "?";
        const strokes = charStrokes[char] || "";

        const isIterationMark = pinyin == 'w';
        const isRadicalChar = pinyin.at(-1) == '=';

        let ipaPart;

        if (isIterationMark) {
            ipaPart = t('iteration_mark');
        } else if (isRadicalChar) {
            ipaPart = `<strong>${t('radical_char')}</strong>`
        } else {
            const ipa = toIPA(pinyin);
            if (ipa) {
                ipaPart = `<strong>${t('info_ipa')}:</strong> <span class="ipa">/${ipa["phonemic"]}/ [${ipa["phonetic"]}]</span>`
            } else {
                ipaPart = t('punctuation_mark');
            }
        }

        infoDisplay.innerHTML = `
            <strong>${t('info_char')}:</strong> <strong>${char}</strong> | 
            <strong>${t('info_pinyin')}:</strong> ${pinyin} |
            ${ipaPart}
        `;
    };

    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            const selectedFontVar = e.target.value;

            const fontMap = {
                '--font-yi-sans':
                    'var(--font-yi-sans)',
                '--font-yi-cursive':
                    'var(--font-yi-cursive)'
            };

            document.documentElement.style.setProperty(
                '--current-editor-font',
                fontMap[selectedFontVar]
            );
        });
    }

    const sizeSelect = document.getElementById('editor-size-select');
    if (sizeSelect) {
        const savedSize = localStorage.getItem('editor-font-size');
        if (savedSize) {
            sizeSelect.value = savedSize;
            document.documentElement.style.setProperty('--editor-font-size', savedSize);
        }
        function applyFontSize(val) {
            document.documentElement.style.setProperty('--editor-font-size', val);
            localStorage.setItem('editor-font-size', val);
        }
        sizeSelect.addEventListener('change', (e) => {
            applyFontSize(e.target.value);
        });
        document.addEventListener('wheel', (e) => {
            if (!e.shiftKey) return;
            e.preventDefault();
            const opts = [...sizeSelect.options];
            const idx = sizeSelect.selectedIndex;
            const dir = e.deltaY > 0 ? -1 : 1;
            const next = Math.max(0, Math.min(opts.length - 1, idx + dir));
            if (next !== idx) {
                sizeSelect.selectedIndex = next;
                applyFontSize(opts[next].value);
            }
        }, { passive: false });
    }

    function updateTransliteration() {
        const text = editor.value;
        let result = "";
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (charInfo[char]) {
                result += "[" + charInfo[char] + "]";
            } else {
                result += char;
            }
        }

        transContent.textContent = result;
    }

    editor.addEventListener('input', updateTransliteration);

    updateTransliteration();

    copyBtn.addEventListener('click', () => {
        const textToCopy = editor.value;
        if (!textToCopy) {
            alert(t('copy_empty'));
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            copyBtn.textContent = t('copied');
            copyBtn.style.backgroundColor = "#10b981";

            setTimeout(() => {
                copyBtn.textContent = t('copy_btn');
                copyBtn.style.backgroundColor = "";
            }, 1500);
        }).catch(err => {
            console.error(t('copy_error'), err);
            alert(t('copy_error_alert'));
        });
    });

    window.whenPanelActivates = {};

    window._imeModeListeners = [];

    const imeToggles = document.querySelectorAll('#ime-toggle .seg-item');

    function switchImeMode(mode) {
        imeToggles.forEach(b => b.classList.remove('active'));
        imeToggles.forEach(b => { if (b.dataset.ime === mode) b.classList.add('active'); });
        currentImeMode = mode;
        clearCandidates();
        _imeModeListeners.forEach(fn => fn(mode));
    }

    imeToggles.forEach(btn => {
        btn.addEventListener('click', () => switchImeMode(btn.dataset.ime));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            if (e.shiftKey) {
                modeSwitch.click();
            } else if (window.inViewMode !== true) {
                const next = currentImeMode === 'stroke' ? 'pinyin' : 'stroke';
                switchImeMode(next);
            }
        }
    });

    if (typeof initStrokeIME === 'function') initStrokeIME();
    if (typeof initPinyinIME === 'function') initPinyinIME();

    if (candidateToggle) {
        candidateToggle.addEventListener('click', () => {
            const isExpanded = candidateScroll.classList.toggle('expanded');
            candidateToggle.textContent = t(isExpanded ? 'candidate_collapse' : 'candidate_expand');
            const editorArea = candidateScroll.closest('.editor-area');
            if (editorArea) editorArea.classList.toggle('candidates-expanded', isExpanded);
            if (!isExpanded) candidateScroll.scrollTop = 0;
        });
    }

    const cardFlow = document.getElementById('card-flow');

    function findRadicalChar(char) {
        for (const radicalChar in radicalMap) {
            const data = radicalMap[radicalChar];
            for (const [, syllables] of data.syllables) {
                if (syllables.includes(charInfo[char])) return radicalChar;
            }
            if (data.radical_chars.includes(charInfo[char])) return radicalChar;
        }
        return '';
    }

    const cardPlaceholder = document.getElementById('card-placeholder');

    function buildCardFlow() {
        const text = editor.value;
        cardFlow.querySelectorAll('.card-flow-card').forEach(el => el.remove());

        if (!text) {
            cardPlaceholder.classList.remove('hidden');
            return;
        }
        cardPlaceholder.classList.add('hidden');

        for (const char of text) {
            const pinyin = charInfo[char];
            if (!pinyin) continue;

            const card = document.createElement('div');
            card.className = 'card-flow-card';

            const charSpan = document.createElement('span');
            charSpan.className = 'card-flow-char';
            charSpan.textContent = char;
            card.appendChild(charSpan);

            const body = document.createElement('div');
            body.className = 'card-flow-body';

            const pinyinLine = document.createElement('span');
            pinyinLine.className = 'card-flow-pinyin';
            pinyinLine.textContent = pinyin;
            body.appendChild(pinyinLine);

            const isIterMark = pinyin === 'w';
            const isRadicalChar = pinyin.endsWith('=');
            if (!isIterMark && !isRadicalChar) {
                const ipa = toIPA(pinyin);
                if (ipa) {
                    const ipaSpan = document.createElement('span');
                    ipaSpan.className = 'card-flow-ipa';
                    ipaSpan.textContent = `/${ipa["phonemic"]}/ [${ipa["phonetic"]}]`;
                    body.appendChild(ipaSpan);
                }
            } else if (isRadicalChar) {
                const label = document.createElement('span');
                label.className = 'card-flow-ipa';
                label.textContent = t('radical_char');
                body.appendChild(label);
            } else {
                const label = document.createElement('span');
                label.className = 'card-flow-ipa';
                label.textContent = t('iteration_mark');
                body.appendChild(label);
            }

            card.appendChild(body);

            const radicalChar = findRadicalChar(char);
            if (radicalChar) {
                const radicalSpan = document.createElement('span');
                radicalSpan.className = 'card-flow-radical';
                radicalSpan.textContent = radicalChar;
                card.appendChild(radicalSpan);
            }
            cardFlow.appendChild(card);
        }
    }

    const editorBottom = document.querySelector('.editor-bottom');

    const imeToggle = document.getElementById('ime-toggle');

    if (modeSwitch) {
        modeSwitch.addEventListener('click', () => {
            const isView = modeSwitch.classList.toggle('view');
            modeSwitch.querySelectorAll('.mode-switch-label').forEach(l => l.classList.remove('active'));
            modeSwitch.querySelectorAll('.mode-switch-label')[isView ? 1 : 0].classList.add('active');
            window.inViewMode = isView;
            editor.classList.toggle('hidden', isView);
            cardFlow.classList.toggle('hidden', !isView);
            editorBottom.classList.toggle('hidden', isView);
            imeToggle.classList.toggle('disabled', isView);
            document.querySelectorAll('.char-btn').forEach(b => b.classList.toggle('disabled', isView));
            if (isView) buildCardFlow();
        });
    }

    const radicalPanel = document.querySelector('.radical-panel');
    const radicalCloseBtn = document.getElementById('radical-close-btn');

    if (dictBtn && radicalPanel) {
        dictBtn.addEventListener('click', () => {
            radicalPanel.classList.toggle('hidden');
        });
    }
    if (radicalCloseBtn && radicalPanel) {
        radicalCloseBtn.addEventListener('click', () => {
            radicalPanel.classList.add('hidden');
        });
    }

    setLanguage(document.getElementById('lang-selector').value);
});

function clearCandidates() {
    if (candidateScroll) {
        candidateScroll.querySelectorAll('.char-btn').forEach(el => el.remove());
        candidateScroll.classList.remove('expanded');
        const ph = candidateScroll.querySelector('.candidate-placeholder');
        if (ph) ph.classList.remove('hidden');
    }
    if (candidateToggle) {
        candidateToggle.style.display = 'none';
        if (candidateBar) candidateBar.classList.add('toggle-hidden');
    }
}

function showCandidates(chars) {
    if (!candidateScroll) return;
    candidateScroll.querySelectorAll('.char-btn').forEach(el => el.remove());
    candidateScroll.classList.remove('expanded');
    const ph = candidateScroll.querySelector('.candidate-placeholder');
    if (ph) ph.classList.add('hidden');
    if (chars.length === 0) return;
    chars.forEach((item, index) => {
        const char = item[0];
        const exact = item[1];
        const suffix = item[2] || '';
        let extra = null;
        if (currentImeMode === 'stroke' && index < 9) {
            extra = { index };
        } else if (currentImeMode === 'pinyin' && suffix) {
            extra = { suffix };
        }
        const btn = createCharButton(char, exact, extra);
        if (btn) candidateScroll.appendChild(btn);
    });
    if (!candidateToggle) return;
    requestAnimationFrame(() => {
        const hasOverflow = candidateScroll.scrollHeight > candidateScroll.clientHeight;
        candidateToggle.style.display = hasOverflow ? 'block' : 'none';
        candidateBar.classList.toggle('toggle-hidden', !hasOverflow);
        candidateToggle.textContent = t('candidate_expand');
    });
}