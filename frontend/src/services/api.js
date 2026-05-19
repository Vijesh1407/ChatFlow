import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true,
});

export const login = (username, password) =>
    api.post("/auth/login", { username, password });

export const register = (username, password) =>
    api.post("/auth/register", { username, password });

export const getMe = () =>
    api.get("/auth/me");

export const logout = () =>
    api.post("/auth/logout");

export const getRoomHistory = (roomId) =>
    api.get(`/messages/room/${roomId}`);

// ← NEW: fetch private chat history between two users
export const getPrivateHistory = (userId1, userId2) =>
    api.get(`/messages/private/${userId1}/${userId2}`);

export const getUsers = () =>
    api.get("/users");

export default api;