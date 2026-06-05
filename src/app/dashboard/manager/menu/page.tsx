"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRealtimeMenu } from "@/hooks/useRealtimeMenu";
import { Plus, Image as ImageIcon, Trash2, Edit2, Loader2, Search } from "lucide-react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

export default function MenuManagementPage() {
  const { restaurantId } = useAuthStore();
  const { data: menuData, isLoading } = useRealtimeMenu(restaurantId || "");
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit/Add State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    veg: true,
    available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || !menuData) return <div className="p-8 text-white flex justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  const categories = menuData.categories || [];
  const items = menuData.items || [];
  
  const displayCategory = activeCategory || (categories.length > 0 ? categories[0]._id : null);
  const filteredItems = items.filter((i: any) => 
    i.categoryId === displayCategory && 
    !i.isDeleted &&
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", price: "", categoryId: displayCategory || "", veg: true, available: true });
    setImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      categoryId: item.categoryId,
      veg: item.veg ?? true,
      available: item.available ?? true,
    });
    setImageFile(null);
    setImagePreview(item.image || "");
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = imagePreview;

      // 1. Upload Image to Cloudinary if new file selected
      if (imageFile) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        
        const base64 = await base64Promise;
        const uploadRes = await axios.post("/api/upload", { image: base64 });
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Save Item
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        image: finalImageUrl,
        restaurantId
      };

      if (editingItem) {
        await axios.patch("/api/menu/items", { itemId: editingItem._id, ...payload });
      } else {
        await axios.post("/api/menu/items", payload);
      }

      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to save item");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailable = async (item: any) => {
    try {
      await axios.patch("/api/menu/items", { itemId: item._id, available: !item.available });
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
    } catch (error) {
      alert("Failed to update availability");
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`/api/menu/items?itemId=${itemId}`);
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
    } catch (error) {
      alert("Failed to delete item");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-1">Menu Management</h1>
            <p className="text-zinc-400 text-sm">Create and organize your restaurant's offerings</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-accent/20"
          >
            <Plus size={18} /> Add New Item
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sticky top-8">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 px-2">Categories</h3>
              <div className="space-y-1">
                {categories.map((cat: any) => (
                  <button
                    key={cat._id}
                    onClick={() => setActiveCategory(cat._id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      displayCategory === cat._id 
                      ? "bg-accent/10 text-accent border border-accent/20" 
                      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-transparent"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1">
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item: any) => (
                <div key={item._id} className={`bg-zinc-900 border ${item.available ? 'border-zinc-800' : 'border-red-500/30'} rounded-2xl overflow-hidden flex flex-col transition-all hover:border-zinc-700`}>
                  {/* Image */}
                  <div className="h-40 w-full bg-zinc-800 relative group">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${!item.available && 'grayscale opacity-50'}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600"><ImageIcon size={32} /></div>
                    )}
                    
                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                      <button onClick={() => openEditModal(item)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 backdrop-blur-md transition-colors"><Trash2 size={18} /></button>
                    </div>

                    {!item.available && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                        Sold Out
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg text-white leading-tight">{item.name}</h3>
                      <div className={`w-3 h-3 rounded-full shrink-0 ${item.veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-4">{item.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-serif text-xl text-accent">₹{item.price.toFixed(2)}</span>
                      
                      {/* Toggle Available */}
                      <button 
                        onClick={() => handleToggleAvailable(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          item.available 
                          ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' 
                          : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {item.available ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                  No items found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-serif text-white mb-6">{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Upload Area */}
                  <div className="w-full md:w-1/3 space-y-4">
                    <div className="aspect-square w-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden relative group">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                          <ImageIcon size={32} />
                          <span className="text-xs font-medium">Upload Image</span>
                        </div>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 text-center">Supported: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>

                  {/* Form Fields */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Item Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder="e.g. Truffle Fries" />
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Price (₹)</label>
                        <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder="299.00" />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-medium text-zinc-400 mb-1.5">Category</label>
                        <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-accent/50 focus:outline-none appearance-none">
                          <option value="">Select...</option>
                          {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                      <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-accent/50 focus:outline-none resize-none" placeholder="Brief description of the item..."></textarea>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.veg} onChange={e => setFormData({...formData, veg: e.target.checked})} className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-green-500 focus:ring-green-500/50" />
                        <span className="text-sm text-zinc-300 flex items-center gap-2">Vegetarian <div className="w-2 h-2 rounded-full bg-green-500"></div></span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.available} onChange={e => setFormData({...formData, available: e.target.checked})} className="w-4 h-4 rounded border-zinc-700 bg-zinc-950 text-accent focus:ring-accent/50" />
                        <span className="text-sm text-zinc-300">Available (In Stock)</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Save Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
