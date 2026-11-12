"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function updateAdminProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized. Please sign in as an Administrator." };
  }

  const fullName = (formData.get("fullName") as string)?.trim();

  if (!fullName) {
    return { success: false, error: "Full name is required." };
  }

  // Update profile in profiles table
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ full_name: fullName, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  // Also update Supabase auth user metadata
  await supabase.auth.updateUser({
    data: { full_name: fullName, name: fullName },
  });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard", "layout");

  return { success: true, message: "Profile updated successfully." };
}

export async function updateAdminPassword(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized. Please sign in as an Administrator." };
  }

  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return { success: true, message: "Password updated successfully." };
}
