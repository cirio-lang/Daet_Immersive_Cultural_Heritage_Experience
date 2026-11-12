import { redirect } from "next/navigation";

export default function DefaultDashboardRedirect() {
  redirect("/dashboard");
}
