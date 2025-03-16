"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/store";
import Chat from "../chat/chat";
import UserList from "../userList/userList";
import GroupChat from "../groupChat/groupChat";
import { Group, User } from "@/lib/types";
import { disconnectSocket, initSocket } from "@/lib/socket";
import useLoginService from "@/module/login/services/loginService";

export default function ChatPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const { logout } = useLoginService();

  useEffect(() => {
    const { token, userId, username } = useAuthStore.getState();
    if (!token || !userId || !username) {
      router.push("/auth/login");
      return;
    }

    const user: User = { _id: userId, username, email: "" };
    setCurrentUser(user);
    setIsAuthenticated(true);

    const newSocket = initSocket(token);
    setSocket(newSocket);

    return () => {
      disconnectSocket();
    };
  }, [router]);

  /**
   * Handles when a user is selected in the user list
   * @param user The user object that was selected
   */
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
  };

  /**
   * Handles when a group is selected in the user list
   * @param group The group object that was selected
   */
  const handleSelectGroup = (group: Group) => {
    if (!group._id) {
      return;
    }
    setSelectedGroup(group);
    setSelectedUser(null);
  };
  /**
   * Logs out the current user by clearing authentication state and redirects to the login page.
   */
  const handleLogout = async () => {
    const data = await logout();
    if (data.status !== 200) return;
    useAuthStore.getState().clearAuth();
    router.push("/auth/login");
  };
  // Loading screen
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#ECE5DD]">
        <div className="w-12 h-12 border-4 border-t-4 border-gray-300 border-t-[#25D366] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row h-screen bg-[#ECE5DD]">
      <UserList
        socket={socket}
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        onSelectGroup={handleSelectGroup}
        onLogout={handleLogout}
      />
      {selectedUser ? (
        <Chat
          socket={socket}
          currentUser={currentUser}
          selectedUser={selectedUser}
        />
      ) : selectedGroup ? (
        <GroupChat
          socket={socket}
          currentUser={currentUser}
          selectedGroup={selectedGroup}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-white sm:rounded-r-lg shadow-md">
          <p className="text-gray-600 text-lg font-medium">
            Select a chat to start messaging!
          </p>
        </div>
      )}
    </div>
  );
}
