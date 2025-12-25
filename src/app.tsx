import { Dispatch, useState } from "react";
import { render } from "react-dom";
import { fetchPostWrapper, fetchWrapper, socketWrapper } from "./utils";

function stubHook<T>(): [T, Dispatch<React.SetStateAction<T>>] {
    return [undefined as any, () => {}];
}

let host: string;
let gatewaySocket: WebSocket | undefined = undefined;
let [username, setUsername] = stubHook<string>();
let [connected, setConnected] = stubHook<boolean>();
let [logs, setLogs] = stubHook<string[]>();
let [clientList, setClientList] = stubHook<string[]>();

function log(message: string) {
    console.log(message);
    setLogs((prevLogs) => [...prevLogs, message]);
}

async function connect(h: string) {
    if (gatewaySocket) {
        gatewaySocket.close();
    }

    host = h;
    log(`Host: ${h}`);
    log("Connecting...");
    setConnected(true);

    try {
        gatewaySocket = await socketWrapper(
            `ws://${host}/chat/socket`,
            (e) => {
                log(e.data);
            },
            (err) => {
                if (!err) log("Connection closed");
                disconnect(true);
            }
        );

        log("Logging in...");
        await fetchPostWrapper(`http://${host}/clients`, { name: username });

        console.log("Fetching client list...");
        const { clients } = await fetchWrapper<{ clients: string[] }>(`http://${host}/clients`);
        setClientList(clients);

        console.log("Fetching chat history...");
        const { chatHistory } = await fetchWrapper<{ chatHistory: string[] }>(`http://${host}/chat`);
        setLogs(chatHistory);
        console.log("Chat history loaded", chatHistory);

        log("Connected");
    } catch (err) {
        console.error(err);
        log("Connection failed");
        disconnect(true);
    }
}

function disconnect(noMsg: boolean = false) {
    setConnected(false);
    setClientList([]);
    if (connected && gatewaySocket) {
        fetchPostWrapper(`http://${host}/clients`, { name: username }, "DELETE").catch((_) => {});
        gatewaySocket.close();
        gatewaySocket = undefined;
    }
    if (!noMsg) log("Disconnected");
}

function Actions() {
    return (
        <div className="actions">
            {connected ? (
                <>
                    <span className="status">Connected as {username}</span>
                    <button onClick={() => disconnect(false)}>Disconnect</button>
                </>
            ) : (
                <>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.currentTarget.value)}
                    />
                    <button
                        onClick={() => {
                            const host = prompt("Enter host:", "192.168.0.2:8000");
                            if (host) {
                                connect(host);
                            }
                        }}
                    >
                        Connect
                    </button>
                </>
            )}
            <button
                onClick={() => {
                    console.log("Clearing logs");
                    setLogs([]);
                }}
            >
                Clear
            </button>
            {connected && (
                <>
                    <br />
                    <span className="status">Clients connected: {clientList.join(", ")}</span>
                </>
            )}
        </div>
    );
}

function ChatInput() {
    const [message, setMessage] = useState("");
    const [sendDisabled, setSendDisabled] = useState(false);

    async function sendMessage() {
        const msg = message.trim();
        console.log(msg, msg.length);
        if (!gatewaySocket || !connected || !msg) {
            console.log("Cannot send message: not connected or empty message");
            return;
        }
        setSendDisabled(true);
        try {
            await fetchPostWrapper(`http://${host}/chat`, { client: username, body: msg });
        } catch (err) {
            console.error(err);
            log("Failed to send message");
        } finally {
            setSendDisabled(false);
            setMessage("");
        }
    }

    return (
        <div className="chat-input">
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.currentTarget.value)}
                onKeyDown={(e) => {
                    if (e.key == "Enter") {
                        console.log("Enter pressed, sending message");
                        sendMessage();
                    }
                }}
                readOnly={!connected || sendDisabled}
                disabled={!connected || sendDisabled}
            />
            <button onClick={sendMessage} disabled={!connected || sendDisabled}>
                Send
            </button>
        </div>
    );
}

function App() {
    [username, setUsername] = useState<string>(new ActiveXObject("WScript.Network").UserName ?? "User");
    [connected, setConnected] = useState(false);
    [logs, setLogs] = useState<string[]>([]);
    [clientList, setClientList] = useState<string[]>([]);

    return (
        <>
            <h1>HTA Chat</h1>
            <Actions />
            <textarea readOnly value={logs.join("\n")} />
            <ChatInput />
        </>
    );
}

render(<App />, document.getElementById("app")!);
