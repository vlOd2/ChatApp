const clients: string[] = [];
const sockets: WebSocket[] = [];
const chatHistory: string[] = [];

function socketHandler(req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) {
    if (req.method != "GET") {
        return json({ error: "Method not allowed" }, 405);
    }
    if (req.headers.get("upgrade") != "websocket") {
        return new Response(null, { status: 426 });
    }
    const { socket, response } = Deno.upgradeWebSocket(req);

    socket.onopen = () => {
        console.log(info.remoteAddr, "Connected");
        sockets.push(socket);
    };
    socket.onclose = () => {
        console.log(info.remoteAddr, "Disconnected");
        const index = sockets.indexOf(socket);
        if (index != -1) {
            sockets.splice(index, 1);
        }
    };
    socket.onerror = (err) => {
        console.error("Socket error:", err);
    };

    return response;
}

function json(data: unknown, statusCode: number): Response {
    return new Response(JSON.stringify(data), {
        status: statusCode,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0"
        }
    });
}

async function handler(req: Request, info: Deno.ServeHandlerInfo<Deno.NetAddr>) {
    const url = new URL(req.url);

    switch (url.pathname) {
        case "/clients":
            if (req.method == "GET") {
                return json({ clients }, 200);
            } else if (req.method === "POST") {
                const { name } = await req.json();
                clients.push(name);
                console.log(`Client added: ${name}`);
                return json({ message: "Client added" }, 201);
            } else if (req.method === "DELETE") {
                const { name } = await req.json();
                const index = clients.indexOf(name);
                if (index !== -1) {
                    clients.splice(index, 1);
                    console.log(`Client removed: ${name}`);
                    return json({ message: "Client removed" }, 200);
                } else {
                    return json({ error: "Client not found" }, 404);
                }
            }
            break;

        case "/chat":
            if (req.method == "GET") {
                return json({ chatHistory }, 200);
            } else if (req.method == "POST") {
                const { client, body } = await req.json();
                const msg = `${client}: ${body}`;
                chatHistory.push(msg);
                for (const socket of sockets) {
                    socket.send(msg);
                }
                return json({ message: "Message added" }, 201);
            }
            break;

        case "/chat/socket":
            return socketHandler(req, info);
    }

    return json({ error: "Not found" }, 404);
}

Deno.serve({ port: 8000 }, handler);
