import { useState, useEffect } from "react";
import Login from "./components/Login";
import ChatRoom from "./components/ChatRoom";
import { getMe } from "./services/api";

export default function App() {
    const [user,     setUser]     = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        getMe()
            .then(({ data }) => {
                // Only set user if actually logged in
                if (data && data.username) {
                    setUser(data);
                } else {
                    setUser(null);
                }
            })
            .catch(() => {
                // 401 = not logged in, show login page
                setUser(null);
            })
            .finally(() => {
                setChecking(false);
            });
    }, []);

    if (checking) {
        return (
            <div style={{
                display:        "flex",
                flexDirection:  "column",
                alignItems:     "center",
                justifyContent: "center",
                height:         "100vh",
                background:     "#0f1117",
                color:          "#6c63ff",
                fontFamily:     "sans-serif",
                gap:            "16px"
            }}>
                <div style={{ fontSize: "2.5rem" }}>💬</div>
                <p>Loading…</p>
            </div>
        );
    }

    return user
        ? <ChatRoom user={user} onLogout={() => setUser(null)} />
        : <Login onLogin={setUser} />;
}