import Header from "@/components/header"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="flex-1 overflow-auto">
                <div className="w-full mx-auto p-8">
                    {children}
                </div>
            </main>
        </>
    )
}