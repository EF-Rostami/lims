import { CreditCard } from "lucide-react";

export const metadata = {
  title: "Billing | BLIMS Platform",
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage plans, subscriptions, and invoices for your customers.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-slate-100 p-4">
          <CreditCard className="h-8 w-8 text-slate-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-slate-700">Billing coming soon</p>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Plan management, subscription tracking, and invoicing will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
