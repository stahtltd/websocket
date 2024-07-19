const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'setUserId':
                clients.set(data.userId, ws);
                ws.userId = data.userId;
                break;

            case 'sendMessage':
                const recipientWs = clients.get(data.toUserId);
                if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
                    recipientWs.send(JSON.stringify({
                        fromUserId: data.fromUserId,
                        message: data.message,
                    }));
                } else {
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'User not connected or unavailable',
                    }));
                }
                break;

            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Unknown message type',
                }));
        }
    });

    ws.on('close', () => {
        clients.delete(ws.userId);
    });
});

console.log('WebSocket server is running on ws://localhost:8080');
