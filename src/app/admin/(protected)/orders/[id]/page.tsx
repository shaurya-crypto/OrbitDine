import connectToDatabase from "@/lib/mongodb/db";
import Order from "@/models/Order";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { ShoppingBag, Calendar, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await connectToDatabase();
  const { id } = await params;
  const order = await Order.findById(id).populate("restaurantId", "name").lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="p-4 md:p-8 pb-20 space-y-6 max-w-4xl mx-auto">
      <Link href="/admin/search" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </Link>

      <div>
        <h1 className="text-2xl md:text-3xl font-serif text-white tracking-tight mb-2 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-orange-500" />
          Order #{order._id.toString().slice(-6)}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            order.status === "completed" ? "bg-emerald-500/10 text-emerald-400" :
            order.status === "cancelled" ? "bg-red-500/10 text-red-400" :
            "bg-orange-500/10 text-orange-400"
          }`}>
            {order.status?.toUpperCase() || "PENDING"}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
            {order.orderType?.toUpperCase() || "DINE-IN"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">Financials</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Total Amount</span>
              <span className="font-medium text-white">₹{order.totalAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Payment Status</span>
              <span className={`flex items-center gap-1 ${order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}`}>
                {order.paymentStatus === 'paid' && <CheckCircle2 className="w-4 h-4" />}
                {order.paymentStatus?.toUpperCase() || "PENDING"}
              </span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6 border-zinc-800/50 bg-zinc-900/50">
          <h2 className="text-lg font-medium text-white mb-4">Order Meta</h2>
          <div className="space-y-4 text-sm text-zinc-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Order ID</span>
              <span className="font-mono text-xs">{order._id.toString()}</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <span className="text-zinc-500">Restaurant ID</span>
              <span className="font-mono text-xs">{order.restaurantId?.toString() || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Placed On</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
