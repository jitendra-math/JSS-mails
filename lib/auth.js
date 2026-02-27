import { cookies } from "next/headers";

// 🔐 check master code (login)
export function verifyMasterCode(code) {
  if (!code) return false;
  return code === process.env.MASTER_CODE;
}

// 🍪 set login cookie
export function setAuthCookie() {
  cookies().set("jss-auth", "logged-in", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

// ❌ logout cookie remove
export function clearAuthCookie() {
  cookies().delete("jss-auth");
}

// 🛡️ check logged in or not
export function isAuthenticated() {
  const cookieStore = cookies();
  const token = cookieStore.get("jss-auth");
  return token?.value === "logged-in";
}