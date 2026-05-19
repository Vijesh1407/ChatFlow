package com.chat.repository;

import com.chat.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByRoomIdOrderBySentAtAsc(String roomId);

    @Query("""
        SELECT m FROM Message m
        WHERE (m.sender.id = :uid1 AND m.receiver.id = :uid2)
           OR (m.sender.id = :uid2 AND m.receiver.id = :uid1)
        ORDER BY m.sentAt ASC
    """)
    List<Message> findPrivateMessages(
            @Param("uid1") Long uid1,
            @Param("uid2") Long uid2
    );
}