package com.chat.service;

import com.chat.model.Message;
import com.chat.model.User;
import com.chat.repository.MessageRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Message saveMessage(User sender, User receiver,
                               String roomId, String content,
                               Message.MessageType type) {
        return messageRepository.save(
                Message.builder()
                        .sender(sender)
                        .receiver(receiver)
                        .roomId(roomId)
                        .content(content)
                        .messageType(type)
                        .build()
        );
    }

    public List<Message> getRoomHistory(String roomId) {
        return messageRepository.findByRoomIdOrderBySentAtAsc(roomId);
    }

    public List<Message> getPrivateHistory(Long uid1, Long uid2) {
        return messageRepository.findPrivateMessages(uid1, uid2);
    }
}