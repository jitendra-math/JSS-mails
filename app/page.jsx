import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {
  const cookieStore = cookies();
  const auth = cookieStore.get("jss-auth")?.value;

  // agar login hai → dashboard
  if (auth === "logged-in") {
    redirect("/dashboard");
  }

  // nahi toh login
  redirect("/login");
}