"use client";
import { useState } from "react";
import { showSuccess, showError } from "@/components/toast"
import { useAuth } from "@/providers/context/AuthContext";
import { useRouter } from "next/navigation";
import { validateAuth } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function SignupForm() {
  const router = useRouter();
  const { signUp } = useAuth();

  // Form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Zod error state
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  // Realtime validation
  const validateLive = (field: string, value: string) => {
    const formData = { email, password, confirmPassword, [field]: value };
    const result = validateAuth(formData);

    if (!result.success) setErrors(result.errors);
    else setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = validateAuth({ email, password, confirmPassword });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    const { data, error } = await signUp(email, password);
    if (error) {
      showError(error.message || "Something went wrong");
      return;
    }
    showSuccess("Account created successfully");
    router.push("/dashboard");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateLive("email", e.target.value);
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email[0]}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validateLive("password", e.target.value);
                }}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password[0]}</p>
              )}
            </Field>
            <Field>
              <FieldLabel htmlFor="confirmPassword">
                Confirm Password
              </FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  validateLive("confirmPassword", e.target.value);
                }}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword[0]}
                </p>
              )}
            </Field>
            <FieldGroup>
              <Field>
                <Button type="submit" className="w-full">
                  Create Account
                </Button>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
