"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useSpace } from "@/context/space";
import { UserSettings } from "@/components/settings/user-settings";
import { SpaceSettings } from "@/components/settings/space-settings";

export default function SettingsPage() {
    const { currentSpace } = useSpace();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">Manage your account and space settings.</p>
            </div>

            <Tabs defaultValue="user" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="user">User Settings</TabsTrigger>
                    <TabsTrigger value="space" disabled={!currentSpace}>
                        Space Settings
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="user" className="space-y-4">
                    <UserSettings />
                </TabsContent>
                <TabsContent value="space" className="space-y-4">
                    {currentSpace ? (
                        <SpaceSettings space={currentSpace} />
                    ) : (
                        <Card className="p-6">
                            <p className="text-muted-foreground">Please select a space to manage its settings.</p>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
