"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

type Mode = "login" | "register";

export default function AuthForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async () => {
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await axios.post(endpoint, { email, password });
      setMessage(res.data.message || "");

      if (res.data.token) {
        setToken(res.data.token);
        localStorage.setItem("token", res.data.token);
        router.push("/chat"); // ✅ Redirect to chat after login
      }
    } catch (err: any) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        {mode === "login" ? "Login" : "Register"}
      </h2>

      <input
        type="email"
        className="w-full p-2 border rounded mb-3"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="w-full p-2 border rounded mb-3"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-blue-600 text-white py-2 rounded mb-3"
      >
        {mode === "login" ? "Login" : "Register"}
      </button>

      <p className="text-center text-sm">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <button className="text-blue-500" onClick={() => setMode("register")}>
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button className="text-blue-500" onClick={() => setMode("login")}>
              Login
            </button>
          </>
        )}
      </p>

      {message && <p className="text-center mt-4 text-red-500">{message}</p>}
    </div>
  );
}
