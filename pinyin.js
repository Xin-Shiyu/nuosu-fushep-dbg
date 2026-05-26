function initPinyinIME() {
    const pinyinInput = document.getElementById('pinyin-input');
    const clearPinyinBtn = document.getElementById('clear-pinyin-btn');
    const pinyinIndicator = document.getElementById('pinyin-indicator');

    window.pinyinTrie = {};

    for (const pinyin in charLookupReverse) {
        let ptr = pinyinTrie;
        for (const ch of pinyin) {
            ptr[ch] = ptr[ch] || {};
            ptr = ptr[ch];
        }
        ptr.pinyin = pinyin;
    }

    function cutQuery(query) {
        const delimiters = "- ";

        const pinyins = [];
        const l = query.length;

        let ptr = pinyinTrie;

        let trailerStart = 0;

        for (let i = 0; i < l; ++i) {
            const ch = query[i];

            if (ptr[ch]) {
                ptr = ptr[ch];
            } else {
                if (ptr.pinyin) {
                    pinyins.push(ptr.pinyin);
                    trailerStart = i;
                    if (pinyinTrie[ch]) {
                        ptr = pinyinTrie[ch];
                    } else if (delimiters.includes(ch)) {
                        ptr = pinyinTrie;
                        trailerStart += 1;
                    } else {
                        break;
                    }
                } else if (delimiters.includes(ch)) {
                    trailerStart += 1;
                } else {
                    break;
                }
            }
        }

        if (trailerStart < l) pinyins.push(query.substring(trailerStart, l));

        return pinyins;
    }

    function filterCharsByPinyin() {
        const query = pinyinInput.value.toLowerCase().trim();

        if (!query) {
            clearCandidates();
            return;
        }

        const queryCut = cutQuery(query);

        const exactMatches = queryCut.slice(0, -1).map(pinyin =>
            [charLookupReverse[pinyin], true]
        );

        const trailerQuery = queryCut.at(-1);

        const matchedEntries = Object.entries(charLookupReverse)
            .filter(([pinyin]) => pinyin.startsWith(trailerQuery))
            .sort((entry1, entry2) => entry1[0].localeCompare(entry2[0]));

        const matchedChars = [
            ...exactMatches.map(([char]) => [char, true, '']),
            ...matchedEntries.map(([pinyin, char]) => {
                const isExact = pinyin === trailerQuery;
                const suffix = isExact ? '' : '-' + pinyin.substring(trailerQuery.length);
                return [char, isExact, suffix];
            })
        ];

        const quotationFlags = Object.fromEntries(
            Object.entries(quotationMirror)
                .map(quotationMark => [quotationMark, false]));

        for (let i = 0; i < matchedChars.length; ++i) {
            let seg = matchedChars[i][0];
            if (quotationMirror[seg]) {
                if (quotationFlags[seg]) {
                    matchedChars[i][0] = quotationMirror[seg];
                }
                quotationFlags[seg] = !quotationFlags[seg];
            }
        }

        showCandidates(matchedChars);
    }

    pinyinInput.addEventListener('input', filterCharsByPinyin);

    function flushPinyinExactMatches() {
        const buttons = candidateBar.querySelectorAll('.exact-match');
        if (buttons.length === 0) return;

        const chars = Array.from(buttons).map(btn => charFromBtn(btn));
        const str = chars.join('');
        insertAtCursor(editor, str);
        clearPinyin();
    }

    pinyinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') flushPinyinExactMatches();
    });

    function clearPinyin() {
        pinyinInput.value = "";
        filterCharsByPinyin();
        pinyinInput.focus();
    }

    if (clearPinyinBtn) {
        clearPinyinBtn.addEventListener('click', clearPinyin);
    }

    const submitPinyinBtn = document.getElementById('pinyin-submit-btn');
    if (submitPinyinBtn) {
        submitPinyinBtn.addEventListener('click', flushPinyinExactMatches);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentImeMode === 'pinyin') {
            if (document.activeElement === pinyinInput) {
                clearPinyin();
            }
        }
    });

    if (pinyinIndicator) {
        pinyinIndicator.classList.toggle('hidden', currentImeMode !== 'pinyin');
    }
    if (clearPinyinBtn) {
        clearPinyinBtn.classList.toggle('hidden', currentImeMode !== 'pinyin');
    }
    if (submitPinyinBtn) {
        submitPinyinBtn.classList.toggle('hidden', currentImeMode !== 'pinyin');
    }
    _imeModeListeners.push(function(mode) {
        if (pinyinIndicator) {
            pinyinIndicator.classList.toggle('hidden', mode !== 'pinyin');
        }
        if (clearPinyinBtn) {
            clearPinyinBtn.classList.toggle('hidden', mode !== 'pinyin');
        }
        if (submitPinyinBtn) {
            submitPinyinBtn.classList.toggle('hidden', mode !== 'pinyin');
        }
        if (mode === 'pinyin') {
            filterCharsByPinyin();
            pinyinInput.focus();
        } else {
            clearPinyin();
        }
    });
}