document.addEventListener('DOMContentLoaded', () => {
    if (typeof charInfo === 'undefined') {
        alert(t('load_error'));
        return;
    }

    const radicalContainer = document.getElementById('radical-buttons');
    const radicalCharContainer = document.getElementById('radical-char-buttons');
    const currentRadicalLabel = document.getElementById('current-radical-label');
    if (!radicalContainer || !radicalCharContainer) return;

    function initRadicals() {
        radicalContainer.innerHTML = ''; 
        
        for (const radicalChar in radicalMap) {
            const radicalData = radicalMap[radicalChar];
            
            let btnText = `[${radicalData.name}]\u00A0\u00A0\u00A0`;
            btnText += radicalChar
            if (radicalData.vars && radicalData.vars.length > 0) {
                btnText += ` ( ${radicalData.vars.join(' ')} )`;
            }

            const btn = document.createElement('button');
            btn.textContent = btnText;
            btn.className = 'radical-btn';
            
            btn.addEventListener('click', () => {
                radicalContainer.querySelectorAll('.radical-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderRadicalChars(radicalChar, radicalData);
                const radicalGroupName = (
                    ["za", "la"].includes(document.documentElement.lang) 
                    ? t("radical_group") + " " + radicalData.name_trans 
                    : radicalData.name_trans + " " + t("radical_group")
                );
                // SOME LANGUAGES HAVE "... Group" FORMAT WHILE THE OTHERS HAVE "Group ...".
                currentRadicalLabel.textContent = radicalData.name + " - " + radicalGroupName;
                currentRadicalLabel.dataset.radicalId = radicalChar;
                delete currentRadicalLabel.dataset.i18n;
            });
            
            radicalContainer.appendChild(btn);
        }
    }

    function renderRadicalChars(radicalChar, radicalData) {
        radicalCharContainer.innerHTML = '';
        
        const groups = [[-1, radicalData.radical_chars]].concat(radicalData.syllables) || [];

        if (!groups.length) {
            radicalCharContainer.innerHTML = `<p class="hint">${t('radical_empty')}</p>`;
            return;
        }

        groups.forEach(group => {
            const strokeCount = group[0];
            const syllableList = group[1];
            // console.log(syllableList)
            
            if (!syllableList || syllableList.length === 0) return;
            
            const charsInGroup = [];
            syllableList.forEach(syl => {
                const yiChar = charLookupReverse[syl];
                
                if (yiChar && charInfo[yiChar] && !charsInGroup.includes(yiChar)) {
                    charsInGroup.push(yiChar);
                }
            });

            if (charsInGroup.length === 0) return;
            
            const rowDiv = document.createElement('div');
            rowDiv.className = 'radical-stroke-row';

            const labelSpan = document.createElement('span');
            labelSpan.className = 'stroke-label';
            
            labelSpan.textContent = t(strokeCount == -1 ? `radical_chars` : `radical_stroke_${strokeCount}`);
            rowDiv.appendChild(labelSpan);
            
            const charsDiv = document.createElement('div');
            charsDiv.className = 'stroke-char-list';
            
            charsInGroup.forEach(char => {
                const btn = createCharButton(char);
                if (btn) charsDiv.appendChild(btn);
            });
            rowDiv.appendChild(charsDiv);
            
            radicalCharContainer.appendChild(rowDiv);
        });
    }

    initRadicals();

    whenPanelActivates['radical'] = () => {
        filterCharsByStrokes();
        editor.blur(); 
    };
});
