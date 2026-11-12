"use client";

import { useState } from "react";

import { Check, Eye, KeyRound, Landmark, Lock, QrCode, ShieldCheck, UserCheck } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials } from "@/lib/utils";

import { updateAdminPassword, updateAdminProfile } from "../actions";

interface AdminAccountFormProps {
  initialUser: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt?: string;
  };
}

export function AdminAccountForm({ initialUser }: AdminAccountFormProps) {
  const [fullName, setFullName] = useState(initialUser.fullName);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const displayName = fullName || initialUser.email.split("@")[0];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage(null);

    const formData = new FormData();
    formData.append("fullName", fullName);

    const res = await updateAdminProfile(formData);
    setIsUpdatingProfile(false);

    if (res.success) {
      setProfileMessage({ type: "success", text: res.message ?? "Profile updated." });
    } else {
      setProfileMessage({ type: "error", text: res.error ?? "Failed to update profile." });
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Password must be at least 6 characters." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsUpdatingPassword(true);
    const formData = new FormData();
    formData.append("newPassword", newPassword);
    formData.append("confirmPassword", confirmPassword);

    const res = await updateAdminPassword(formData);
    setIsUpdatingPassword(false);

    if (res.success) {
      setPasswordMessage({ type: "success", text: res.message ?? "Password updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordMessage({ type: "error", text: res.error ?? "Failed to update password." });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="size-16 border-2 border-[#c5a059]/30">
            <AvatarFallback className="bg-[#c5a059]/15 text-[#c5a059] font-bold text-xl">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading font-semibold text-xl sm:text-2xl">{displayName}</h1>
              <Badge className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300 font-medium">
                <ShieldCheck className="mr-1 size-3.5" />
                System Administrator
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{initialUser.email} · Municipality of Daet, Camarines Norte</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Profile Information
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Security & Password
          </TabsTrigger>
          <TabsTrigger
            value="privileges"
            className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            System Privileges
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Administrator Profile</CardTitle>
              <CardDescription>
                Manage your administrator credentials for the Daet Immersive Cultural Heritage Experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Juan dela Cruz"
                  />
                  <p className="text-muted-foreground text-xs">
                    This name will appear on the admin dashboard and curatorial update logs.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={initialUser.email} disabled className="bg-muted" />
                  <p className="text-muted-foreground text-xs">
                    Managed via Supabase Authentication. Used for sign-in and security notifications.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role">System Role</Label>
                  <Input id="role" value="Administrator (Full Access)" disabled className="bg-muted font-medium" />
                  <p className="text-muted-foreground text-xs">
                    Assigned in database. Visitors and public users have browse-only privileges.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="jurisdiction">Municipal Jurisdiction</Label>
                  <Input id="jurisdiction" value="Daet, Camarines Norte, Region V" disabled className="bg-muted" />
                </div>

                {profileMessage && (
                  <div
                    className={`rounded-md p-3 text-sm ${
                      profileMessage.type === "success"
                        ? "border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                        : "border border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {profileMessage.text}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-[#c5a059] text-black hover:bg-[#b08e48]"
                >
                  {isUpdatingProfile ? "Saving changes..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security */}
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security & Credentials</CardTitle>
              <CardDescription>
                Update your administrative account password and review active session security.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>

                {passwordMessage && (
                  <div
                    className={`rounded-md p-3 text-sm ${
                      passwordMessage.type === "success"
                        ? "border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                        : "border border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-[#c5a059] text-black hover:bg-[#b08e48]"
                >
                  <KeyRound className="mr-1.5 size-4" />
                  {isUpdatingPassword ? "Updating password..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Privileges */}
        <TabsContent value="privileges" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Privileges & Heritage Scope</CardTitle>
              <CardDescription>
                This account holds administrative rights over all Daet Cultural Heritage digital assets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Landmark className="size-5 text-[#c5a059] mt-0.5 shrink-0" />
                  <div>
                    <h2 className="font-semibold text-sm">Heritage Sites Management</h2>
                    <p className="text-muted-foreground text-xs mt-1">
                      Full authority to register, update, and publish Daet monuments, historical markers, and churches.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <Eye className="size-5 text-[#c5a059] mt-0.5 shrink-0" />
                  <div>
                    <h2 className="font-semibold text-sm">360° Panoramas & Photogrammetry</h2>
                    <p className="text-muted-foreground text-xs mt-1">
                      Upload and calibrate equirectangular panoramic scenes for immersive on-site viewer experiences.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <QrCode className="size-5 text-[#c5a059] mt-0.5 shrink-0" />
                  <div>
                    <h2 className="font-semibold text-sm">QR Code Placards & Physical Landmarks</h2>
                    <p className="text-muted-foreground text-xs mt-1">
                      Generate and print tracking-enabled QR codes for physical monument plaques across Daet.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <UserCheck className="size-5 text-[#c5a059] mt-0.5 shrink-0" />
                  <div>
                    <h2 className="font-semibold text-sm">Audience Scans & Telemetry</h2>
                    <p className="text-muted-foreground text-xs mt-1">
                      Analyze physical on-site tourist scans versus online web visitors in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
