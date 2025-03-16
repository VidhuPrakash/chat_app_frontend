"use client";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { Group, User } from "../../../../lib/types";
import { useAuthStore } from "@/lib/store";
import useChatService from "../../services/chatService";

interface UserListProps {
  socket: Socket | null;
  currentUser: User;
  onSelectUser: (user: User) => void;
  onSelectGroup: (group: Group) => void;
  onLogout: () => void;
}

export default function UserList({
  socket,
  currentUser,
  onSelectUser,
  onSelectGroup,
  onLogout,
}: UserListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<{ _id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "groups">("users");
  const [groupName, setGroupName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const { getUsers, getGroups, loading } = useChatService();

  useEffect(() => {
    const {
      token: authToken,
      userId: authUserId,
      username,
    } = useAuthStore.getState();
    setUserName(username!);
    /**
     * Fetches all users except the current user
     * @remarks
     * If the token is invalid, nothing is fetched
     * @returns {Promise<void>}
     */
    const fetchUsers = async () => {
      if (!authToken) return;
      try {
        const { data } = await getUsers(authToken);
        const filteredUsers = data.filter((user) => user._id !== authUserId);

        setUsers(filteredUsers);
      } catch (error) {
        console.error("error fetching users:", error);
      }
    };

    /**
     * Fetches all groups available to the current user
     * @remarks
     * If the token is invalid, nothing is fetched
     * @returns {Promise<void>}
     */
    const fetchGroups = async () => {
      if (!authToken) return;
      try {
        const { data } = await getGroups(authToken);
        console.log(data);
        setGroups(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchUsers();
    fetchGroups();

    if (!socket) return;

    socket.on("userStatus", (onlineUsers: User[]) => {
      const authUserId = useAuthStore.getState().userId;
      // Ensure both IDs are strings for accurate comparison
      const filteredUsers = onlineUsers.filter(
        (user) => user._id !== authUserId?.toString()
      );
      setUsers(filteredUsers);
    });

    socket.on("groupList", (groupList: { _id: string; name: string }[]) => {
      setGroups(groupList);
    });

    return () => {
      socket.off("userStatus");
      socket.off("groupList");
    };
  }, [socket]);

  /**
   * Handles the creation of a new group
   * @remarks
   * Trims the group name to prevent empty group names
   * Emits the "createGroup" event to the server
   * Resets the group name input
   */
  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    socket?.emit("createGroup", { name: groupName });
    setGroupName("");
  };

  /**
   * Handles joining a group
   * @param {string} groupId - The ID of the group to join
   * @remarks
   * Emits the "joinGroup" event to the server
   * Finds the group in the list of groups and calls the onSelectGroup callback
   * If the group is not found, logs an error message
   */
  const handleJoinGroup = (groupId: string) => {
    socket?.emit("joinGroup", { groupId });
    const group = groups.find((g) => g._id === groupId);
    if (group) {
      onSelectGroup(group);
    } else {
      console.error("Group not found:", groupId);
    }
  };

  return (
    <div className="w-full sm:w-80 bg-[#111B21] text-white p-4 flex flex-col h-screen sm:h-auto shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          Welcome, {currentUser.username}
        </h2>
        <button
          onClick={onLogout}
          className="bg-green-950 text-white text-sm px-3 py-1 rounded-full hover:bg-green-600 transition duration-200"
        >
          Logout
        </button>
      </div>
      <div className="flex space-x-2 mb-4">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            activeTab === "users"
              ? "bg-green-800 text-white"
              : "bg-gray-700 text-gray-100"
          } hover:bg-green-500 transition duration-200`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            activeTab === "groups"
              ? "bg-green-800 text-white"
              : "bg-gray-700 text-gray-100"
          } hover:bg-green-500 transition duration-200`}
          onClick={() => setActiveTab("groups")}
        >
          Groups
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === "users" ? (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => onSelectUser(user)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#1F2A30] rounded-lg transition duration-200"
              >
                <span className="text-sm font-medium">{user.username}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    user.online ? "bg-green-500" : "bg-gray-500"
                  }`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="New group name"
                className="w-full p-2 rounded-lg bg-[#1F2A30] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#25D366] transition duration-200"
              />
              <button
                onClick={handleCreateGroup}
                className="w-full mt-2 bg-[#25D366] text-white py-2 rounded-lg hover:bg-[#20B858] transition duration-300"
              >
                Create Group
              </button>
            </div>
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => handleJoinGroup(group._id)}
                  className="p-3 cursor-pointer hover:bg-[#1F2A30] rounded-lg transition duration-200"
                >
                  <span className="text-sm font-medium">{group.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
