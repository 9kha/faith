import { ClientForm } from "./form";

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Add New Client</h1>
        <p className="text-muted-foreground">Record a new buyer, tenant, or owner</p>
      </div>
      <ClientForm />
    </div>
  );
}
