import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;

export function connectWebSocket(
    username,
    onRoomMessage,
    onPrivateMessage
) {
    stompClient = new Client({
        webSocketFactory: () =>
            new SockJS("http://localhost:8080/ws"),

        reconnectDelay: 5000,

        onConnect: () => {
            console.log("WebSocket connected");

            // Public room
            stompClient.subscribe(
                "/topic/room/general",
                (frame) => {
                    onRoomMessage(JSON.parse(frame.body));
                }
            );

            // Private messages — Spring sends to /user/{username}/queue/private
            stompClient.subscribe(
                "/user/queue/private",
                (frame) => {
                    onPrivateMessage(JSON.parse(frame.body));
                }
            );
        },

        onStompError: (frame) => {
            console.error("WebSocket error:", frame);
        },
    });

    stompClient.activate();
    return stompClient;
}

export function sendRoomMessage(roomId, content) {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: `/app/chat.send/${roomId}`,
            body: JSON.stringify({ content }),
        });
    }
}

export function sendPrivateMessage(to, content) {
    if (stompClient && stompClient.connected) {
        stompClient.publish({
            destination: "/app/chat.private",
            body: JSON.stringify({ to, content }),
        });
    }
}

export function disconnectWebSocket() {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
}