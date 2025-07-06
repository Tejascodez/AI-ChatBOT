"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthForm from "./authentication/page";

export default function Home() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      router.replace("/chat"); // 🔁 replaces history, no back button to /login
    } else {
      setCheckingAuth(false); // ✅ show login only when not logged in
    }
  }, []);

  if (checkingAuth) {
    return null; 
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <AuthForm />
    </main>
  );
}
