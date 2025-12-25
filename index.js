const fs = require("fs");
const path = require("path");
const { OUT_DIR } = require("./constants");
const buildBundle = require("./tools/bundle");
const assembleHTA = require("./tools/hta");

function clean() {
    fs.rmSync(path.join(OUT_DIR, "_app.bundle.js"), { force: true });
    fs.rmSync(path.join(OUT_DIR, "_app.bable.js"), { force: true });
    fs.rmSync(path.join(OUT_DIR, "_app.js"), { force: true });
    fs.rmSync(path.join(OUT_DIR, "app.hta"), { force: true });
    fs.rmSync(path.join(OUT_DIR, "app.html"), { force: true });
}

function main() {
    console.log("Cleaning...");
    clean();

    console.time("Total build time");
    console.log("Building...");
    buildBundle();

    console.log("Assembling...");
    assembleHTA();

    console.log("Done!");
    console.timeEnd("Total build time");
}

main();
