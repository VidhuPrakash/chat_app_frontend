import { api } from "@/lib/api";
import { GroupMessageResponse, MessageResponse, User } from "@/lib/types";
import { useState } from "react";

/**
 * Custom hook for managing chat-related services.
 *
 * This hook provides methods to fetch chat history, users, groups, and group chat history
 * while managing the loading state for each request.
 *
 * @returns An object containing:
 * - `loading`: A boolean indicating whether a request is in progress.
 * - `getChatHistory`: Function to fetch chat history between the current user and a specified receiver.
 * - `getUsers`: Function to fetch a list of users.
 * - `getGroups`: Function to fetch a list of groups the current user is a part of.
 * - `getGroupChatHistory`: Function to fetch chat history for a specified group.
 */

export default function useChatService() {
  const [loading, setLoading] = useState(false);

  /**
   * Fetches chat history between the current user and a specified receiver.
   * @param {string} token - Authentication token.
   * @param {string} receiver - ID of the user to fetch chat history for.
   * @returns {Promise<MessageResponse>}
   *     Resolves with an object containing the chat history messages.
   * @throws {Error}
   *     If there is an error fetching the chat history.
   */
  const getChatHistory = async (
    token: string,
    receiver: string
  ): Promise<MessageResponse> => {
    setLoading(true);
    try {
      const response = await api.get(`/messages/${receiver}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.info("Error fetching chat history:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches a list of users.
   * @param {string} token - Authentication token.
   * @returns {Promise<{ data: User[] }>} - Resolves with an object containing the list of users.
   * @throws {Error} - If there is an error fetching the users.
   */
  const getUsers = async (token: string): Promise<{ data: User[] }> => {
    setLoading(true);
    try {
      const response = await api.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.info("Error fetching users:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

/**
 * Fetches a list of groups the current user is a part of.
 * @param {string} token - Authentication token.
 * @returns {Promise<any>} - Resolves with an object containing the list of groups.
 * @throws {Error} - If there is an error fetching the groups.
 */

  const getGroups = async (token: string) => {
    setLoading(true);
    try {
      const response = await api.get("/groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.info("Error fetching groups:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches the chat history for a specified group.
   * @param {string} token - Authentication token.
   * @param {string} groupId - ID of the group to fetch the chat history for.
   * @returns {Promise<GroupMessageResponse>} - Resolves with an object containing the chat history messages.
   * @throws {Error} - If there is an error fetching the chat history.
   */
  const getGroupChatHistory = async (
    token: string,
    groupId: string
  ): Promise<GroupMessageResponse> => {
    setLoading(true);
    try {
      const response = await api.get(`/messages/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.info("Error fetching group chat history:", error);
      throw error;
    } finally {
      setLoading(false);
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
