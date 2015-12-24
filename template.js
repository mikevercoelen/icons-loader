var GLYPHS = processGlyphs(__ICONS_PLUGIN_GLYPHS__);
var STYLES = __ICONS_PLUGIN_STYLES__;

function processGlyphs (glyphs) {
  glyphs.forEach(function (glyph) {
    glyph.character = glyph.unicode[0].charCodeAt(0).toString(16);
  });

  return glyphs;
}

function fontAsset (type, format, query) {
    return "url(" + JSON.stringify(__webpack_public_path__ + STYLES[type] + (query || "")) + ") format(" + JSON.stringify(format || type) + ")";
}

var css =
    "@font-face{" +
        "font-family:" + JSON.stringify(STYLES.fontName) + ";" +
        "font-weight:normal;" +
        "src:" + fontAsset("eot") + ";" +
        "src:" +
            fontAsset("eot", "eot", "?#iefix") + "," +
            fontAsset("woff") + "," +
            fontAsset("ttf", "truetype") + "," +
            fontAsset("svg", "svg", "#" + STYLES.fontName) + ";" +
    "}";


for ( var i = 0; i < GLYPHS.length; i++ ) {
  var glyph = GLYPHS[i];

  exports[GLYPHS[i].name] = {
    character: glyph.character,
    fontName: STYLES.fontName,
    unicode: glyph.unicode
  };
}

exports.glyphs = GLYPHS;
exports.css = css;
exports.fontName = STYLES.fontName;
