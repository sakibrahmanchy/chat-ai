import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { SupportButton } from "@/components/support-button"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="flex-1 overflow-auto">
                <div className="w-full mx-auto px-8 py-4">
                    {children}
                </div>
            </main>
            <Toaster />
            <SupportButton />
        </>
    )
}