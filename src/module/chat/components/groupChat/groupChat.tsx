"use client";
import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import Message from "../message/message";
import { GroupMessage, User, Group } from "../../../../lib/types";
import { useDebounce } from "@/hooks/rebounce";
import { useAuthStore } from "@/lib/store";
import useChatService from "../../services/chatService";

interface GroupChatProps {
  socket: Socket | null;
  currentUser: User;
  selectedGroup: Group | null;
}

export default function GroupChat({
  socket,
  currentUser,
  selectedGroup,
}: GroupChatProps) {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debouncedInput = useDebounce(input, 1000);
  const [error, setError] = useState<string>("");
  const { getGroupChatHistory, loading } = useChatService();

  useEffect(() => {
    if (!socket || !selectedGroup || !selectedGroup._id) {
      return;
    }

    /**
     * Fetches the chat history for the currently selected group
     * @remarks
     * If the token is invalid, nothing is fetched
     * If the group ID is invalid, nothing is fetched
     * Marks all messages as read for the current user
     * @returns {Promise<void>}
     */
    const fetchGroupChatHistory = async () => {
      const token = useAuthStore.getState().token || "";
      try {
        const response = await getGroupChatHistory(token, selectedGroup._id);
        const messageData = Array.isArray(response.data) ? response.data : [];
        setMessages(messageData);
        const unreadMessages = messageData.filter(
          (msg: GroupMessage) =>
            msg.group === selectedGroup._id &&
            !msg.readBy.includes(currentUser._id) &&
            msg.sender !== currentUser._id
        );
        unreadMessages.forEach((msg: GroupMessage) => markAsRead(msg._id));
      } catch (err) {
        setError("Failed to load chat history");
      }
    };

    fetchGroupChatHistory();

    socket.on("receiveGroupMessage", (newMessage: GroupMessage) => {
      if (newMessage.group === selectedGroup._id) {
        setMessages((prev) => {
          // Only add if the message isn't already in the list
          if (prev.some((msg) => msg._id === newMessage._id)) {
            return prev; // Skip duplicate
          }
          return [...prev, newMessage];
        });
        if (
          !newMessage.readBy.includes(currentUser._id) &&
          newMessage.sender !== currentUser._id
        ) {
          markAsRead(newMessage._id);
        }
      }
    });

    socket.on("messageSent", (newMessage: GroupMessage) => {
      if (
        newMessage.sender === currentUser._id &&
        newMessage.group === selectedGroup._id
      ) {
        setMessages((prev) => {
          // Only add if the message isn't already in the list
          if (prev.some((msg) => msg._id === newMessage._id)) {
            return prev; // Skip duplicate
          }
          return [...prev, newMessage];
        });
      }
    });
    socket.on("messageRead", ({ messageId, readBy }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === messageId ? { ...msg, readBy } : msg))
      );
    });

    socket.on("userTyping", ({ username }) => {
      if (username !== currentUser.username) {
        setIsTyping(true);
        setTypingUser(username);
      }
    });

    socket.on("userStoppedTyping", () => {
      setIsTyping(false);
      setTypingUser("");
    });

    socket.on("error", ({ message }) => {
      console.error("Socket error:", message);
    });

    return () => {
      socket.off("groupChatHistory");
      socket.off("receiveGroupMessage");
      socket.off("messageSent");
      socket.off("messageRead");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("error");
    };
  }, [socket, selectedGroup, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !selectedGroup || !selectedGroup._id) return;
    if (debouncedInput === input && input !== "") {
      socket.emit("stopTyping", { receiverId: selectedGroup._id });
    }
  }, [debouncedInput, input, socket, selectedGroup]);

  /**
   * Sends a message to the selected group.
   *
   * - If the input is empty or no group is selected, the function returns early.
   * - Emits the "sendGroupMessage" event with the group ID and message content.
   * - Clears the input field after sending the message.
   * - Emits the "stopTyping" event to notify the server that typing has stopped.
   */

  const handleSend = () => {
    if (!input.trim() || !selectedGroup || !selectedGroup._id) {
      return;
    }
    socket?.emit("sendGroupMessage", {
      groupId: selectedGroup._id,
      message: input,
    });
    setInput("");
    socket?.emit("stopTyping", { receiverId: selectedGroup._id });
  };

  /**
   * Handles typing events from the input field.
   *
   * - If the input is empty or no group is selected, the function returns early.
   * - If the input changes and the debounced input is empty, emits the "typing" event to notify the server that typing has started.
   * - If the input is empty, emits the "stopTyping" event to notify the server that typing has stopped.
   * @param e - The input change event.
   * @returns {void}
   */
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    if (!selectedGroup || !selectedGroup._id) return;
    if (newValue && !debouncedInput) {
      socket?.emit("typing", { receiverId: selectedGroup._id });
    }
    if (!newValue) {
      socket?.emit("stopTyping", { receiverId: selectedGroup._id });
    }
  };

  /**
   * Marks a message in the selected group as read.
   *
   * - Emits the "markAsRead" event with the message ID and the isGroup flag set to true.
   * @param messageId - The ID of the message to mark as read.
   * @returns {void}
   */
  const markAsRead = (messageId: string) => {
    socket?.emit("markAsRead", { messageId, isGroup: true });
  };

  return (
    <div className="flex-1 flex flex-col bg-white sm:rounded-r-lg shadow-md">
      {selectedGroup ? (
        <>
          <div className="bg-green-800 text-white p-4 flex items-center">
            <h2 className="text-lg font-semibold">{selectedGroup.name}</h2>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-amber-100">
            {messages.map((msg) => (
              <Message
                key={msg._id}
                message={msg}
                isOwnMessage={msg.sender === currentUser._id}
                isGroup
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          {isTyping && typingUser && (
            <p className="p-2 text-gray-500 text-sm">
              {typingUser} is typing...
            </p>
          )}
          <div className="p-4 bg-green-100 border-t flex items-center">
            <input
              type="text"
              value={input}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 p-2 rounded-lg bg-gray-100 text-black border-none focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-green-500 text-white p-2 rounded-full hover:bg-green-900 transition duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600 text-lg font-medium">
            Select a group to start messaging!
          </p>
        </div>
      )}
    </div>
  );
}
