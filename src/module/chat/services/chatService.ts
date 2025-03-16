import { api } from "@/lib/api";
import { GroupMessageResponse, MessageResponse, User } from "@/lib/types";
import { useState } from "react";

export default function useChatService() {
  const [loading, setLoading] = useState(false);

  const getChatHistory = async (
    token: string,
    receiver: string
  ): Promise<MessageResponse> => {
    try {
      const response = await api.get(`/messages/${receiver}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      throw error;
    }
  };

  const getUsers = async (token: string): Promise<{ data: User[] }> => {
    try {
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const getGroups = async (token: string) => {
    try {
      const response = await api.get("/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching groups:", error);
      throw error;
    }
  };

  const getGroupChatHistory = async (
    token: string,
    groupId: string
  ): Promise<GroupMessageResponse> => {
    try {
      const response = await api.get(`/messages/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching group chat history:", error);
      throw error;
    }
  };

  return {
    loading,
    getChatHistory,
    getUsers,
    getGroups,
    getGroupChatHistory,
  };
}
