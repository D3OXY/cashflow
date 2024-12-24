export default function LoadingScreen() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="space-y-4 text-center">
                <div className="text-4xl font-bold">Cashflow</div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto" />
            </div>
        </div>
    );
}
