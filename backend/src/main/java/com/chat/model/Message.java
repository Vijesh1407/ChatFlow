package com.chat.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {

    public enum MessageType { TEXT, IMAGE, JOIN, LEAVE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @Column(name = "room_id", length = 100)
    private String roomId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type")
    private MessageType messageType = MessageType.TEXT;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) sentAt = LocalDateTime.now();
    }

    public Message() {}

    private Message(Builder b) {
        this.sender      = b.sender;
        this.receiver    = b.receiver;
        this.roomId      = b.roomId;
        this.content     = b.content;
        this.messageType = b.messageType != null
                ? b.messageType : MessageType.TEXT;
    }

    public Long getId()               { return id; }
    public User getSender()           { return sender; }
    public User getReceiver()         { return receiver; }
    public String getRoomId()         { return roomId; }
    public String getContent()        { return content; }
    public MessageType getMessageType() { return messageType; }
    public LocalDateTime getSentAt()  { return sentAt; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User sender, receiver;
        private String roomId, content;
        private MessageType messageType;

        public Builder sender(User v)           { sender      = v; return this; }
        public Builder receiver(User v)         { receiver    = v; return this; }
        public Builder roomId(String v)         { roomId      = v; return this; }
        public Builder content(String v)        { content     = v; return this; }
        public Builder messageType(MessageType v){ messageType = v; return this; }
        public Message build()                  { return new Message(this); }
    }
}