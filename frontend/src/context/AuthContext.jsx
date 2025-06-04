import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Create context outside of component
const AuthContext = createContext(null);

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Separate provider component
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem("auth");
    return storedAuth ? JSON.parse(storedAuth) : { token: null, user: null };
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAuth = localStorage.getItem("auth");
        if (storedAuth) {
          const parsedAuth = JSON.parse(storedAuth);
          console.log("Initializing auth with:", parsedAuth);
          setAuth(parsedAuth);
          // Redirect to chats if on login/register page
          if (location.pathname === "/login" || location.pathname === "/register") {
            navigate("/chats");
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        localStorage.removeItem("auth");
        setAuth({ token: null, user: null });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [navigate, location]);

  const login = async (data) => {
    try {
      console.log("Login data received:", data);
      if (!data.token || !data.user?._id || !data.user?.name) {
        throw new Error("Invalid login data");
      }
      setAuth(data);
      localStorage.setItem("auth", JSON.stringify(data));
      navigate("/chats");
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = () => {
    try {
      setAuth({ token: null, user: null });
      localStorage.removeItem("auth");
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const value = {
    auth,
    login,
    logout,
    loading
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
