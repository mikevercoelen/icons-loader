var path = require("path");
var crypto = require("crypto");
var Vinyl = require("vinyl");
var iconfont = require("gulp-iconfont");
var LoaderUtils = require("loader-utils");
var RawSource = require("webpack-core/lib/RawSource");
var ModuleAliasPlugin = require("enhanced-resolve/lib/ModuleAliasPlugin");
var NullFactory = require("webpack/lib/NullFactory");
var ConstDependency = require("webpack/lib/dependencies/ConstDependency");

function jsonDependency (objectFactory) {
    return function (expr) {
        var dep = new ConstDependency("(" + JSON.stringify(objectFactory()) + ")", expr.range);
        dep.loc = expr.loc;
        this.state.current.addDependency(dep);
        return true;
    };
}

function IconsPlugin (options) {
    options = options || {};
    this.options = {
        fontName: options.fontName || "icons",
        filenameTemplate: options.filenameTemplate || {
            name: "[name]-[hash].[ext]",
        },
    };

    this.glyphs = [];
    this.styles = {};
}

IconsPlugins.prototype.apply = function (compiler) {
    var plugin = this;

    compiler.resolvers.normal.apply(new ModuleAliasPlugin({
        "icons-loader": path.join(__dirname, "template.js"),
    }));

    var cache = {};

    compiler.plugin("compilation", function (compilation) {
        var cacheInvalid = false;

        compilation.dependencyFactories.set(ConstDependency, new NullFactory());
        compilation.dependencyTemplates.set(ConstDependency, new ConstDependency.Template());

        compilation.__iconsPlugin = { addIcon: function (content) {
            cacheInvalid = true;
            var id = "i" + crypto.createHash("sha1").update(new Buffer(content)).digest("hex");
            cache[id] = content;
            return id;
        } };

        compilation.plugin("optimize-tree", function (chunks, modules, callback) {
            if ( !cacheInvalid ) {
                return callback();
            }

            var stream = iconfont(plugin.options);

            plugin.glyphs = [];

            plugin.styles = {
                fontName: plugin.options.fontName,
            };

            stream.on("data", function (vinyl) {
                var assetType = path.extname(vinyl.path).substr(1);
                var assetName = LoaderUtils.interpolateName({
                    resourcePath: vinyl.path,
                }, plugin.options.filenameTemplate.name, {
                    content: vinyl.contents,
                    regExp: plugin.options.filenameTemplate.regExp,
                });

                plugin.styles[assetType] = assetName;
                compilation.assets[assetName] = new RawSource(vinyl.contents);
            });

            stream.on('glyphs', function (_glyphs) {
              plugin.glyphs = _glyphs;
            });

            stream.on("error", callback);

            stream.on("end", function () {
                var module = modules.filter(function (module) {
                    return module.rawRequest === "icons-loader";
                })[0];

                compilation.rebuildModule(module, callback);
            });

            Object.keys(cache).map(function (id) {
                return new Vinyl({
                    path: id + ".svg",
                    contents: new Buffer(cache[id]),
                });
            }).forEach(function (vinyl) {
                stream.write(vinyl);
            });

            process.nextTick(function () {
                stream.end();
            });
        });
    });

    compiler.parser.plugin("expression __FONT_ICON_PLUGIN_GLYPHS__", jsonDependency(function () {
        return plugin.glyphs;
    }));

    compiler.parser.plugin("expression __FONT_ICON_PLUGIN_STYLES__", jsonDependency(function () {
        return plugin.styles;
    }));
};

module.exports = IconsPlugin;
