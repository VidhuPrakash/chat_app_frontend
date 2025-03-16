import { useEffect } from "react";
import { GroupMessage, Message as MessageType } from "../../../../lib/types";

interface MessageProps {
  message: MessageType | GroupMessage;
  isOwnMessage: boolean;
  onRender?: () => void;
  isGroup?: boolean;
}

export default function Message({
  message,
  isOwnMessage,
  onRender,
  isGroup,
}: MessageProps) {
  useEffect(() => {
    onRender?.();
  }, []);
  const isRead =
    "read" in message ? message.read : message.readBy.includes(message.sender);
  const senderUsername =
    "senderUsername" in message ? message.senderUsername : "Unknown";
  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div
        className={`max-w-xs p-3 rounded-lg shadow-md ${
          isOwnMessage ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        {!isOwnMessage && isGroup && (
          <p className="text-xs text-gray-600">{senderUsername}</p>
        )}
        <p>{message.message}</p>
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {new Date(message.createdAt).toLocaleTimeString()}
          </span>
          {isOwnMessage && (
            <span className="text-xs ml-2">{isRead ? "✓✓" : "✓"}</span>
          )}
        </div>
      </div>
    </div>
  );
}
