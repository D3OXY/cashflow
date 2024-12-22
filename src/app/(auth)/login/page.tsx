"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
    const router = useRouter();

    return (
        <div className="container max-w-lg mx-auto py-10">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground">Log in to your account to continue</p>
                </div>

                <AuthForm mode="login" onSuccess={() => router.push("/")} />

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/signup" className="font-medium underline underline-offset-4">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
