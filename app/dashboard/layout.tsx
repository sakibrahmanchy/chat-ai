import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { CreditCheck } from "@/components/smarthrflow/credit-check"
export default function DashboardLayout({ children }: { children: React.ReactNode }) {

    return (
        <>
            <Header />
            <main className="flex-1 overflow-auto">
                <div className="w-full mx-auto p-8">
                    {children}
                </div>
            </main>
            <Toaster />
        </>
    )
}