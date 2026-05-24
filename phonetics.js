const initials = {
    "m": "m",
    "hm": "m̥",
    "n": "n",
    "hn": "n̥",
    "ny": "ɲ",
    "ng": "ŋ",
    "b": "p",
    "p": "pʰ",
    "bb": "b",
    "nb": "mb",
    "d": "t",
    "t": "tʰ",
    "dd": "d",
    "nd": "nd",
    "z": "ts",
    "c": "tsʰ",
    "zz": "dz",
    "nz": "ndz",
    "zh": "ʈʂ",
    "ch": "ʈʂʰ",
    "rr": "ɖʐ",
    "nr": "ɳɖʐ",
    "j": "tɕ",
    "q": "tɕʰ",
    "jj": "dʑ",
    "nj": "ɲdʑ",
    "g": "k",
    "k": "kʰ",
    "gg": "g",
    "mg": "ŋg",
    "f": "f",
    "v": "v",
    "hl": "ɬ",
    "l": "l",
    "s": "s",
    "ss": "z",
    "sh": "ʂ",
    "r": "ʐ",
    "x": "ɕ",
    "y": "ʑ",
    "h": "x",
    "w": "ɣ",
    "hx": "h",
    "": ""
}

const finals = {
    "i": "i",
    "y": "z",
    "yr": "z̙",
    "e": "ɯ",
    "u": "v",
    "ur": "v̙",
    "o": "o",
    "ie": "ɛ̙",
    "uo": "ɔ̙",
    "a": "a̙"
}

const tones = {
    "": "̄",
    "t": "̋",
    "x": "́",
    "p": "̂"
}

function toIPA(pinyin) {
    let remaining = pinyin;
    let initial = "";
    let final = "";
    let toneMark = "";

    if (["t", "x", "p"].includes(remaining.slice(-1))) {
        toneMark = remaining.slice(-1);
        remaining = remaining.slice(0, -1);
    }

    for (const key of Object.keys(initials).sort((a, b) => b.length - a.length)) {
        if (remaining.startsWith(key)) {
            initial = key;
            remaining = remaining.slice(key.length);
            break;
        }
    }

    if (finals[remaining]) {
        final = remaining;
    } else {
        console.warn(`Unknown final: "${remaining}" in syllable "${pinyin}"`);
        return null;
    }

    if (toneMark == "t" && ["u", "y"].includes(final)) {
        final = final + "r";
    }

    return initials[initial] + finals[final] + tones[toneMark];
}