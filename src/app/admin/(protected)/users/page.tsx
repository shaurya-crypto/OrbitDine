import connectToDatabase from "@/lib/mongodb/db";
import User from "@/models/User";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { UserTable } from "./UserTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await connectToDatabase();
  
  const users = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return (
    <div className="p-4 md:p-8 pb-20 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2">Users Directory</h1>
        <p className="text-zinc-400 text-sm md:text-base">Manage owners, customers, and staff accounts.</p>
      </div>

      <UserTable initialData={JSON.parse(JSON.stringify(users))} />
    </div>
  );
}
