export default function MessageBubble({ msg, currentUser }) {
    const isMine = msg.sender === currentUser;
    const time = new Date(msg.sentAt).toLocaleTimeString([], {
        hour:   "2-digit",
        minute: "2-digit",
    });

    return (
        <div className={`bubble-wrapper ${isMine ? "mine" : "theirs"}`}>
            {!isMine && (
                <span className="bubble-sender">{msg.sender}</span>
            )}
            <div className={`bubble ${isMine ? "bubble-mine" : "bubble-theirs"}`}>
                <p>{msg.content}</p>
                <span className="bubble-time">{time}</span>
            </div>
        </div>
    );
}