package com.chat.controller;

import com.chat.model.Message;
import com.chat.model.User;
import com.chat.service.MessageService;
import com.chat.service.UserService;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final MessageService messageService;
    private final UserService userService;

    public ChatController(SimpMessagingTemplate messagingTemplate,
                          MessageService messageService,
                          UserService userService) {
        this.messagingTemplate = messagingTemplate;
        this.messageService = messageService;
        this.userService = userService;
    }

    // ── Public Room ───────────────────────────────────
    @MessageMapping("/chat.send/{roomId}")
    public void sendRoomMessage(
            @DestinationVariable String roomId,
            @Payload ChatMessageDTO dto,
            Authentication auth) {

        User sender = userService
                .findByUsername(auth.getName()).orElseThrow();
        Message saved = messageService.saveMessage(
                sender, null, roomId,
                dto.content, Message.MessageType.TEXT);

        // Cast to String to resolve ambiguous overload
        messagingTemplate.convertAndSend(
                (String)("/topic/room/" + roomId),
                (Object) toResponse(saved));
    }

    // ── Private Message ───────────────────────────────
    @MessageMapping("/chat.private")
    public void sendPrivateMessage(
            @Payload PrivateMessageDTO dto,
            Authentication auth) {

        User sender = userService
                .findByUsername(auth.getName()).orElseThrow();
        User receiver = userService
                .findByUsername(dto.to).orElseThrow();
        Message saved = messageService.saveMessage(
                sender, receiver, null,
                dto.content, Message.MessageType.TEXT);

        messagingTemplate.convertAndSendToUser(
                dto.to, "/queue/private", (Object) toResponse(saved));
        messagingTemplate.convertAndSendToUser(
                auth.getName(), "/queue/private", (Object) toResponse(saved));
    }

    // ── REST: Room History ────────────────────────────
    @GetMapping("/api/messages/room/{roomId}")
    public List<Map<String, Object>> getRoomHistory(
            @PathVariable String roomId) {
        return messageService.getRoomHistory(roomId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── REST: All Users ───────────────────────────────
    @GetMapping("/api/users")
    public List<Map<String, Object>> getUsers() {
        return userService.findAllUsers()
                .stream()
                .map(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id",       u.getId());
                    m.put("username", u.getUsername());
                    return m;
                })
                .collect(Collectors.toList());
    }

    // ── REST: Private Message History ────────────────
    @GetMapping("/api/messages/private/{uid1}/{uid2}")
    public List<Map<String, Object>> getPrivateHistory(
            @PathVariable Long uid1,
            @PathVariable Long uid2) {
        return messageService.getPrivateHistory(uid1, uid2)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Helper ────────────────────────────────────────
    private Map<String, Object> toResponse(Message m) {
        Map<String, Object> map = new HashMap<>();
        map.put("id",       m.getId());
        map.put("sender",   m.getSender().getUsername());
        map.put("receiver", m.getReceiver() != null
                ? m.getReceiver().getUsername() : "");
        map.put("content",  m.getContent());
        map.put("roomId",   m.getRoomId() != null ? m.getRoomId() : "");
        map.put("sentAt",   m.getSentAt().toString());
        map.put("type",     m.getMessageType().name());
        return map;
    }

    // ── DTOs (plain classes, no Lombok) ───────────────
    public static class ChatMessageDTO {
        public String content;
    }

    public static class PrivateMessageDTO {
        public String to;
        public String content;
    }
}