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
        myField.focus();
    } else {
        myField.value += myValue;
        myField.focus();
    }

    const event = new Event('input', { bubbles: true });
    myField.dispatchEvent(event);
}

function createCharButton(char, exact = false) {
    const btn = document.createElement('button');
    btn.textContent = char;
    btn.className = exact ? 'char-btn exact-match' : 'char-btn';
    
    btn.addEventListener('click', () => {
        insertAtCursor(editor, char);
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

document.addEventListener('DOMContentLoaded', () => {
    if (typeof charInfo === 'undefined') {
        alert(t('load_error'));
        return;
    }

    window.editor = document.getElementById('editor');
    window.infoDisplay = document.getElementById('info-display');
    window.copyBtn = document.getElementById('copy-btn');
    window.transContent = document.getElementById('trans-content');

    const fontSelect = document.getElementById('editor-font-select');

    infoDisplay.textContent = t('info_default');
    infoDisplay.dataset.i18n = 'info_default';

    window.showInfo = (char) => {
        const pinyin = charInfo[char] || "?";
        const strokes = charStrokes[char] || "";
        
        // const formattedStrokes = strokes ? strokes.split('').join('-') : t('info_none');

        // FOR THE EXCEPTIONAL SYLLABLE ITERATION MARK "ꀕ" (TRANSLITERATED AS "w").
        const isIterationMark = pinyin == 'w'; 
        // FOR RADICAL CHARACTERS, WHICH ARE ROMANIZED WITH A FINAL "="
        const isRadicalChar = pinyin.at(-1) == '=';

        let ipaPart;

        if (isIterationMark) {
            ipaPart = t('iteration_mark');
        } else if (isRadicalChar) {
            ipaPart = `<strong>${t('radical_char')}</strong>`
        } else {
            const ipa = toIPA(pinyin);
            if (ipa) {
                ipaPart = `<strong>${t('info_ipa')}:</strong> <span class="ipa">/${ipa}/</span>`
            } else {
                ipaPart = t('punctuation_mark');
            }
        }

        infoDisplay.innerHTML = `
            <strong>${t('info_char')}:</strong> <strong>${char}</strong> | 
            <strong>${t('info_pinyin')}:</strong> ${pinyin} |
            ${ipaPart}
        `;
        // | <strong>${t('info_strokes')}:</strong> ${formattedStrokes}
    };

    if (fontSelect) {
        fontSelect.addEventListener('change', (e) => {
            const selectedFontVar = e.target.value;

            const fontMap = {
                '--font-yi-sans':
                    'var(--res-font-yi)',
                '--font-yi-cursive':
                    'var(--res-font-yi-cursive)'
            };
            
            document.documentElement.style.setProperty(
                '--current-editor-font', 
                fontMap[selectedFontVar]
            );
        });
    };

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

    document.querySelectorAll('.tab-btn').forEach(buttonSelected => {
        buttonSelected.addEventListener('click', e => {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            buttonSelected.classList.add('active');
            
            const mode = buttonSelected.dataset.mode;
            document.querySelectorAll('.mode-panel').forEach(panel => panel.classList.remove('active'));
            document.getElementById(`panel-${mode}`).classList.add('active');

            if (mode in whenPanelActivates) whenPanelActivates[mode]();
        });
    });
});