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
    "yr": ["z̙", "z̙̍"],
    "e":  ["ɯ", "ɯ̈"],
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

    phonetic_ipa = {
        "initial": initials[initial][1],
        "final": finals[final][1],
        "tone": tones[toneMark][1]
    }

    const initial_alt = {
        "u": {
            "bb": "b<sup>(~ʙ)</sup>",
            "nb": "mb<sup>(~ʙ)</sup>",
            "dd": "dʙ",
            "nd": "ndʙ"
        },
        "ur": {
            "bb": "ʙ",
            "nb": "mʙ",
            "d": "tʙ",
            "t": "tʰʙ̥",
            "dd": "dʙ",
            "nd": "ndʙ"
        }
    }
    const final_alt_groups = {
        "u": [
            [["bb", "nb", "f", "v", "dd", "nd"], "ʊ"],
            [["m"], "̩"],
            [["hm"], "m̩"],
            [["l", "hl"], "̩˞ʷ"],
            [["j", "q", "jj", "nj", "ny", "x", "y"], "ʉ"]
        ],
        "ur": [
            [["b", "p", "bb", "nb"], "ʊ̙ᵊ"],
            [["f", "v", "d", "t", "dd", "nd", "n", "hn"], "ɵ̙ᵊ"],
            [["m"], "̙̍"],
            [["hm"], "m̙̍"],
            [["l", "hl"], "̙̩˞ʷ"]
        ],
        "y": [
            [["l", "hl"], "̩˞"]
        ],
        "yr": [
            [["l", "hl"], "̙̩˞"]
        ],
        "ie": [
            [["j", "q", "jj", "nj", "ny", "x", "y"], "ɛ̙ᵊ<sup>(~a̙)</sup>"]
        ]
    }
    if (final_alt_groups[final]) {
        for (let i of final_alt_groups[final]) {
            if (i[0].includes(initial)) {
                phonetic_ipa["final"] = i[1]
            }
        }
    }
    if (initial_alt[final] && initial_alt[final][initial]) {
        phonetic_ipa["initial"] = initial_alt[final][initial]
    }

    return {
        phonemic: initials[initial][0] + finals[final][0] + tones[toneMark][0],
        phonetic: phonetic_ipa["initial"] + phonetic_ipa["final"] + phonetic_ipa["tone"]
    }
}