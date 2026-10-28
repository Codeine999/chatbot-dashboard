import { useEffect, useRef, useState } from "react";
import {
  useAdminChatMessages,
  useAdminChatRooms,
  useDeleteAdminChatRoom,
  useSendAdminChatMessage,
} from "./useAdminChat";
import { createPendingId, type PendingMessage } from "../lib/chatFormat";

/** สถานะของห้องแชทที่เปิดอยู่ ข้อความที่รอส่ง และการส่ง/ลบห้อง */
export const useChatSession = (aiEnabled: boolean) => {
  const [activeRoomId, setActiveRoomId] = useState<string>();
  const [input, setInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<PendingMessage>();
  const [deletingRoomId, setDeletingRoomId] = useState<string>();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const roomsQuery = useAdminChatRooms();
  const messagesQuery = useAdminChatMessages(activeRoomId);
  const sendMessageMutation = useSendAdminChatMessage();
  const deleteRoomMutation = useDeleteAdminChatRoom();

  const rooms = roomsQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const isThinking = sendMessageMutation.isPending;
  const hasConversation = messages.length > 0 || Boolean(pendingMessage);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeRoomId, messages.length, pendingMessage, isThinking]);

  const selectRoom = (roomId: string) => {
    if (isThinking) return;
    setActiveRoomId(roomId);
    setPendingMessage(undefined);
    setInput("");
  };

  const startNewChat = () => {
    if (isThinking) return;
    setActiveRoomId(undefined);
    setPendingMessage(undefined);
    setInput("");
  };

  const deleteRoom = async (roomId: string) => {
    if (deleteRoomMutation.isPending) return;
    setDeletingRoomId(roomId);
    try {
      await deleteRoomMutation.mutateAsync(roomId);
      if (activeRoomId === roomId) startNewChat();
    } catch {
      // The mutation hook already shows the API error; keep the room selected.
    } finally {
      setDeletingRoomId(undefined);
    }
  };

  const sendMessage = async (value = input) => {
    const text = value.trim();
    if (!text || isThinking || !aiEnabled) return;

    setPendingMessage({ id: createPendingId(), content: text });
    setInput("");

    try {
      // Omitting `roomId` lets the backend create the room in the same call.
      // Creating it up front would leave an empty room behind whenever the
      // reply fails — an exhausted AI budget, or a provider outage.
      // The model is not sent: the backend reads it from the stored setting.
      const result = await sendMessageMutation.mutateAsync({
        roomId: activeRoomId,
        text,
      });

      if (!activeRoomId) setActiveRoomId(result.roomId);
      setPendingMessage(undefined);
    } catch {
      setPendingMessage(undefined);
      setInput((current) => current || text);
    }
  };

  return {
    rooms,
    roomsQuery,
    messages,
    messagesQuery,
    activeRoomId,
    activeRoom: rooms.find((room) => room.id === activeRoomId),
    input,
    setInput,
    pendingMessage,
    deletingRoomId,
    isThinking,
    hasConversation,
    messagesEndRef,
    selectRoom,
    startNewChat,
    deleteRoom,
    sendMessage,
  };
};
