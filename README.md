# Neato-emoji-converter

Convert to and from actual emoji (💖), short codes (`:pizza:`), and to arbitrary formats. Supports custom emoji for any unicode sequence and/or shortcode.

# Documentation

This package exposes one class, Converter.

## `new EmojiConverter([sources = [ Converter.EMOJI_DEFAULT_SOURCE] ])`

Returns a converter instance. The default constructor initializes it with the official Unicode emojis. You can specify different sources.

A source should be an array of objects, each object representing an emoji. Each should have at least a `shortname` (needs to be surrounded with colons), optionally a `name`, optionally a `unicode` (the actual unicode character), and optionally a `shortname_alternates` (an array of alternate shortnames, each surrouned with colons). You can also provide any other options you want to these objects and they will be available to a custom replacer. Sources are applied from left to right (rightmost source has most priority).

## The Converter Instance

### `converterInstance.replaceUnicode(str)`

Replace unicode emoji in a string with `:shortcode:`s.

### `converterInstance.replaceShortcodes(str)`

replace `:shortcode:`s with unicode emojis in a string

### `converterInstance.replaceShortcodesWith(str, replacer)`

Every `:shortcode:` emoji that you have defined in your sources will be replaced with the function you specify.

The function is called with `(unicodeCharacter, shortcode, emojiName, emojiObject)`. `emojiObject` is the original emoji object from the source provided in the constructor.

### `converterInstance.replaceUnicodeWith(str, replacer)`

Same as `replaceShortcodesWith`, but operates only on unicode emojis that are recognized..

### `converterInstance.replaceWith(str, replacer)`

Same as `replaceShortcodesWith`, but operates on short code and unicode emojis that are recognized.

### `converterInstance.normalizeShortcodes(str)`

Sometimes emojis have multiple names (such as `:celtic_cross:` vs `:cross:`). This will ensure the canonical one is used.

## Converter Prototype

### `Converter.EMOJI_DEFAULT_SOURCE`

This is the default source of emojis, it allows the converter to find all official unicode emoji.

### `Converter.unicodeToPointsString(unicodeStr)`

converts, for example,  `'🙆🏿‍♂️'` to `'1f646-1f3ff-2642'`

# Examples

## Shortcodes to Unicode

```js
let EmojiConverter = require('neato-emoji-converter')

var converter = new EmojiConverter()
converter.replaceShortcodes('I:heart:NY')
// => "I❤NY"
```

## Unicode to shortcodes
```js
var converter = new EmojiConverter()
converter.replaceUnicode("❤~~🐧~~❤")
// => ":heart:~~:penguin:~~:heart:"
```

## Custom HTML rendering of official Emoji
```js
var converter = new EmojiConverter()

var str = ':heart: its me, 🦃!'

function renderEmojiHowIWant(unicodeChar, shortcode, name){
  var codepointString = Converter.unicodeToPointsString(unicodeChar)
  return `<img alt="${name}" src="emojis/folder/${codepointString}.png"></img>`
}

var htmlified = converter.replaceUnicodeWith(str,renderEmojiHowIWant)
// => '<img alt="red heart" src="emojis/folder/2764.png"></img> its me, <img alt="turkey" src="emojis/folder/1f983.png"></img>!'
```

## Advanced: add custom Emoji as `<img>` tags, convert other shortcodes to unicode
```js
var emojiData = [
  { shortname: ':charizard:', url: "http://somewhere.com/charizard.png" }
]
var converter = new EmojiConverter([Converter.EMOJI_DEFAULT_SOURCE, emojiData])
var chatText = ':charizard: ❤ :pancakes: :wow:'
var pokemanned = converter.replaceShortcodesWith(chatText, function(unicodeChar, shortcode, name, object){
   if (unicodeChar){return unicodeChar}
   else if (object.url){return `<img src="${object.url}" alt="${name}" title="${name}"/>`}
   else{ return shortcode }
})
// =>'<img src="http://somewhere.com/charizard.png" alt="charizard" title="charizard"/> ❤ 🥞 :wow:'
```

## Advanced: plain-text replacement
```js
var replacements = [
  { shortname: ":heart:", unicode: '❤', terminalReplacement: '<3'},
  { shortname: ":happy:", unicode: '😊', terminalReplacement: ':)'}
]
var converter = new EmojiConverter([Converter.EMOJI_DEFAULT_SOURCE, replacements])

var chatText = 'I ❤ Unicode, but I also :heart: short codes 😊! (and 🎂)'

converter.replaceWith(chatText, function(unicodeChar, shortcode, name, object){
  return object.terminalReplacement || shortcode
})
// => 'I <3 Unicode, but I also <3 short codes :)! (and :birthday:)'
```