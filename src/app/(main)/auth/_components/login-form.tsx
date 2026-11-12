"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

const formSchema = z.object({
  email: z.email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  async function onSubmit(data: FormValues) {
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error("Login failed", {
          description: error.message,
        });
        return;
      }

      if (authData?.user) {
        // Query profile to verify admin role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", authData.user.id).single();

        if (profile && profile.role !== "admin") {
          toast.warning("Access Restricted", {
            description: "Your account is not authorized as an administrator.",
          });
          router.push("/unauthorized");
          return;
        }
      }

      toast.success("Welcome back, Administrator!", {
        description: "Authenticated successfully. Redirecting to dashboard...",
        duration: 3000,
      });

      // Always redirect directly to the Overview & Telemetry metrics dashboard
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 500);
    } catch (err) {
      toast.error("Authentication error", {
        description: err instanceof Error ? err.message : "Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FieldGroup className="gap-4">
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-email">Email Address</FieldLabel>
              <Input
                {...field}
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <Field className="gap-1.5" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="login-password">Password</FieldLabel>
              <Input
                {...field}
                id="login-password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="remember"
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id="login-remember"
                name={field.name}
                checked={field.value}
                disabled={isLoading}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                aria-invalid={fieldState.invalid}
              />
              <FieldContent>
                <FieldLabel htmlFor="login-remember" className="font-normal">
                  Remember me for 30 days
                </FieldLabel>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </FieldContent>
            </Field>
          )}
        />
      </FieldGroup>
      <Button
        className="w-full bg-[#c5a059] text-black font-semibold hover:bg-[#b08e48] transition-all shadow-md shadow-[#c5a059]/20 hover:shadow-lg hover:shadow-[#c5a059]/30 h-10 cursor-pointer"
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Spinner /> Logging in...
          </span>
        ) : (
          "Login to Dashboard"
        )}
      </Button>
    </form>
  );
}
