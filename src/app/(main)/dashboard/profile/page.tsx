import type { Metadata } from "next";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { createClient } from "@/lib/supabase/server";

import { AdminAccountForm } from "./_components/admin-account-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Account",
  description:
    "Manage administrator profile, security credentials, and system privileges for Daet Cultural Heritage Experience.",
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    profile = data;
  }

  const initialUser = {
    id: user?.id ?? "daet-admin",
    email: user?.email ?? "admin@daet.gov.ph",
    fullName:
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Daet Heritage Admin",
    role: profile?.role ?? "admin",
    createdAt: user?.created_at,
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <span>Dashboard</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <span>Account</span>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Admin Account</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <AdminAccountForm initialUser={initialUser} />
    </div>
  );
}
