"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignupPage() {
    const router = useRouter();

    return (
        <div className="container max-w-lg mx-auto py-10">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-muted-foreground">Sign up to get started with Cashflow</p>
                </div>

                <AuthForm mode="signup" onSuccess={() => router.push("/")} />

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium underline underline-offset-4">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}
