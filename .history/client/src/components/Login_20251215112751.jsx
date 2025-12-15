import React from 'react';

import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';



function Login() {
  const { setShowLogin, setUser, fetchUser, loading,axios } = useAppContext();
  const navigate = useNavigate();
  const [state, setState] = useState("login"); // ✅ React.useState use karo
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

 // Login.jsx - BETTER SOLUTION
// Login.jsx - FIXED
// Login.jsx - Add debugging
const onSubmitHandle = async (e) => {
  e.preventDefault();
  setError("");
  setSubmitting(true);

  try {
    let payload = state === "register"
      ? { name, username, email, password }
      : { email, password };

    console.log("🔄 Sending login request...", payload);
    
    const { data } = await axios.post(`/api/user/${state}`, payload);

    console.log("✅ Login response:", data);

    if (data.success && data.token) {
      console.log("💾 Storing token and user data...");
      
      // ✅ Store token AND user data together
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      console.log("📦 Token stored:", data.token.substring(0, 20) + "...");
      console.log("👤 User stored:", data.user);
      
      // ✅ Update context immediately
      setUser(data.user);
      
      // ✅ Close modal and redirect
      setShowLogin(false);
      navigate('/');
      resetForm();
      
      // ✅ Refresh auth state
      setTimeout(() => {
        fetchUser();
      }, 500);
      
    } else {
      console.log("❌ Login failed:", data.message);
      setError(data.message || "Authentication failed");
    }
  } catch (error) {
    console.error("🚨 Auth error:", error);
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        "Something went wrong";
    setError(errorMessage);
  } finally {
    setSubmitting(false);
  }
};
  const resetForm = () => {
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
  };

  const handleClose = () => {
    setShowLogin(false);
    resetForm();
  };

  const switchState = () => {
    setState(state === "login" ? "register" : "login");
    setError("");
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-lg font-medium animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all"
    >
      <form
        onSubmit={onSubmitHandle}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white/90 backdrop-blur-md shadow-2xl border border-white/30 p-8 py-10 rounded-2xl w-[90%] max-w-md flex flex-col gap-5 animate-fadeIn"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 transition-colors"
          disabled={submitting}
        >
          <X size={22} />
        </button>

        <h2 className="text-3xl font-bold text-center text-gray-800">
          {state === "login" ? "Welcome Back 👋" : "Create Account ✨"}
        </h2>
        <p className="text-center text-gray-500 text-sm">
          {state === "login" ? "Login to continue your journey" : "Join us and start connecting"}
        </p>

        {error && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {state === "register" && (
          <>
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                onChange={(e) => setName(e.target.value)}
                value={name}
                placeholder="Enter your full name"
                className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                type="text"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <input
                onChange={(e) => setUsername(e.target.value)}
                value={username}
                placeholder="Choose a username"
                className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                type="text"
                required
                disabled={submitting}
              />
            </div>
          </>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter your email"
            className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            type="email"
            required
            disabled={submitting}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
            className="border border-gray-300 rounded-lg w-full p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            type="password"
            required
            disabled={submitting}
          />
        </div>

        {/* Switch Login/Register */}
        <p className="text-sm text-center text-gray-600">
          {state === "register" ? "Already have an account?" : "New here?"}{" "}
          <span
            onClick={switchState}
            className="text-blue-600 font-medium cursor-pointer hover:underline transition-colors"
          >
            {state === "register" ? "Login" : "Sign Up"}
          </span>
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold w-full py-2.5 rounded-lg shadow-md transition-all active:scale-95 disabled:active:scale-100 disabled:cursor-not-allowed"
        >
          {submitting ? "Please wait..." : (state === "register" ? "Create Account" : "Login")}
        </button>
      </form>
    </div>
  );
}

export default Login;