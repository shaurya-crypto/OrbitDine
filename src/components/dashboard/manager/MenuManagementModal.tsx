"use client";

import { useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { X, Plus, Edit2, Trash2 } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtimeMenu } from "../../../hooks/useRealtimeMenu"; // Trigger TS server reload

import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";

interface MenuManagementModalProps {
  restaurantId: string;
  onClose: () => void;
}

export function MenuManagementModal({ restaurantId, onClose }: MenuManagementModalProps) {
  const { data: menuData, isLoading } = useRealtimeMenu(restaurantId);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"categories" | "items">("categories");
  const toast = useToast();
  const { confirm } = useConfirm();

  // Category State
  const [catName, setCatName] = useState("");
  
  // Item State
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/menu/categories", { restaurantId, name: catName });
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      setCatName("");
      toast.success("Category added");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const ok = await confirm({ title: "Delete Category", message: "Delete this category?", isDanger: true });
    if (!ok) return;
    try {
      await axios.delete(`/api/menu/categories?categoryId=${id}`);
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      toast.success("Category deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete category");
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/menu/items", {
        restaurantId,
        categoryId: selectedCategory,
        name: itemName,
        price: parseFloat(itemPrice),
      });
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      setItemName("");
      setItemPrice("");
      toast.success("Item added");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to add item");
    }
  };

  const handleDeleteItem = async (id: string) => {
    const ok = await confirm({ title: "Delete Item", message: "Delete this item?", isDanger: true });
    if (!ok) return;
    try {
      await axios.delete(`/api/menu/items?itemId=${id}`);
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      toast.success("Item deleted");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete item");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
      <GlassPanel premium className="w-full max-w-4xl h-[80vh] flex flex-col relative bg-white text-neutral-900 overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-900 z-10">
          <X size={24} />
        </button>
        
        <div className="p-6 border-b border-neutral-100 flex gap-4">
          <h2 className="text-2xl font-bold mr-4">Menu Management</h2>
          <button 
            onClick={() => setActiveTab("categories")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "categories" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
          >
            Categories
          </button>
          <button 
            onClick={() => setActiveTab("items")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "items" ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"}`}
          >
            Menu Items
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex gap-8">
          {/* Form Side */}
          <div className="w-1/3 border-r border-neutral-100 pr-8">
            {activeTab === "categories" ? (
              <form onSubmit={handleAddCategory} className="space-y-4 sticky top-0">
                <h3 className="font-semibold text-lg">Add Category</h3>
                <input required type="text" value={catName} onChange={e => setCatName(e.target.value)} placeholder="Category Name" className="w-full px-4 py-2 rounded-lg border border-neutral-200" />
                <button type="submit" className="w-full py-2 bg-neutral-900 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-neutral-800">
                  <Plus size={16} /> Add
                </button>
              </form>
            ) : (
              <form onSubmit={handleAddItem} className="space-y-4 sticky top-0">
                <h3 className="font-semibold text-lg">Add Menu Item</h3>
                <select required value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-neutral-200">
                  <option value="">Select Category</option>
                  {menuData?.categories?.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
                <input required type="text" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Item Name" className="w-full px-4 py-2 rounded-lg border border-neutral-200" />
                <input required type="number" step="0.01" value={itemPrice} onChange={e => setItemPrice(e.target.value)} placeholder="Price" className="w-full px-4 py-2 rounded-lg border border-neutral-200" />
                <button type="submit" className="w-full py-2 bg-neutral-900 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-neutral-800">
                  <Plus size={16} /> Add Item
                </button>
              </form>
            )}
          </div>

          {/* List Side */}
          <div className="w-2/3">
            {isLoading ? <p>Loading...</p> : (
              activeTab === "categories" ? (
                <div className="space-y-2">
                  {menuData?.categories?.map((cat: any) => (
                    <div key={cat._id} className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                      <span className="font-medium">{cat.name}</span>
                      <button onClick={() => handleDeleteCategory(cat._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {menuData?.categories?.map((cat: any) => {
                    const items = menuData.items.filter((item: any) => item.categoryId === cat._id && !item.isDeleted);
                    if (items.length === 0) return null;
                    return (
                      <div key={cat._id}>
                        <h4 className="font-bold mb-3 text-neutral-400 uppercase text-xs tracking-wider">{cat.name}</h4>
                        <div className="space-y-2">
                          {items.map((item: any) => (
                            <div key={item._id} className="flex justify-between items-center p-4 bg-neutral-50 rounded-lg border border-neutral-100">
                              <div>
                                <span className="font-medium block">{item.name}</span>
                                <span className="text-sm text-neutral-500">₹{item.price.toFixed(2)}</span>
                              </div>
                              <button onClick={() => handleDeleteItem(item._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-md"><Trash2 size={18} /></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
