export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6">
      {children}
    </div>
  );
} 