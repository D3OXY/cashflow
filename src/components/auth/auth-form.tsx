"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { doc, setDoc } from "firebase/firestore";
import { getDb } from "@/lib/firebase/config";
import { Card } from "@/components/ui/card";
import { FirebaseError } from "firebase/app";

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
});

interface AuthFormProps {
    mode: "login" | "signup";
    onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
    const router = useRouter();
    const { signIn, signUp } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            if (mode === "login") {
                await signIn(data.email, data.password);
                toast.success("Logged in successfully");
            } else {
                const userCredential = await signUp(data.email, data.password);
                // Create user document in Firestore
                const db = getDb();
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: data.email,
                    displayName: "",
                    photoURL: null,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                toast.success("Account created successfully");
            }
            onSuccess?.();
            router.push("/");
        } catch (error) {
            console.error("Authentication error:", error);
            if (error instanceof FirebaseError) {
                const code = error.code;
                // Map Firebase auth error codes to user-friendly messages
                if (code === "auth/user-not-found" || code === "auth/wrong-password") {
                    toast.error("Invalid email or password");
                } else if (code === "auth/email-already-in-use") {
                    toast.error("This email is already registered");
                } else if (code === "auth/invalid-email") {
                    toast.error("Please enter a valid email address");
                } else if (code === "auth/invalid-password") {
                    toast.error("Password must be at least 6 characters");
                } else if (code.includes("auth/too-many-requests")) {
                    toast.error("Too many attempts. Please try again later");
                } else if (code === "auth/operation-not-allowed") {
                    toast.error("This sign-in method is not enabled");
                } else if (code === "auth/network-request-failed") {
                    toast.error("Network error. Please check your connection");
                } else {
                    toast.error(code);
                }
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    }

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
                                {mode === "login" ? "Logging in..." : "Creating account..."}
                            </div>
                        ) : mode === "login" ? (
                            "Log in"
                        ) : (
                            "Create account"
                        )}
                    </Button>
                </form>
            </Form>
        </Card>
    );
}
