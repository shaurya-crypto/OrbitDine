"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRealtimeMenu } from "@/hooks/useRealtimeMenu";
import { Plus, Image as ImageIcon, Trash2, Edit2, Loader2, Search, AlertTriangle } from "lucide-react";
import { apiClient as axios } from "@/services/apiClient";
import { useQueryClient } from "@tanstack/react-query";

export default function MenuManagementPage() {
  const { restaurantId } = useAuthStore();
  const { data: menuData, isLoading } = useRealtimeMenu(restaurantId || "");
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Category Edit State
  const [categoryModal, setCategoryModal] = useState<{isOpen: boolean, category: any | null, name: string}>({ isOpen: false, category: null, name: "" });

  // Custom Dialog States
  const [deleteModal, setDeleteModal] = useState<{isOpen: boolean, type: 'item' | 'category' | null, target: any | null, title: string, message: string}>({ isOpen: false, type: null, target: null, title: '', message: '' });
  const [messageModal, setMessageModal] = useState<{isOpen: boolean, title: string, message: string, type: 'error' | 'success'}>({ isOpen: false, title: '', message: '', type: 'error' });
  const [clearAllModal, setClearAllModal] = useState<{isOpen: boolean, verifyName: string}>({ isOpen: false, verifyName: "" });
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    veg: true,
    available: true,
    isBestseller: false,
    chefSpecial: false,
    isNewArrival: false,
    limitedTimeOffer: false,
    tags: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || !menuData) return <div className="p-8 text-text-primary flex justify-center"><Loader2 className="animate-spin text-accent" /></div>;

  const categories = menuData.categories || [];
  const items = menuData.items || [];
  const restaurantName = "Your Restaurant"; // We should ideally fetch the actual restaurant name, but the user is the owner so we verify against the word 'CONFIRM' or their ID
  
  const displayCategory = activeCategory || (categories.length > 0 ? categories[0]._id : null);
  const filteredItems = items.filter((i: any) => 
    i.categoryId === displayCategory && 
    !i.isDeleted &&
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ 
      name: "", description: "", price: "", categoryId: displayCategory || "", veg: true, available: true,
      isBestseller: false, chefSpecial: false, isNewArrival: false, limitedTimeOffer: false, tags: ""
    });
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
      isBestseller: item.isBestseller || false,
      chefSpecial: item.chefSpecial || false,
      isNewArrival: item.isNewArrival || false,
      limitedTimeOffer: item.limitedTimeOffer || false,
      tags: item.tags ? item.tags.join(", ") : "",
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
        const uploadRes = await axios.post("/upload", { image: base64 });
        finalImageUrl = uploadRes.data.url;
      }

      // 2. Save Item
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        image: finalImageUrl,
        restaurantId
      };

      if (editingItem) {
        await axios.patch("/menu/items", { itemId: editingItem._id, ...payload });
      } else {
        await axios.post("/menu/items", payload);
      }

      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      setIsModalOpen(false);
    } catch (error) {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to save item', type: 'error' });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailable = async (item: any) => {
    try {
      await axios.patch("/menu/items", { itemId: item._id, available: !item.available });
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
    } catch (error) {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to update availability', type: 'error' });
    }
  };

  const confirmDeleteAction = async () => {
    setIsSubmitting(true);
    try {
      if (deleteModal.type === 'category') {
        await axios.delete(`/menu/categories?categoryId=${deleteModal.target._id}`);
        if (activeCategory === deleteModal.target._id) setActiveCategory(null);
      } else if (deleteModal.type === 'item') {
        await axios.delete(`/menu/items?itemId=${deleteModal.target._id}`);
      }
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      setDeleteModal({ ...deleteModal, isOpen: false });
    } catch (err: any) {
      setMessageModal({ isOpen: true, title: 'Error', message: err.response?.data?.error || `Failed to delete ${deleteModal.type}`, type: 'error' });
      setDeleteModal({ ...deleteModal, isOpen: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (item: any) => {
    setDeleteModal({
      isOpen: true,
      type: 'item',
      target: item,
      title: 'Delete Menu Item',
      message: `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryModal.name.trim() || categoryModal.name.trim() === categoryModal.category?.name) {
      setCategoryModal({ ...categoryModal, isOpen: false });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.patch("/menu/categories", { 
        categoryId: categoryModal.category._id, 
        name: categoryModal.name.trim() 
      });
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      setCategoryModal({ isOpen: false, category: null, name: "" });
    } catch (err) {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to rename category', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAllMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (clearAllModal.verifyName !== "DELETE ALL") return;
    
    setIsSubmitting(true);
    try {
      await axios.delete(`/restaurant/menu?restaurantId=${restaurantId}`);
      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
      setClearAllModal({ isOpen: false, verifyName: "" });
      setActiveCategory(null);
      setMessageModal({ isOpen: true, title: 'Success', message: 'Menu has been completely wiped.', type: 'success' });
    } catch (err) {
      setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to clear menu', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-text-primary p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif tracking-tight mb-1">Menu Management</h1>
            <p className="text-text-secondary text-sm">Create and organize your restaurant's offerings</p>
          </div>
          <div className="flex w-full md:w-auto gap-3">
            <button 
              onClick={() => setClearAllModal({ isOpen: true, verifyName: "" })}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-xl text-sm font-medium transition-all whitespace-nowrap"
            >
              <Trash2 size={16} /> Clear Menu
            </button>
            <button 
              onClick={openAddModal}
              className="flex flex-1 md:flex-none items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-accent/20 whitespace-nowrap"
            >
              <Plus size={18} /> Add Item
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Categories Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-surface border border-border rounded-2xl p-4 sticky top-8">
              <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 px-2">Categories</h3>
              
              <div className="flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar gap-2 md:gap-1 mb-4 pb-2 md:pb-0">
                {categories.map((cat: any) => (
                  <div key={cat._id} className="relative group flex items-center shrink-0 w-auto min-w-[140px] md:w-auto">
                    <button
                      onClick={() => setActiveCategory(cat._id)}
                      className={`w-full text-left pl-4 pr-16 py-3 rounded-xl text-sm font-medium transition-all truncate ${
                        displayCategory === cat._id 
                        ? "bg-accent/10 text-accent border border-accent/20" 
                        : "text-text-secondary hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-text-primary border border-transparent"
                      }`}
                    >
                      {cat.name}
                    </button>
                    <div className={`flex absolute right-1 items-center gap-1 transition-opacity ${
                      displayCategory === cat._id ? "opacity-100" : "opacity-0 md:group-hover:opacity-100 pointer-events-none md:pointer-events-auto"
                    }`}>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          setCategoryModal({ isOpen: true, category: cat, name: cat.name });
                        }}
                        className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors bg-surface md:bg-transparent shadow-sm md:shadow-none"
                        title="Rename"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          setDeleteModal({
                            isOpen: true,
                            type: 'category',
                            target: cat,
                            title: 'Delete Category',
                            message: `Are you sure you want to delete "${cat.name}"?`
                          });
                        }}
                        className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors bg-surface md:bg-transparent shadow-sm md:shadow-none"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <form 
                className="pt-4 border-t border-border flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const input = form.elements.namedItem('categoryName') as HTMLInputElement;
                  if (!input.value.trim()) return;
                  
                  try {
                    const res = await axios.post('/menu/categories', {
                      restaurantId,
                      name: input.value.trim(),
                      sortOrder: categories.length
                    });
                    if (res.status === 200 || res.status === 201) {
                      input.value = '';
                      queryClient.invalidateQueries({ queryKey: ["realtimeMenu", restaurantId] });
                    }
                  } catch (err) {
                    setMessageModal({ isOpen: true, title: 'Error', message: 'Failed to add category', type: 'error' });
                  }
                }}
              >
                <input 
                  name="categoryName"
                  type="text" 
                  placeholder="+ New Category" 
                  className="w-full bg-surface border border-border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-accent text-text-primary placeholder:text-text-secondary"
                />
              </form>
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1">
            <div className="mb-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 text-text-primary placeholder:text-text-secondary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredItems.map((item: any) => (
                <div key={item._id} className={`bg-surface border ${item.available ? 'border-border' : 'border-red-500/30'} rounded-2xl overflow-hidden flex flex-col transition-all hover:border-zinc-300 dark:hover:border-zinc-700`}>
                  {/* Image */}
                  <div className="h-40 w-full bg-zinc-100 dark:bg-zinc-800 relative group">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className={`w-full h-full object-cover ${!item.available && 'grayscale opacity-50'}`} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={32} /></div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(item)} className="p-2 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-lg text-white transition-colors shadow-lg"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(item)} className="p-2 bg-red-500/90 hover:bg-red-600 backdrop-blur-md rounded-lg text-white transition-colors shadow-lg"><Trash2 size={16} /></button>
                    </div>

                    {!item.available && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">
                        Sold Out
                      </div>
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="p-4 md:p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg text-text-primary leading-tight">{item.name}</h3>
                      <div className={`w-3 h-3 rounded-full shrink-0 ${item.veg ? 'bg-green-500' : 'bg-red-500'}`} />
                    </div>
                    <p className="text-text-secondary text-sm line-clamp-2 mb-4">{item.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-serif text-xl text-accent">₹{item.price.toFixed(2)}</span>
                      
                      {/* Toggle Available */}
                      <button 
                        onClick={() => handleToggleAvailable(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                          item.available 
                          ? 'bg-zinc-100 dark:bg-zinc-800 border-border text-text-secondary hover:bg-zinc-200 dark:hover:bg-zinc-700' 
                          : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                        }`}
                      >
                        {item.available ? 'Mark Sold Out' : 'Mark Available'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredItems.length === 0 && (
                <div className="col-span-full py-12 text-center text-text-secondary border-2 border-dashed border-border rounded-2xl">
                  No items found in this category.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clear All Menu Modal */}
      {clearAllModal.isOpen && (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-red-500/30 rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <AlertTriangle size={28} />
                <h2 className="text-2xl font-serif">Clear Entire Menu</h2>
              </div>
              <p className="text-text-secondary text-sm mb-6">
                This action is <strong>irreversible</strong>. It will delete ALL categories and ALL menu items for your restaurant immediately.
              </p>
              
              <form onSubmit={handleClearAllMenu}>
                <div className="mb-6">
                  <label className="block text-xs font-medium text-text-primary mb-1.5">Type <strong>DELETE ALL</strong> to confirm</label>
                  <input 
                    required 
                    autoFocus
                    type="text" 
                    value={clearAllModal.verifyName} 
                    onChange={e => setClearAllModal({...clearAllModal, verifyName: e.target.value})} 
                    className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-red-500 focus:outline-none" 
                    placeholder="DELETE ALL"
                  />
                </div>
                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <button type="button" onClick={() => setClearAllModal({ isOpen: false, verifyName: "" })} className="px-4 py-2 rounded-xl font-medium text-text-secondary hover:text-text-primary transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting || clearAllModal.verifyName !== "DELETE ALL"} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Wipe Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div className="bg-surface border border-border rounded-none sm:rounded-3xl w-full max-w-2xl min-h-screen sm:min-h-0 shadow-2xl relative">
            <div className="p-6 md:p-8">
              <h2 className="text-2xl font-serif text-text-primary mb-6">{editingItem ? 'Edit Menu Item' : 'Add New Item'}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Image Upload Area */}
                  <div className="w-full md:w-1/3 space-y-4">
                    <div className="aspect-square w-full bg-base border border-border rounded-2xl overflow-hidden relative group">
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary gap-2">
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
                    <p className="text-[10px] text-text-secondary text-center">Supported: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>

                  {/* Form Fields */}
                  <div className="w-full md:w-2/3 space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Item Name</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder="e.g. Truffle Fries" />
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-1/2">
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Price (₹)</label>
                        <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder="299.00" />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Category</label>
                        <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent/50 focus:outline-none appearance-none">
                          <option value="">Select...</option>
                          {categories.map((c: any) => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Description</label>
                      <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent/50 focus:outline-none resize-none" placeholder="Brief description of the item..."></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">Custom Tags (comma separated)</label>
                      <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent/50 focus:outline-none" placeholder="e.g. Spicy, Gluten-Free, Contains Nuts" />
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.veg} onChange={e => setFormData({...formData, veg: e.target.checked})} className="w-4 h-4 rounded border-border bg-base text-green-500 focus:ring-green-500/50" />
                        <span className="text-sm text-text-secondary flex items-center gap-2">Vegetarian <div className="w-2 h-2 rounded-full bg-green-500"></div></span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.available} onChange={e => setFormData({...formData, available: e.target.checked})} className="w-4 h-4 rounded border-border bg-base text-accent focus:ring-accent/50" />
                        <span className="text-sm text-text-secondary">Available</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 border-t border-border">
                      <label className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-xs font-medium text-text-secondary">Best Seller 🏆</span>
                        <input type="checkbox" checked={formData.isBestseller} onChange={e => setFormData({...formData, isBestseller: e.target.checked})} className="w-4 h-4 rounded border-border bg-base text-orange-500 focus:ring-orange-500/50" />
                      </label>
                      <label className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-xs font-medium text-text-secondary">Chef Special 👨‍🍳</span>
                        <input type="checkbox" checked={formData.chefSpecial} onChange={e => setFormData({...formData, chefSpecial: e.target.checked})} className="w-4 h-4 rounded border-border bg-base text-purple-500 focus:ring-purple-500/50" />
                      </label>
                      <label className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-xs font-medium text-text-secondary">Popular 🔥</span>
                        <input type="checkbox" checked={formData.isNewArrival} onChange={e => setFormData({...formData, isNewArrival: e.target.checked})} className="w-4 h-4 rounded border-border bg-base text-blue-500 focus:ring-blue-500/50" />
                      </label>
                      <label className="flex flex-col gap-1 cursor-pointer">
                        <span className="text-xs font-medium text-text-secondary">LTO ⏳</span>
                        <input type="checkbox" checked={formData.limitedTimeOffer} onChange={e => setFormData({...formData, limitedTimeOffer: e.target.checked})} className="w-4 h-4 rounded border-border bg-base text-red-500 focus:ring-red-500/50" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-medium text-text-secondary hover:text-text-primary transition-colors">
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

      {/* Category Rename Modal */}
      {categoryModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-serif text-text-primary mb-4">Rename Category</h2>
              <form onSubmit={handleSaveCategory}>
                <div className="mb-6">
                  <label className="block text-xs font-medium text-text-secondary mb-1.5">Category Name</label>
                  <input 
                    required 
                    autoFocus
                    type="text" 
                    value={categoryModal.name} 
                    onChange={e => setCategoryModal({...categoryModal, name: e.target.value})} 
                    className="w-full bg-base border border-border rounded-xl px-4 py-2.5 text-text-primary focus:ring-2 focus:ring-accent/50 focus:outline-none" 
                  />
                </div>
                <div className="flex justify-end gap-3 border-t border-border pt-4">
                  <button type="button" onClick={() => setCategoryModal({ isOpen: false, category: null, name: "" })} className="px-4 py-2 rounded-xl font-medium text-text-secondary hover:text-text-primary transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <h2 className="text-xl font-serif text-text-primary mb-2">{deleteModal.title}</h2>
              <p className="text-text-secondary text-sm mb-6">{deleteModal.message}</p>
              
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, type: null, target: null, title: '', message: '' })} 
                  className="px-4 py-2 rounded-xl font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteAction} 
                  disabled={isSubmitting} 
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generic Message Modal */}
      {messageModal.isOpen && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6">
              <h2 className={`text-xl font-serif mb-2 ${messageModal.type === 'error' ? 'text-red-500' : 'text-text-primary'}`}>
                {messageModal.title}
              </h2>
              <p className="text-text-secondary text-sm mb-6">{messageModal.message}</p>
              
              <div className="flex justify-end gap-3 border-t border-border pt-4">
                <button 
                  onClick={() => setMessageModal({ ...messageModal, isOpen: false })} 
                  className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-primary rounded-xl font-medium transition-colors"
                >
                  Okay
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
