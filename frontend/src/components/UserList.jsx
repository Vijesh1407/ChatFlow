export default function UserList({
                                     users,
                                     currentUser,
                                     onSelectUser,
                                     activeUser,
                                 }) {
    const others = users.filter((u) => u.username !== currentUser);

    if (others.length === 0) {
        return (
            <p className="no-users">No other users yet</p>
        );
    }

    return (
        <div className="user-list">
            {others.map((u) => (
                <div
                    key={u.id}
                    className={`user-item ${
                        activeUser === u.username ? "active" : ""
                    }`}
                    onClick={() => onSelectUser(u.username)}
                >
                    <div className="user-avatar">
                        {u.username[0].toUpperCase()}
                    </div>
                    <span className="user-name">{u.username}</span>
                    <span className="online-dot" />
                </div>
            ))}
        </div>
    );
}