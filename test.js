var Converter = require('./')
var assert = require('assert')

var con = new Converter()

// test conversion
assert.equal(con.replaceUnicode('❤️'), ':heart:')

assert.equal(con.replaceShortcodes(':heart:'), '❤️')

assert.equal( con.replaceShortcodes(':cross:'), '✝️')

assert.equal( con.replaceShortcodes(':latin_cross:'), '✝️')

assert.equal( con.normalizeShortcodes(':latin_cross:'), ':cross:')

assert.equal(con.replaceShortcodes('I:HEART:NY'),'I❤️NY')
assert.equal(con.replaceShortcodes('look at this: :heart:2:HEART:'),'look at this: ❤️2❤️')

assert.equal(con.replaceShortcodes('I:fizzgig:NY'),'I:fizzgig:NY')

assert.equal(con.replaceUnicode('❤️<= thats a heart'), ':heart:<= thats a heart')

assert.equal(con.replaceUnicode('❤️❤️<= thats 2 :heart:s'), ':heart::heart:<= thats 2 :heart:s')

// numbers stuff to test emojified numbers (and other ASCII-extended)
assert.equal(con.replaceUnicode('1\ufe0f'),':digit_one:')
assert.equal(con.replaceUnicode('1'),'1')
assert.equal(con.replaceShortcodes(':digit_one:'),'1\ufe0f')

assert.equal(con.replaceUnicode('©\ufe0f'),':copyright:')
assert.equal(con.replaceUnicode('©'),'©')
assert.equal(con.replaceShortcodes(':copyright:'),'©\ufe0f')

// ensure no ASCII things get turned into shortcodes
var asciiExtendedString = ''
for (var i = 0; i <= 255; i++){
    asciiExtendedString = asciiExtendedString + String.fromCharCode(i)
}
assert.equal(con.replaceUnicode(asciiExtendedString),asciiExtendedString)

// check that 月 stays not an emoji when replacing it (because it can be turned into an ideograph button)
var monthlyAmount = '月'
assert.equal(con.replaceUnicode(monthlyAmount),monthlyAmount)

// sadly even emoji_strategy.json doesn't give a good shortcode for these :(
assert.equal(con.replaceUnicode('🈷️'),':u6708:')

assert.equal(
    con.replaceWith(':heart:❤️:heart: tripleheart',function(unicode, shortcode, name){
        return `<img alt="${name}" src="${shortcode.replace(/\:/g,'')}.png"></img>`
    }),
    `<img alt="red heart" src="heart.png"></img><img alt="red heart" src="heart.png"></img><img alt="red heart" src="heart.png"></img> tripleheart`
)

// 1000 chars, mixed emoji and ascii
const testStr = `🐱📪📭🔬🌞🌀🤰🏼🔔🐏💅👪🐨📝 🈷️🈷️🈷️ sed tortor 1 2 123 © hello world it's me? velit hendrerit et at est 📘🔤🏡📎💮🐣 lacus ipsum? Quid ergo sud, 🎭🔸👄🐂🎨 🍖👉🍌💟🎤🍊👴🌸🎤👚🍴💐👭 🔬👣💴🔠🌴💼👜 sed cursus gravida 🍱🍗👨🌋🔄 🌏🔒🔓🍻 scelerisque fermentum eget duis feugiat tellus vestibulum lectus 🔅🐩👇💪. Mauris mollis 🎣🔳🍪🐹🎐 💄🕙🕣💭 💸📄🌘👜🎾🏄💎🐛📆🔅🎑🕙👝👝🐟🐀 eget tellus 💩🌘💕🗾🗻📆🔋 tellus tristique mauris urna 💹👴🌺🎏🕜👉🌚 👇📚🔩🐁🍥👩🏤🐜👏🏉🐼💠🐸🔵 commodo duis nulla mauris, integer risus 🐹🐗💉🔹 aliquam nunc viverra rhoncus, fringilla vel arcu, pharetra, 🏈🐪🕕🌎📥💬📎🌗🔰🏭🎱📟 amet, donec 🕞🎾💕👘 ut eget nullam amet mattis 💙🐧📙🎴 fermentum pretium sagittis, egestas pretium scelerisque facilisi dolor, 🐷🔯🐈👶💈 mattis aliquet semper sit 🎌🌋🐌🍔🐽 purus a faucibus 👽🍠🔂📙💄🐪💡🎼🍄🎦👚💑🍔👠🏃🌗 hendrerit 🎱🔬🎮👫 euismod porttitor vulputate id arcu, massa aenean nullam lectus. Aliquam sed 📥🔴🔵🐳🎈🕀 🐘🔛🌂🌜🗽💘🎸💹🌻🔂🔘🔖 🌇🐪📚🔅 vitae 🐸🐒💊📱👪📭🔣🐟 🐟💗💨🕖📹🏊🎠`
const shortcodeStr = con.replaceUnicode(testStr)
const mixedStr = testStr + shortcodeStr;

// ensure reversible (assuming preferred shortcode is used)
assert.equal(con.replaceShortcodes(con.replaceUnicode(testStr)), testStr)
assert.equal(con.replaceUnicode(con.replaceShortcodes(shortcodeStr)), shortcodeStr)

