# ChatApp
Extremely simple [HTA](https://en.wikipedia.org/wiki/HTML_Application) chatting app that is overengineered

### You need to have Internet Explorer 11 installed (or Windows 11) in order to use this app!

# Building/Running
## Client
You will need [node.js](https://nodejs.org/en/download) installed

Begin by installing the modules:
```
npm install
```

The run `index.js`:
```
node index.js
```

This may give you either a minified or non minified build in the `dist` folder (you can change this by editing `MINIFY` in `constants.js`, the value of it varies by commit)

There is no hot-reloading yet, so you will have to re-build the client everytime you make a change

In order to see console messages, you have a few options (you will need a non-minified build regardless):
- using the remote console (`tools\remote_console.py`)
- using [HTAConsole](https://github.com/jeremyben/HTAConsole), see `constants.js`
- running the html (generated alongside the hta) in Internet Explorer 11 and using it's dev tools

> [!TIP]
> You can force the client to reconnect to the remote console by pressing F12

## Server
The server is located in the `Server` folder

You will need [deno](https://deno.com) installed

Afterwards, just run the `dev` task:
```
deno task dev
```

# Framework
The app uses React 17 and Typescript via a custom build system (named TS2HTA)

TS2HTA uses Babel and ESBuild for bundling

The following polyfills are used:
- core-js
- whatwg-fetch
