export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">B</span>
        </div>
        <span className="font-semibold text-gray-900">BLIMS</span>
        <span className="text-gray-400 text-sm ml-2">Laboratory Data Intake</span>
      </header>
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-8">{children}</main>
      <footer className="border-t bg-white px-6 py-3 text-center text-xs text-gray-400">
        BLIMS — Laboratory Information Management System
      </footer>
    </div>
  );
}
