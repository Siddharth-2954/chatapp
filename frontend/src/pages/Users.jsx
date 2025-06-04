// src/pages/Users.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth?.token) {
        console.log("No auth token available");
        setError("No authentication token found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        console.log("Fetching users with token:", auth.token);
        
        const response = await fetch("https://chatapp-backend-6644.onrender.com/api/users", {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from server:", errorData);
          throw new Error(errorData.message || "Failed to fetch users");
        }

        const data = await response.json();
        console.log("Raw users data:", data);
        
        // Filter out the current user
        const processedUsers = Array.isArray(data) 
          ? data.filter(user => user._id !== auth.user._id)
          : [];
        console.log("Processed users array:", processedUsers);
        
        setUsers(processedUsers);
      } catch (err) {
        console.error("Error in fetchUsers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [auth?.token, auth?.user?._id]);

  const handleStartChat = async (userId) => {
    try {
      const response = await fetch("https://chatapp-backend-6644.onrender.com/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create chat");
      }

      const chat = await response.json();
      navigate("/chats", { state: { selectedChat: chat } });
    } catch (err) {
      console.error("Error starting chat:", err);
      setError(err.message);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");

    if (!email) {
      setEmailError("Please enter an email address");
      return;
    }

    try {
      // First, find the user by email
      const response = await fetch(`https://chatapp-backend-6644.onrender.com/api/users/email/${email}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "User not found");
      }

      const user = await response.json();
      
      // Then start a chat with the found user
      await handleStartChat(user._id);
    } catch (err) {
      console.error("Error finding user by email:", err);
      setEmailError(err.message);
    }
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 2) {
      setError("Please select at least 2 users for the group");
      return;
    }
    if (!groupName.trim()) {
      setError("Please enter a group name");
      return;
    }

    try {
      const response = await fetch("https://chatapp-backend-6644.onrender.com/api/chats/group", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: groupName,
          users: selectedUsers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create group chat");
      }

      const chat = await response.json();
      setShowGroupModal(false);
      setSelectedUsers([]);
      setGroupName("");
      navigate("/chats", { state: { selectedChat: chat } });
    } catch (err) {
      console.error("Error creating group chat:", err);
      setError(err.message);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Debug render
  console.log("Current users state:", users);
  console.log("Loading state:", loading);
  console.log("Error state:", error);
  console.log("Auth state:", auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!auth?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-md">
          Please log in to view users
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      
      {/* Group Chat Creation */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Group Chat</h2>
          <button
            onClick={() => setShowGroupModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Create Group Chat
          </button>
        </div>
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Create Group Chat</h3>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="max-h-60 overflow-y-auto mb-4">
              {users.map((user) => (
                <div key={user._id} className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    id={user._id}
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => toggleUserSelection(user._id)}
                    className="rounded"
                  />
                  <label htmlFor={user._id}>{user.name}</label>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setSelectedUsers([]);
                  setGroupName("");
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Form */}
      <div className="mb-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Start a New Chat</h2>
        <form onSubmit={handleEmailSubmit} className="flex gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter user's email"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {emailError && (
              <p className="mt-2 text-sm text-red-600">{emailError}</p>
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Chat
          </button>
        </form>
      </div>

      {/* Users List */}
      {users.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-500">No users found</p>
          <p className="text-sm text-gray-400 mt-2">Debug info: {JSON.stringify(users)}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <div
              key={user._id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold">{user.name || 'No username'}</h2>
                  <p className="text-gray-600">{user.email || 'No email'}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleStartChat(user._id)}
                    className="text-blue-500 hover:text-blue-600 font-medium"
                  >
                    Start Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
