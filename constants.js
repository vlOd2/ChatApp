const path = require("path");

const MINIFY = true;
const ROOT_DIR = path.resolve(__dirname);
const MODULES_DIR = path.resolve(ROOT_DIR, "node_modules");
const SRC_DIR = path.resolve(ROOT_DIR, "src");
const OUT_DIR = path.resolve(ROOT_DIR, "dist");
const libraries = [
    path.resolve(ROOT_DIR, "lib", "iecheck.js"),
    path.resolve(MODULES_DIR, "whatwg-fetch", "dist", "fetch.umd.js")
];

if (!MINIFY) {
    // Uncomment this to use the HTAConsole
    // libraries.push(path.resolve(ROOT_DIR, "lib", "htaconsole.js"));
    // Comment this if you use HTAConsole (they aren't compatible with each other)
    libraries.push(path.resolve(ROOT_DIR, "lib", "remoteconsole.js"));
}

module.exports = {
    MINIFY,
    ROOT_DIR,
    MODULES_DIR,
    SRC_DIR,
    OUT_DIR,
    libraries
};
