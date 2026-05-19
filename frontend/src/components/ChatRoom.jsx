import { useEffect, useRef, useState } from "react";
import {
    connectWebSocket,
    sendRoomMessage,
    sendPrivateMessage,
    disconnectWebSocket,
} from "../services/websocket";
import {
    getRoomHistory,
    getUsers,
    getPrivateHistory,
    logout,
} from "../services/api";
import MessageBubble from "./MessageBubble";
import UserList from "./UserList";

export default function ChatRoom({ user, onLogout }) {
    const [roomMessages,    setRoomMessages]    = useState([]);
    const [privateMessages, setPrivateMessages] = useState({});
    const [users,           setUsers]           = useState([]);
    const [privateTarget,   setPrivateTarget]   = useState(null);
    const [input,           setInput]           = useState("");
    const [connected,       setConnected]       = useState(false);
    const bottomRef  = useRef(null);
    const clientRef  = useRef(null);

    // ── Initial load + WebSocket connect ─────────────────
    useEffect(() => {
        getRoomHistory("general")
            .then(({ data }) => setRoomMessages(data))
            .catch(console.error);

        getUsers()
            .then(({ data }) => setUsers(data))
            .catch(console.error);

        const client = connectWebSocket(
            user.username,
            // Public room message
            (msg) => {
                setRoomMessages((prev) => [...prev, msg]);
            },
            // Private message — store by partner username
            (msg) => {
                const partner =
                    msg.sender === user.username
                        ? msg.receiver
                        : msg.sender;
                setPrivateMessages((prev) => ({
                    ...prev,
                    [partner]: [...(prev[partner] || []), msg],
                }));
            }
        );

        clientRef.current = client;

        const interval = setInterval(() => {
            setConnected(clientRef.current?.connected ?? false);
        }, 1000);

        return () => {
            clearInterval(interval);
            disconnectWebSocket();
        };
    }, [user.username]);

    // ── Auto-scroll ───────────────────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [roomMessages, privateMessages, privateTarget]);

    // ── Refresh user list every 10s ───────────────────────
    useEffect(() => {
        const interval = setInterval(() => {
            getUsers()
                .then(({ data }) => setUsers(data))
                .catch(console.error);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    // ── Select a private chat target ──────────────────────
    const handleSelectUser = async (targetUsername) => {
        setPrivateTarget(targetUsername);

        // Load history only if not already loaded
        if (!privateMessages[targetUsername]) {
            try {
                const { data } = await getPrivateHistory(
                    user.id,
                    users.find((u) => u.username === targetUsername)?.id
                );
                setPrivateMessages((prev) => ({
                    ...prev,
                    [targetUsername]: data,
                }));
            } catch (err) {
                console.error("Failed to load private history:", err);
                setPrivateMessages((prev) => ({
                    ...prev,
                    [targetUsername]: [],
                }));
            }
        }
    };

    // ── Send message ──────────────────────────────────────
    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        if (privateTarget) {
            sendPrivateMessage(privateTarget, input);
        } else {
            sendRoomMessage("general", input);
        }
        setInput("");
    };

    // ── Logout ────────────────────────────────────────────
    const handleLogout = async () => {
        await logout().catch(() => {});
        onLogout();
    };

    const displayedMessages = privateTarget
        ? (privateMessages[privateTarget] || [])
        : roomMessages;

    return (
        <div className="chat-app">

            {/* ── Sidebar ─────────────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span className="sidebar-logo">💬 ChatFlow</span>
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                    >
                        Sign Out
                    </button>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-label">Channels</p>
                    <div
                        className={`room-item ${!privateTarget ? "active" : ""}`}
                        onClick={() => setPrivateTarget(null)}
                    >
                        # general
                    </div>
                </div>

                <div className="sidebar-section">
                    <p className="sidebar-label">Direct Messages</p>
                    <UserList
                        users={users}
                        currentUser={user.username}
                        onSelectUser={handleSelectUser}
                        activeUser={privateTarget}
                    />
                </div>

                <div className="sidebar-footer">
                    <div className="current-user">
                        <div className="user-avatar small">
                            {user.username[0].toUpperCase()}
                        </div>
                        <span>{user.username}</span>
                        <span className={`status-dot ${
                            connected ? "online" : "offline"
                        }`} />
                    </div>
                </div>
            </aside>

            {/* ── Main Chat ───────────────────────── */}
            <main className="chat-main">
                <header className="chat-header">
                    <div>
                        <h2>
                            {privateTarget
                                ? `@ ${privateTarget}`
                                : "# general"}
                        </h2>
                        <span className="header-sub">
                            {privateTarget
                                ? "Private conversation"
                                : "Public channel · everyone"}
                        </span>
                    </div>
                    <span className={`conn-badge ${
                        connected ? "conn-on" : "conn-off"
                    }`}>
                        {connected ? "● Live" : "○ Connecting…"}
                    </span>
                </header>

                <div className="messages-area">
                    {displayedMessages.length === 0 && (
                        <p className="empty-state">
                            No messages yet. Say hello! 👋
                        </p>
                    )}
                    {displayedMessages.map((msg, i) => (
                        <MessageBubble
                            key={i}
                            msg={msg}
                            currentUser={user.username}
                        />
                    ))}
                    <div ref={bottomRef} />
                </div>

                <form className="input-bar" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder={
                            privateTarget
                                ? `Message @${privateTarget}…`
                                : "Message #general…"
                        }
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button type="submit">Send ↑</button>
                </form>
            </main>
        </div>
    );
}