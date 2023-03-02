/**
 * [ISO 15924 Script Names](https://en.wikipedia.org/wiki/ISO_15924#List_of_codes)
 * cspell:disable
 */
const src = `\
Code	ISO formal name
Adlm	Adlam
Afak	Afaka
Aghb	Caucasian Albanian
Ahom	Ahom, Tai Ahom
Arab	Arabic
Aran	Arabic (Nastaliq variant)
Armi	Imperial Aramaic
Armn	Armenian
Avst	Avestan
Bali	Balinese
Bamu	Bamum
Bass	Bassa Vah
Batk	Batak
Beng	Bengali (Bangla)
Bhks	Bhaiksuki
Blis	Blissymbols
Bopo	Bopomofo
Brah	Brahmi
Brai	Braille
Bugi	Buginese
Buhd	Buhid
Cakm	Chakma
Cans	Unified Canadian Aboriginal Syllabics
Cari	Carian
Cham	Cham
Cher	Cherokee
Chrs	Chorasmian
Cirt	Cirth
Copt	Coptic
Cpmn	Cypro-Minoan
Cprt	Cypriot syllabary
Cyrl	Cyrillic
Cyrs	Cyrillic (Old Church Slavonic variant)
Deva	Devanagari (Nagari)
Diak	Dives Akuru
Dogr	Dogra
Dsrt	Deseret (Mormon)
Dupl	Duployan shorthand, Duployan stenography
Egyd	Egyptian demotic
Egyh	Egyptian hieratic
Egyp	Egyptian hieroglyphs
Elba	Elbasan
Elym	Elymaic
Ethi	Ethiopic (Geʻez)
Geok	Khutsuri (Asomtavruli and Nuskhuri)
Geor	Georgian (Mkhedruli and Mtavruli)
Glag	Glagolitic
Gong	Gunjala Gondi
Gonm	Masaram Gondi
Goth	Gothic
Gran	Grantha
Grek	Greek
Gujr	Gujarati
Guru	Gurmukhi
Hanb	Han with Bopomofo (alias for Han + Bopomofo)
Hang	Hangul (Hangŭl, Hangeul)
Hani	Han (Hanzi, Kanji, Hanja)
Hano	Hanunoo (Hanunóo)
Hans	Han (Simplified variant)
Hant	Han (Traditional variant)
Hatr	Hatran
Hebr	Hebrew
Hira	Hiragana
Hluw	Anatolian Hieroglyphs (Luwian Hieroglyphs, Hittite Hieroglyphs)
Hmng	Pahawh Hmong
Hmnp	Nyiakeng Puachue Hmong
Hrkt	Japanese syllabaries (alias for Hiragana + Katakana)
Hung	Old Hungarian (Hungarian Runic)
Inds	Indus (Harappan)
Ital	Old Italic (Etruscan, Oscan, etc.)
Jamo	Jamo (alias for Jamo subset of Hangul)
Java	Javanese
Jpan	Japanese (alias for Han + Hiragana + Katakana)
Jurc	Jurchen
Kali	Kayah Li
Kana	Katakana
Kawi	Kawi
Khar	Kharoshthi
Khmr	Khmer
Khoj	Khojki
Kitl	Khitan large script
Kits	Khitan small script
Knda	Kannada
Kore	Korean (alias for Hangul + Han)
Kpel	Kpelle
Kthi	Kaithi
Lana	Tai Tham (Lanna)
Laoo	Lao
Latf	Latin (Fraktur variant)
Latg	Latin (Gaelic variant)
Latn	Latin
Leke	Leke
Lepc	Lepcha (Róng)
Limb	Limbu
Lina	Linear A
Linb	Linear B
Lisu	Lisu (Fraser)
Loma	Loma
Lyci	Lycian
Lydi	Lydian
Mahj	Mahajani
Maka	Makasar
Mand	Mandaic, Mandaean
Mani	Manichaean
Marc	Marchen
Maya	Mayan hieroglyphs
Medf	Medefaidrin (Oberi Okaime, Oberi Ɔkaimɛ)
Mend	Mende Kikakui
Merc	Meroitic Cursive
Mero	Meroitic Hieroglyphs
Mlym	Malayalam
Modi	Modi, Moḍī
Mong	Mongolian
Moon	Moon (Moon code, Moon script, Moon type)
Mroo	Mro, Mru
Mtei	Meitei Mayek (Meithei, Meetei)
Mult	Multani
Mymr	Myanmar (Burmese)
Nagm	Nag Mundari
Nand	Nandinagari
Narb	Old North Arabian (Ancient North Arabian)
Nbat	Nabataean
Newa	Newa, Newar, Newari, Nepāla lipi
Nkdb	Naxi Dongba (na²¹ɕi³³ to³³ba²¹, Nakhi Tomba)
Nkgb	Nakhi Geba (na²¹ɕi³³ gʌ²¹ba²¹, 'Na-'Khi ²Ggŏ-¹baw, Nakhi Geba)
Nkoo	N’Ko
Nshu	Nüshu
Ogam	Ogham
Olck	Ol Chiki (Ol Cemet’, Ol, Santali)
Orkh	Old Turkic, Orkhon Runic
Orya	Oriya (Odia)
Osge	Osage
Osma	Osmanya
Ougr	Old Uyghur
Palm	Palmyrene
Pauc	Pau Cin Hau
Pcun	Proto-Cuneiform
Pelm	Proto-Elamite
Perm	Old Permic
Phag	Phags-pa
Phli	Inscriptional Pahlavi
Phlp	Psalter Pahlavi
Phlv	Book Pahlavi
Phnx	Phoenician
Piqd	Klingon (KLI pIqaD)
Plrd	Miao (Pollard)
Prti	Inscriptional Parthian
Psin	Proto-Sinaitic
Qaaa-Qabx	Reserved for private use (range)
Ranj	Ranjana
Rjng	Rejang (Redjang, Kaganga)
Rohg	Hanifi Rohingya
Roro	Rongorongo
Runr	Runic
Samr	Samaritan
Sara	Sarati
Sarb	Old South Arabian
Saur	Saurashtra
Sgnw	SignWriting
Shaw	Shavian (Shaw)
Shrd	Sharada, Śāradā
Shui	Shuishu
Sidd	Siddham, Siddhaṃ, Siddhamātṛkā
Sind	Khudawadi, Sindhi
Sinh	Sinhala
Sogd	Sogdian
Sogo	Old Sogdian
Sora	Sora Sompeng
Soyo	Soyombo
Sund	Sundanese
Sunu	Sunuwar
Sylo	Syloti Nagri
Syrc	Syriac
Syre	Syriac (Estrangelo variant)
Syrj	Syriac (Western variant)
Syrn	Syriac (Eastern variant)
Tagb	Tagbanwa
Takr	Takri, Ṭākrī, Ṭāṅkrī
Tale	Tai Le
Talu	New Tai Lue
Taml	Tamil
Tang	Tangut
Tavt	Tai Viet
Telu	Telugu
Teng	Tengwar
Tfng	Tifinagh (Berber)
Tglg	Tagalog (Baybayin, Alibata)
Thaa	Thaana
Thai	Thai
Tibt	Tibetan
Tirh	Tirhuta
Tnsa	Tangsa
Toto	Toto
Ugar	Ugaritic
Vaii	Vai
Visp	Visible Speech
Vith	Vithkuqi
Wara	Warang Citi (Varang Kshiti)
Wcho	Wancho
Wole	Woleai
Xpeo	Old Persian
Xsux	Cuneiform, Sumero-Akkadian
Yezi	Yezidi
Yiii	Yi
Zanb	Zanabazar Square (Zanabazarin Dörböljin Useg, Xewtee Dörböljin Bicig, Horizontal Square Script)
Zinh	Code for inherited script
Zmth	Mathematical notation
Zsym	Symbols
Zsye	Symbols (emoji variant)
Zxxx	Code for unwritten documents
Zyyy	Code for undetermined script
Zzzz	Code for uncoded script
`;
// cspell:enable

export type ScriptCodeEntry = [code: string, name: string];

export const scriptCodes = src.split('\n').map((line) => line.split('\t') as ScriptCodeEntry);
