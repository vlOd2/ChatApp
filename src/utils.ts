export async function fetchWrapper<T>(endpoint: string): Promise<T> {
    const response = await fetch(endpoint);
    const body = await response.text();

    let parsedBody = undefined;
    try {
        parsedBody = JSON.parse(body);
    } catch {}

    if (!response.ok || !parsedBody) {
        console.error(body);
        if (parsedBody && parsedBody.error) {
            throw new Error(parsedBody.error);
        }
        throw new Error("An unknown error has occured");
    }

    if (!(parsedBody satisfies T)) {
        throw new Error("Response does not satisfy expected type");
    }

    return parsedBody;
}

export async function fetchPostWrapper<T>(endpoint: string, data: any, method: string = "POST"): Promise<T> {
    const response = await fetch(endpoint, {
        method,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    const body = await response.text();

    let parsedBody = undefined;
    try {
        parsedBody = JSON.parse(body);
    } catch {}

    if (!response.ok || !parsedBody) {
        console.error(body);
        if (parsedBody && parsedBody.error) {
            throw new Error(parsedBody.error);
        }
        throw new Error("An unknown error has occured");
    }

    if (!(parsedBody satisfies T)) {
        throw new Error("Response does not satisfy expected type");
    }

    return parsedBody;
}

export function socketWrapper(
    url: string,
    onMessage: (e: MessageEvent<any>) => void,
    onDisconnect: (err: boolean) => void
): Promise<WebSocket> {
    return new Promise<WebSocket>((resolve, reject) => {
        let socket = new WebSocket(url);
        socket.onopen = () => resolve(socket);
        socket.onclose = () => onDisconnect(false);
        socket.onerror = (error) => {
            onDisconnect(true);
            reject(error);
        };
        socket.onmessage = onMessage;
    });
}

export function getErrorMsg(error: any): string {
    return error instanceof Error ? error.message : error;
}
