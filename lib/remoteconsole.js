/* eslint-disable */
(function () {
    /** @type {WebSocket} */
    var socket = undefined;
    let instance = {
        init: init,
        connect: connect,
        handleErrors: false
    };

    function sendArgs(args) {
        if (!socket) return;
        var msg = "";
        for (var i = 0; i < args.length; i++) {
            var str = "";

            if (typeof args[i] === "object") {
                try {
                    str = JSON.stringify(args[i]);
                } catch (e) {
                    str = args[i].toString();
                }
            } else {
                str = args[i].toString();
            }

            msg += str + " ";
        }
        socket.send(msg);
    }

    function init() {
        document.addEventListener(
            "keydown",
            function (evt) {
                if (evt.keyCode === 123) {
                    connect();
                }
            },
            true
        );
        window.console = {
            log: function () {
                var args = Array.prototype.slice.call(arguments);
                args = [].concat.apply([], args);
                sendArgs(args);
            },
            info: function () {
                var args = Array.prototype.slice.call(arguments);
                args = ["[INFO]"].concat.apply([], args);
                sendArgs(args);
            },
            warn: function () {
                var args = Array.prototype.slice.call(arguments);
                args = ["[WARN]"].concat.apply([], args);
                sendArgs(args);
            },
            error: function () {
                var args = Array.prototype.slice.call(arguments);
                args = ["[ERROR]"].concat.apply([], args);
                sendArgs(args);
            },
            clear: function () {
                if (!socket) return;
                socket.send("\x1B\xDE\xAD\xBE\xEF");
            }
        };
        window.onerror = console.onerror = function (msg, url, lineNo, columnNo, error) {
            if (!socket) return false;
            socket.send(error.stack);
            return instance.handleErrors;
        };
        connect();
    }

    function connect() {
        if (socket) {
            socket.close();
            socket.send("");
            setTimeout(connect, 500);
            return;
        }
        socket = new WebSocket("ws://localhost:13254/");
        socket.onopen = function (event) {
            socket.send("[CLIENT] Remote console connected");
        };
        socket.onmessage = function (event) {
            try {
                var evalCmd = eval(event.data);
                if (typeof evalCmd === "object") {
                    console.log(JSON.stringify(evalCmd));
                } else {
                    console.log(evalCmd);
                }
            } catch (err) {
                console.error(err);
            }
        };
        socket.onclose = function (event) {
            socket = undefined;
            alert("Lost connection to remote console");
        };
    }

    return (window._rc = instance);
})().init();
