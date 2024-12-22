"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppConfig } from "@/context/app-config";
import type { FirebaseConfig } from "@/lib/types/store";
import { toast } from "sonner";

const firebaseConfigSchema = z.object({
    apiKey: z.string().min(1, "API Key is required"),
    authDomain: z.string().min(1, "Auth Domain is required"),
    projectId: z.string().min(1, "Project ID is required"),
    storageBucket: z.string().min(1, "Storage Bucket is required"),
    messagingSenderId: z.string().min(1, "Messaging Sender ID is required"),
    appId: z.string().min(1, "App ID is required"),
});

export function SetupWizard() {
    const { setFirebaseConfig } = useAppConfig();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<FirebaseConfig>({
        resolver: zodResolver(firebaseConfigSchema),
        defaultValues: {
            apiKey: "",
            authDomain: "",
            projectId: "",
            storageBucket: "",
            messagingSenderId: "",
            appId: "",
        },
    });

    const onSubmit = async (data: FirebaseConfig) => {
        try {
            setIsLoading(true);
            await setFirebaseConfig(data);
        } catch (error) {
            console.error("Failed to save Firebase config:", error);
            toast.error("Failed to save Firebase config");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container max-w-lg mx-auto py-10">
            <Card className="p-6">
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold">Welcome to Cashflow</h1>
                        <p className="text-muted-foreground">To get started, please enter your Firebase project credentials.</p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="apiKey"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>API Key</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Your Firebase API Key" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="authDomain"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Auth Domain</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your-app.firebaseapp.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your-project-id" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="storageBucket"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Storage Bucket</FormLabel>
                                        <FormControl>
                                            <Input placeholder="your-app.appspot.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="messagingSenderId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Messaging Sender ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="123456789" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="appId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>App ID</FormLabel>
                                        <FormControl>
                                            <Input placeholder="1:123456789:web:abcdef" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Configuration"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </Card>
        </div>
    );
}
