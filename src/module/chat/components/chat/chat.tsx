"use client";
import { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import Message from "../message/message";
import { Message as MessageType, User } from "../../../../lib/types";
import { useDebounce } from "@/hooks/rebounce";
import { useAuthStore } from "@/lib/store";
import useChatService from "../../services/chatService";

interface ChatProps {
  socket: Socket | null;
  currentUser: User;
  selectedUser: User | null;
}

export default function Chat({ socket, currentUser, selectedUser }: ChatProps) {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [input, setInput] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingUser, setTypingUser] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const debouncedInput = useDebounce(input, 1000);
  const [isOnline, setIsOnline] = useState<boolean>(
    selectedUser?.online || false
  );
  const { getChatHistory } = useChatService();
  useEffect(() => {
    if (!socket || !selectedUser) return;
    /**
     * Fetches the chat history between the current user and the selected user.
     *
     * - Retrieves the authentication token from the auth store.
     * - Uses the token to fetch the chat history with the selected user's ID.
     * - Updates the messages state with the fetched chat history data.
     *
     * @returns {Promise<void>}
     */

    const fetchHistory = async () => {
      const token = useAuthStore.getState().token || ""; // Access token directly
      const { data } = await getChatHistory(token, selectedUser._id);
      setMessages(Array.isArray(data) ? data : []);
    };
    fetchHistory();

    socket.on("chatHistory", (history: MessageType[]) => {
      setMessages(history);
    });

    socket.on("messageSent", (newMessage: MessageType) => {
      if (
        newMessage.sender === currentUser._id &&
        newMessage.receiver === selectedUser._id
      ) {
        setMessages((prev) => {
          if (!prev.some((msg) => msg._id === newMessage._id)) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    });

    socket.on("receiveMessage", (newMessage: MessageType) => {
      if (
        newMessage.sender === selectedUser._id &&
        newMessage.receiver === currentUser._id
      ) {
        setMessages((prev) => {
          if (!prev.some((msg) => msg._id === newMessage._id)) {
            return [...prev, newMessage];
          }
          return prev;
        });
      }
    });

    socket.on(
      "messageRead",
      ({ messageId, read }: { messageId: string; read: boolean }) => {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? { ...msg, read } : msg))
        );
      }
    );

    socket.on("userTyping", ({ username }: { username: string }) => {
      if (username === selectedUser?.username) {
        setIsTyping(true);
        setTypingUser(username);
      }
    });

    socket.on("userStoppedTyping", () => {
      setIsTyping(false);
      setTypingUser("");
    });

    socket.on("userStatus", (users: User[]) => {
      const user = users.find((u) => u._id === selectedUser._id);
      if (user) {
        setIsOnline(user.online!);
      }
    });

    return () => {
      socket.off("chatHistory");
      socket.off("messageSent");
      socket.off("receiveMessage");
      socket.off("messageRead");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("userStatus");
    };
  }, [socket, selectedUser, currentUser]);

  useEffect(() => {
    if (selectedUser) {
      setIsOnline(selectedUser.online || false);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !selectedUser) return;

    // When debounced input stabilizes (user stops typing), emit stopTyping
    if (debouncedInput === input && input !== "") {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  }, [debouncedInput, input, socket, selectedUser]);

  /**
   * Handles sending a message to the selected user.
   *
   * - Checks if a selected user exists and if the input is not empty.
   * - Emits the "sendUserMessage" event to the server with the selected user's ID and the message content.
   * - Resets the input field.
   * - Emits the "stopTyping" event to the server to indicate that the user has stopped typing.
   */
  const handleSend = () => {
    if (!input.trim() || !selectedUser || !selectedUser._id) {
      return;
    }
    socket?.emit("sendUserMessage", {
      receiver: selectedUser._id,
      message: input,
    });
    setInput("");
    socket?.emit("stopTyping", { receiverId: selectedUser._id });
  };
  /**
   * Handles typing events from the input field.
   *
   * - If the input is not empty and the debounced input is empty, emits the "typing" event to notify the server that typing has started.
   * - If the input is empty, emits the "stopTyping" event to notify the server that typing has stopped.
   * @param e - The input change event.
   * @returns {void}
   */
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);

    if (newValue && !debouncedInput) {
      socket?.emit("typing", { receiverId: selectedUser?._id });
    }
    if (!newValue) {
      socket?.emit("stopTyping", { receiverId: selectedUser?._id });
    }
  };

  /**
   * Marks a message as read.
   *
   * - Emits the "markAsRead" event with the message ID to the server.
   * @param messageId - The ID of the message to mark as read.
   * @returns {void}
   */
  const markAsRead = (messageId: string) => {
    socket?.emit("markAsRead", { messageId });
  };

  return (
    <div className="flex-1 flex flex-col bg-white sm:rounded-r-lg shadow-md">
      {selectedUser ? (
        <>
          <div className="bg-green-800 text-white p-4 flex items-center">
            <h2 className="text-lg font-semibold">{selectedUser.username}</h2>
            <span
              className={`ml-2 text-sm ${
                isOnline ? "text-green-400" : "text-gray-300"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-amber-100">
            {messages.map((msg) => (
              <Message
                key={msg._id}
                message={msg}
                isOwnMessage={msg.sender === currentUser._id}
                onRender={() =>
                  !msg.read &&
                  msg.receiver === currentUser._id &&
                  markAsRead(msg._id)
                }
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
            Select a user to start messaging!
          </p>
        </div>
      )}
    </div>
  );
}
