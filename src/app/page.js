import { redirect } from "next/navigation";

export default function Home() {
  // Redirect immediately to the login page
  redirect("/Auth/Login");
}
