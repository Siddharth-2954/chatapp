import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
const Profile = () => {
  const { auth } = useAuth();
  const [profile, setProfile] = useState({});
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await fetch("https://chatapp-backend-6644.onrender.com/api/auth/profile", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      setProfile(data);
      setFormData({ name: data.name, email: data.email });
    };
    fetchProfile();
  }, [auth]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await fetch("https://chatapp-backend-6644.onrender.com/api/users/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) alert("Profile updated successfully!");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded p-6 w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
};
export default Profile;