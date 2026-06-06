"use client";

import { useMenu } from "@/hooks/useMenu";
import { toggleMenuItemAvailability } from "@/services/dashboardService";
import { Loader } from "@/components/ui/Loader";
import { useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/components/ui/ToastProvider";

export function MenuControlPanel({ restaurantId }: { restaurantId: string }) {
  const { data, isLoading } = useMenu(restaurantId);
  const queryClient = useQueryClient();
  const toast = useToast();

  if (isLoading) return <div className="p-4"><Loader /></div>;
  if (!data) return null;

  const handleToggle = async (menuItemId: string, currentStatus: boolean) => {
    try {
      await toggleMenuItemAvailability({ menuItemId, isAvailable: !currentStatus });
      queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
      toast.success(`Item marked as ${!currentStatus ? 'Available' : 'Sold Out'}`);
    } catch (err) {
      toast.error("Failed to toggle menu item");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
      <div className="p-4 border-b border-neutral-100 bg-neutral-50 flex justify-between items-center">
        <h2 className="font-semibold text-neutral-900">Menu Controls</h2>
        <form 
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('categoryName') as HTMLInputElement;
            if (!input.value.trim()) return;
            
            try {
              const res = await fetch('/api/menu/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ restaurantId, name: input.value.trim(), sortOrder: data.menu.length })
              });
              if (res.ok) {
                input.value = '';
                queryClient.invalidateQueries({ queryKey: ["menu", restaurantId] });
                toast.success('Category added');
              } else {
                toast.error('Failed to add category');
              }
            } catch (err) {
              toast.error('Error adding category');
            }
          }}
        >
          <input 
            name="categoryName"
            type="text" 
            placeholder="New Category Name" 
            className="text-sm px-3 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-400"
          />
          <button 
            type="submit"
            className="text-sm px-3 py-1.5 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Add
          </button>
        </form>
      </div>
      <div className="p-4 max-h-[400px] overflow-y-auto space-y-6">
        {data.menu.map((category: any) => (
          <div key={category.id}>
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-3">{category.name}</h3>
            <div className="space-y-2">
              {category.items.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div>
                    <p className="font-medium text-neutral-900 text-sm">{item.name}</p>
                    <p className="text-xs text-neutral-500">₹{item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(item.id, item.isAvailable ?? true)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                      item.isAvailable !== false
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    {item.isAvailable !== false ? "Available" : "Sold Out"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
