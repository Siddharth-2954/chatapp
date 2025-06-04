import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(""); // Clear any previous error messages
    setLoading(true);

    try {
      const response = await fetch("https://chatapp-backend-6644.onrender.com/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Show success message
      setSuccess("Account successfully created! Redirecting...");
      setTimeout(() => {
        navigate("/chats");
      }, 2000); // Redirect after 2 seconds
    } catch (err) {
      setSuccess(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
      <div className="relative max-w-md w-full">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg
                className="h-8 w-8 text-white"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Join Us Today
            </h2>
            <p className="mt-3 text-gray-600">
              Create your account to get started
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {success && (
              <div
                className={`px-4 py-3 rounded-xl shadow-sm ${
                  success.includes("successfully")
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                }`}
                role="alert"
              >
                <div className="flex items-center">
                  <svg
                    className={`h-5 w-5 mr-2 ${
                      success.includes("successfully")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  ></svg>
                  <span className="font-medium">{success}</span>
                </div>
              </div>
            )}

            <div className="space-y-5">
              <div className="group">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="group">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300/50 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md"
                    placeholder="Create a strong password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white ${
                loading
                  ? "bg-gradient-to-r from-purple-400 to-pink-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg"
              }`}
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 2.995 7.706z"
                  ></path>
                </svg>
              ) : (
                "Register"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
