"use client";
import { showSuccess, showError } from "@/lib/toast"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/context/AuthContext";
import { validateAuth } from "@/lib/validators/auth";

import { cn } from "@/lib/utils";
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

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const validateLive = (field: string, value: string) => {
    const data = { email, password, confirmPassword: undefined, [field]: value };
    const result = validateAuth(data);

    if (!result.success) setErrors(result.errors);
    else setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = validateAuth({
      email,
      password,
      confirmPassword: undefined,
    });

    if (!result.success) {
      setErrors(result.errors);
      return;
    }

    const { error } = await signIn(email, password);

    if (error) {
      showError(error.message || "Something went wrong");
      return;
    }

    showSuccess("Logged in successfully");
    router.push("/dashboard");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email and password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              {/* EMAIL */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    validateLive("email", e.target.value);
                  }}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password[0]}
                  </p>
                )}
              </Field>
              <Field>
                <Button type="submit" className="w-full">
                  Login
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
