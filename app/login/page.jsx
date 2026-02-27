"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!code) return;

    try {
      setLoading(true);

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Invalid code");
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-softbg px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-soft p-6">

        <h1 className="text-2xl font-semibold text-center mb-6">
          JSS Mail
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Enter Secret Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3 font-medium"
          >
            {loading ? "Checking..." : "Login"}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Private Access Only
        </p>
      </div>
    </div>
  );
}