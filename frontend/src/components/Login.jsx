import { useState } from "react";
import { login, register } from "../services/api";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError]   = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isRegister) {
                await register(username, password);
                setIsRegister(false);
                setError("✅ Registered! Please log in.");
            } else {
                const { data } = await login(username, password);
                onLogin(data);
            }
        } catch (err) {
            setError(
                err.response?.data?.error || "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <div className="logo">💬</div>
                    <h1>ChatFlow</h1>
                    <p>Real-time messaging</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    {error && (
                        <p className={
                            error.startsWith("✅")
                                ? "success-msg"
                                : "error-msg"
                        }>
                            {error}
                        </p>
                    )}
                    <button type="submit" disabled={loading}>
                        {loading
                            ? "Please wait…"
                            : isRegister
                                ? "Create Account"
                                : "Sign In"}
                    </button>
                </form>

                <p className="toggle-auth">
                    {isRegister
                        ? "Already have an account? "
                        : "New here? "}
                    <span onClick={() => {
                        setIsRegister(!isRegister);
                        setError("");
                    }}>
                        {isRegister ? "Sign In" : "Register"}
                    </span>
                </p>
            </div>
        </div>
    );
}