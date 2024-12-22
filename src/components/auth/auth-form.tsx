"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";

const authSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

interface AuthFormProps {
    mode: "login" | "signup";
    onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const form = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: AuthFormData) => {
        try {
            setIsLoading(true);
            if (mode === "login") {
                await signIn(data.email, data.password);
                toast.success("Successfully logged in");
            } else {
                await signUp(data.email, data.password);
                toast.success("Successfully signed up");
            }
            onSuccess?.();
        } catch (error) {
            console.error("Authentication error:", error);
            toast.error(mode === "login" ? "Failed to log in" : "Failed to sign up");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="p-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="Enter your email" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Enter your password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                {mode === "login" ? "Logging in..." : "Signing up..."}
                            </div>
                        ) : mode === "login" ? (
                            "Log in"
                        ) : (
                            "Sign up"
                        )}
                    </Button>
                </form>
            </Form>
        </Card>
    );
}
