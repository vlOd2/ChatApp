const ts = require("typescript");
const babel = require("@babel/standalone");
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");
const { MINIFY, MODULES_DIR, SRC_DIR, OUT_DIR } = require("../constants");

/**
 * @param {string} code
 * @return {string}
 */
function transpileBabel(code) {
    const result = babel.transform(code, {
        presets: [
            [
                "env",
                {
                    targets: { ie: "11" },
                    useBuiltIns: "usage",
                    corejs: 3
                }
            ]
        ],
        compact: MINIFY,
        minified: MINIFY,
        comments: !MINIFY
    });
    if (!result || !result.code) {
        return undefined;
    }
    return result.code;
}

/** @return {boolean} */
function compileApp() {
    const configFile = ts.findConfigFile(SRC_DIR, ts.sys.fileExists, "tsconfig.json");
    if (!configFile) {
        throw Error("Could not find typescript config");
    }

    /** @type {ts.CompilerOptions} */
    const options = {
        outDir: OUT_DIR,
        noEmitOnError: true,
        incremental: true,
        tsBuildInfoFile: path.join(OUT_DIR, ".tsbuildinfo"),
        removeComments: MINIFY
    };

    const { config } = ts.readConfigFile(configFile, ts.sys.readFile);
    const { options: cfgOptions, fileNames, errors } = ts.parseJsonConfigFileContent(config, ts.sys, SRC_DIR);
    const program = ts.createIncrementalProgram({
        rootNames: fileNames,
        options: Object.assign({}, cfgOptions, options),
        configFileParsingDiagnostics: errors
    });

    const emitResult = program.emit();
    const diags = [...ts.getPreEmitDiagnostics(program.getProgram()), ...emitResult.diagnostics];

    for (const d of diags) {
        let log;

        if (d.file) {
            const { line, character } = ts.getLineAndCharacterOfPosition(d.file, d.start);
            const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
            log = `${d.file.fileName} (${line + 1},${character + 1}): ${message}`;
        } else {
            log = ts.flattenDiagnosticMessageText(d.messageText, "\n");
        }

        switch (d.category) {
            case ts.DiagnosticCategory.Error:
                console.error(log);
                break;

            case ts.DiagnosticCategory.Warning:
                console.warn(log);
                break;

            case ts.DiagnosticCategory.Message:
                console.info(log);
                break;
        }
    }

    return !emitResult.emitSkipped;
}

/** @return {string} */
function assembleApp() {
    /** @type {esbuild.BuildOptions} */
    const buildOptions = {
        write: false,
        bundle: true,
        minify: MINIFY,
        entryPoints: [path.join(OUT_DIR, "app.js")],
        platform: "browser",
        alias: {}
    };

    if (!MINIFY) {
        buildOptions.alias = {
            ...buildOptions.alias,
            ...{
                preact: path.resolve(MODULES_DIR, "preact/src/index.js"),
                "preact/hooks": path.resolve(MODULES_DIR, "preact/hooks/src/index.js"),
                "preact/compat": path.resolve(MODULES_DIR, "preact/compat/src/index.js")
            }
        };
    }

    const result = esbuild.buildSync(buildOptions);
    if (result.errors.length > 0) {
        return undefined;
    }

    return result.outputFiles[0].text;
}

module.exports = function () {
    const success = compileApp(SRC_DIR, OUT_DIR);
    if (!success) {
        throw new Error("Build failed");
    }

    const appBundle = assembleApp();
    if (!appBundle) {
        throw new Error("Bundle failed");
    }
    fs.writeFileSync(path.join(OUT_DIR, "_app.bundle.js"), appBundle, "utf8");

    const transpiledBundle = transpileBabel(appBundle);
    if (!transpiledBundle) {
        throw new Error("Transpile failed");
    }
    fs.writeFileSync(path.join(OUT_DIR, "_app.babel.js"), transpiledBundle, "utf8");

    // needed so core-js polyfills are included
    // also ensures the final bundle is ie11 compatible
    const finalBundle = esbuild.buildSync({
        write: false,
        bundle: true,
        minify: MINIFY,
        entryPoints: [path.join(OUT_DIR, "_app.babel.js")],
        platform: "browser",
        target: ["ie11"]
    }).outputFiles[0].text;

    if (!finalBundle) {
        throw new Error("Final bundle failed");
    }

    fs.writeFileSync(path.join(OUT_DIR, "_app.js"), finalBundle, "utf8");
};
