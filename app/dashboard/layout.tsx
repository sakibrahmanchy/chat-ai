import Header from "@/components/header"
import { ClerkLoaded } from "@clerk/nextjs"

function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkLoaded>
            <div className="flex-1 flex flex-col h-screen w-screen">
                <Header />

                <main className="overflow y-auto">{children}</main>
            </div>
        </ClerkLoaded>
    )
}
export default DashboardLayout