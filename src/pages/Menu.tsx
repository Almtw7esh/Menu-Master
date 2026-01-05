import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Restaurant, Branch, MenuItem } from '@/types';
import { Plus, Pencil, Trash2, UtensilsCrossed, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';

const CATEGORIES = [
  'Appetizers',
  'Main Course',
  'Grills',
  'Seafood',
  'Sandwiches',
  'Pizza',
  'Pasta',
  'Salads',
  'Soups',
  'Desserts',
  'Beverages',
  'Breakfast',
];

export default function Menu() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterRestaurant, setFilterRestaurant] = useState<string>('all');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });
      if (restaurantsError || branchesError || menuItemsError) throw restaurantsError || branchesError || menuItemsError;
      setRestaurants(restaurantsData || []);
      setBranches(branchesData || []);
      setMenuItems(menuItemsData || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !selectedBranch || !name.trim() || !price || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Saving menu item with image:', image);
      const itemData = {
        restaurantId: selectedRestaurant,
        branchId: selectedBranch,
        name,
        price: parseFloat(price),
        category,
        ...(image && { image }),
      };

      if (editingItem) {
        await updateDoc(doc(db, 'menuItems', editingItem.id), itemData);
        toast.success('Menu item updated successfully');
      } else {
        await addDoc(collection(db, 'menuItems'), { ...itemData, createdAt: Timestamp.now() });
        toast.success('Menu item added successfully');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save menu item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setSelectedRestaurant(item.restaurantId);
    setSelectedBranch(item.branchId);
    setName(item.name);
    setPrice(item.price.toString());
    setCategory(item.category);
    setImage(item.image || '');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteDoc(doc(db, 'menuItems', id));
      toast.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete item');
    }
  };

  const resetForm = () => {
    setSelectedRestaurant('');
    setSelectedBranch('');
    setName('');
    setPrice('');
    setCategory('');
    setImage('');
    setEditingItem(null);
    setDialogOpen(false);
  };

  const getRestaurantName = (id: string) => restaurants.find((r) => r.id === id)?.name || 'Unknown';
  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || 'Unknown';

  const filteredBranchesForForm = branches.filter((b) => b.restaurantId === selectedRestaurant);
  const filteredBranchesForFilter = filterRestaurant === 'all' ? branches : branches.filter((b) => b.restaurantId === filterRestaurant);

  const filteredItems = menuItems.filter((item) => {
    if (filterRestaurant !== 'all' && item.restaurantId !== filterRestaurant) return false;
    if (filterBranch !== 'all' && item.branchId !== filterBranch) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Group by restaurant > branch > category
  const groupedItems = filteredItems.reduce((acc, item) => {
    const restaurantId = item.restaurantId;
    const branchId = item.branchId;
    if (!acc[restaurantId]) acc[restaurantId] = {};
    if (!acc[restaurantId][branchId]) acc[restaurantId][branchId] = [];
    acc[restaurantId][branchId].push(item);
    return acc;
  }, {} as Record<string, Record<string, MenuItem[]>>);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Menu Items</h1>
          <p className="text-muted-foreground mt-1">Manage menu items for each branch</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button disabled={branches.length === 0}>
              <Plus className="h-5 w-5" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Restaurant *</label>
                  <Select value={selectedRestaurant} onValueChange={(v) => { setSelectedRestaurant(v); setSelectedBranch(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {restaurants.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch *</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch} disabled={!selectedRestaurant}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {filteredBranchesForForm.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Item Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Chicken Shawarma" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (IQD) *</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 15000" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <ImageUpload
                value={image}
                onChange={setImage}
                label="Item Image (Recommended)"
              />

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : editingItem ? 'Update' : 'Add'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search items..." className="pl-10" />
        </div>
        <Select value={filterRestaurant} onValueChange={(v) => { setFilterRestaurant(v); setFilterBranch('all'); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Restaurant" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Restaurants</SelectItem>
            {restaurants.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {filteredBranchesForFilter.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {branches.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No branches yet</h3>
            <p className="text-muted-foreground">Add branches first before adding menu items</p>
          </CardContent>
        </Card>
      ) : Object.keys(groupedItems).length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No menu items found</h3>
            <p className="text-muted-foreground mb-6">{searchQuery || filterCategory !== 'all' ? 'Try adjusting your filters' : 'Add your first menu item'}</p>
            {!searchQuery && filterCategory === 'all' && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-5 w-5" />
                Add Item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([restaurantId, branchesData]) => (
            <div key={restaurantId} className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                {restaurants.find(r => r.id === restaurantId)?.logo && (
                  <img 
                    src={restaurants.find(r => r.id === restaurantId)?.logo} 
                    alt="" 
                    className="h-10 w-10 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                )}
                {getRestaurantName(restaurantId)}
              </h2>
              
              {Object.entries(branchesData).map(([branchId, items]) => {
                const branch = branches.find(b => b.id === branchId);
                const categorizedItems = items.reduce((acc, item) => {
                  if (!acc[item.category]) acc[item.category] = [];
                  acc[item.category].push(item);
                  return acc;
                }, {} as Record<string, MenuItem[]>);

                return (
                  <Card key={branchId} className="shadow-card ml-4">
                    <CardHeader className="border-b border-border pb-4">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-primary">↳</span>
                        {getBranchName(branchId)}
                        <span className="text-sm font-normal text-muted-foreground">• {branch?.state}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {Object.entries(categorizedItems).map(([cat, catItems]) => (
                        <div key={cat}>
                          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{cat}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {catItems.map((item, index) => (
                              <div
                                key={item.id}
                                className="flex gap-3 p-3 rounded-xl bg-secondary/30 border border-border hover:border-primary/50 transition-all group animate-scale-in"
                                style={{ animationDelay: `${index * 0.03}s` }}
                              >
                                {item.image ? (
                                  <img 
                                    src={item.image} 
                                    alt={item.name} 
                                    className="h-16 w-16 rounded-lg object-cover flex-shrink-0"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                                    }}
                                  />
                                ) : (
                                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <UtensilsCrossed className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium text-foreground truncate">{item.name}</h5>
                                  <p className="text-lg font-bold text-primary">{item.price.toLocaleString()} IQD</p>
                                </div>
                                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(item)}>
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}>
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