// convert to points string
var dude = con.replaceShortcodes(':man_gesturing_ok_tone5:')
assert.equal(Converter.unicodeToPointsString(dude),'1f646-1f3ff-200d-2642-fe0f')

//////////////////////////////////// affirm demos work correctly
var converter = new Converter()
assert.equal(converter.replaceShortcodes('I:heart:NY'), 'I❤️NY')

var converter = new Converter()
assert.equal(converter.replaceUnicode("❤️~~🐧~~❤️"), ":heart:~~:penguin:~~:heart:")

// custom HTML rendering
var converter = new Converter()
var str = ':heart: its me, 🦃!'
function renderEmojiHowIWant(unicodeChar, shortcode, name){
  var codepointString = Converter.unicodeToPointsString(unicodeChar)
  return `<img alt="${name}" src="emojis/folder/${codepointString}.png"></img>`
}
var htmlified = converter.replaceWith(str,renderEmojiHowIWant)
assert.equal(htmlified, '<img alt="red heart" src="emojis/folder/2764-fe0f.png"></img> its me, <img alt="turkey" src="emojis/folder/1f983.png"></img>!')

// custom emoji, prefer unicode
var emojiData = [
    { shortname: ':charizard:', url: "http://somewhere.com/charizard.png" }
]
var converter = new Converter([Converter.EMOJI_DEFAULT_SOURCE, emojiData])
var chatText = ':charizard: ❤️ :pancakes: :wow:'
var pokemanned = converter.replaceShortcodesWith(chatText, function(unicodeChar, shortcode, name, object){
    if (unicodeChar){return unicodeChar}
    else if (object.url){return `<img src="${object.url}" alt="${name}" title="${name}"/>`}
    else{ return shortcode }
})
assert.equal(pokemanned, '<img src="http://somewhere.com/charizard.png" alt="charizard" title="charizard"/> ❤️ 🥞 :wow:')

// plain text replacement
var replacements = [
    { shortname: ":heart:", unicode: '❤', terminalReplacement: '<3'},
    { shortname: ":heart:", unicode: '❤️', terminalReplacement: '<3'},
    { shortname: ":blush:", unicode: '😊', terminalReplacement: '^__^'},
    { shortname: ":simple_smile:", unicode: '🙂', terminalReplacement: ':)'},
    { shortname: ":smiley:", unicode: '😃', terminalReplacement: ':D'},
    {shortname: ':laughing:', unicode: '😆', terminalReplacement: 'XD'}
]
var converter = new Converter([Converter.EMOJI_DEFAULT_SOURCE, replacements])

var chatText = 'I ❤ ❤️ Unicode 🙂, but I also :heart: short codes 😊! (and 🍬 😆)'

var terminalSafe = converter.replaceWith(chatText, function(unicodeChar, shortcode, name, object){
    return object.terminalReplacement || shortcode || unicodeChar
})
assert.equal(terminalSafe, 'I <3 <3 Unicode :), but I also <3 short codes ^__^! (and :candy: XD)')


////////////// timing stuff for fun
console.time('shortcode=>unicode x1000')
for (var i = 0; i < 1000; i++){
    con.replaceUnicode(mixedStr)
}
console.timeEnd('shortcode=>unicode x1000')

console.time('unicode=>shortcode x1000')
for (var i = 0; i < 1000; i++){
    con.replaceShortcodes(mixedStr)
}
console.timeEnd('unicode=>shortcode x1000')

function customReplacer(unicode, short, name, object){
    return unicode + short + name
}

// note, this operation replaces 2x as many emojis as the others
console.time("custom replacer x1000")
for (var i = 0; i < 1000; i++){
    con.replaceWith(mixedStr, customReplacer)
}
console.timeEnd("custom replacer x1000")

console.time("custom replacer (unicode only) x1000")
for (var i = 0; i < 1000; i++){
    con.replaceUnicodeWith(mixedStr, customReplacer)
}
console.timeEnd("custom replacer (unicode only) x1000")

console.time("custom replacer (shortcode only) x1000")
for (var i = 0; i < 1000; i++){
    con.replaceShortcodesWith(mixedStr, customReplacer)
}
console.timeEnd("custom replacer (shortcode only) x1000")

var customConverter = new Converter([
    [
        {url: "https://website.com/1.png", shortname: ":charizard:"},
        {url: "https://website.com/2.png", shortname: ":pikachu:"},
        {url: "https://website.com/3.png", shortname: ":squirtle:"},
        {url: "https://website.com/4.png", shortname: ":raichu:"},
        {url: "https://website.com/5.png", shortname: ":bulbasaur:"},
        {url: "https://website.com/6.png", shortname: ":piddlypoof:"}
    ]
])

function urlReplacer(unicode, short, name, object){
    if (object.url) return `<img src="${object.url}" alt="${name}"/>`
    else return short
}

var pokemonStr = `here's some pokemans: :charizard: :squirtle: :pokeball: :happy:. They are realy cool and my frens`

console.time("URL replacer x1000")
for (var i = 0; i < 1000; i ++){
    customConverter.replaceShortcodesWith(pokemonStr, urlReplacer)
}
console.timeEnd("URL replacer x1000")
