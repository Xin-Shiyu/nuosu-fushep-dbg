const initials = {
    "m":  ["m", "m"],
    "hm": ["m̥", "m̥"],
    "n":  ["n", "n"],
    "hn": ["n̥", "n̥"],
    "ny": ["ɲ", "ɲ̟"],
    "ng": ["ŋ", "ŋ"],
    "b":  ["p", "p"],
    "p":  ["pʰ", "pʰ"],
    "bb": ["b", "b"],
    "nb": ["mb", "mb"],
    "d":  ["t", "t"],
    "t":  ["tʰ", "tʰ"],
    "dd": ["d", "d"],
    "nd": ["nd", "nd"],
    "z":  ["ts", "t͡s"],
    "c":  ["tsʰ", "t͡sʰ"],
    "zz": ["dz", "d͡z"],
    "nz": ["ndz", "nd͡z"],
    "zh": ["ʈʂ", "ʈ͡ʂ"],
    "ch": ["ʈʂʰ", "ʈ͡ʂʰ"],
    "rr": ["ɖʐ", "ɖ͡ʐ"],
    "nr": ["ɳɖʐ", "ɳɖ͡ʐ"],
    "j":  ["tɕ", "t͡ɕ"],
    "q":  ["tɕʰ", "t͡ɕʰ"],
    "jj": ["dʑ", "d͡ʑ"],
    "nj": ["ɲdʑ", "ɲ̟d͡ʑ"],
    "g":  ["k", "k"],
    "k":  ["kʰ", "kʰ"],
    "gg": ["g", "g"],
    "mg": ["ŋg", "ŋg"],
    "f":  ["f", "f"],
    "v":  ["v", "v"],
    "hl": ["ɬ", "hɬ"],
    "l":  ["l", "l"],
    "s":  ["s", "s"],
    "ss": ["z", "z"],
    "sh": ["ʂ", "ʂ"],
    "r":  ["ʐ", "ʐ"],
    "x":  ["ɕ", "ɕ"],
    "y":  ["ʑ", "ʑ"],
    "h":  ["x", "x"],
    "w":  ["ɣ", "ɣ"],
    "hx": ["h", "h"],
    "":   ["", ""]
}

const finals = {
    "i":  ["i", "i"],
    "y":  ["z", "z̩"],
    "yr": ["z̙", "z̙̩"],
    "e":  ["ɯ", "ʉ̞"],
    "u":  ["v", "vʊ"],
    "ur": ["v̙", "v̙ɵ̙ᵊ"],
    "o":  ["o", "o"],
    "ie": ["ɛ̙", "ɛ̙ᵊ"],
    "uo": ["ɔ̙", "ɔ̙ᵊ"],
    "a":  ["a̙", "a̙"]
}

const tones = {
    "":  ["̄", "⁵⁵"],
    "t": ["̋", "³³"],
    "x": ["́", "⁴⁴"],
    "p": ["̂", "²¹"]
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

    return initials[initial][0] + finals[final][0] + tones[toneMark][0];
}