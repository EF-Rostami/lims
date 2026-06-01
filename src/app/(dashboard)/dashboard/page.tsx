export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">System Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 border rounded-xl bg-card shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
          <p className="text-2xl font-bold text-green-600">Active</p>
        </div>
        {/* More stat cards here */}
      </div>
    </div>
  );
}