import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Restaurant, Branch } from '@/types';
import { Plus, Pencil, Trash2, GitBranch, MapPin, Truck } from 'lucide-react';
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

export default function Branches() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [location, setLocation] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterRestaurant, setFilterRestaurant] = useState<string>('all');

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
      if (restaurantsError || branchesError) throw restaurantsError || branchesError;
      setRestaurants(restaurantsData || []);
      setBranches(branchesData || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurant || !name.trim() || !state.trim() || !location.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Saving branch with image:', image);
      const branchData = {
        restaurantId: selectedRestaurant,
        name,
        state,
        location,
        deliveryPrice: parseFloat(deliveryPrice) || 0,
        ...(image && { image }),
      };

      if (editingBranch) {
        await updateDoc(doc(db, 'branches', editingBranch.id), branchData);
        toast.success('Branch updated successfully');
      } else {
        await addDoc(collection(db, 'branches'), {
          ...branchData,
          createdAt: Timestamp.now(),
        });
        toast.success('Branch added successfully');
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to save branch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setSelectedRestaurant(branch.restaurantId);
    setName(branch.name);
    setState(branch.state);
    setLocation(branch.location);
    setDeliveryPrice(branch.deliveryPrice.toString());
    setImage(branch.image || '');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;

    try {
      await deleteDoc(doc(db, 'branches', id));
      toast.success('Branch deleted successfully');
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete branch');
    }
  };

  const resetForm = () => {
    setSelectedRestaurant('');
    setName('');
    setState('');
    setLocation('');
    setDeliveryPrice('');
    setImage('');
    setEditingBranch(null);
    setDialogOpen(false);
  };

  const getRestaurantName = (restaurantId: string) => {
    return restaurants.find((r) => r.id === restaurantId)?.name || 'Unknown';
  };

  const getRestaurantLogo = (restaurantId: string) => {
    return restaurants.find((r) => r.id === restaurantId)?.logo;
  };

  const filteredBranches = filterRestaurant === 'all'
    ? branches
    : branches.filter((b) => b.restaurantId === filterRestaurant);

  // Group branches by restaurant
  const groupedBranches = filteredBranches.reduce((acc, branch) => {
    const restaurantId = branch.restaurantId;
    if (!acc[restaurantId]) {
      acc[restaurantId] = [];
    }
    acc[restaurantId].push(branch);
    return acc;
  }, {} as Record<string, Branch[]>);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Branches</h1>
          <p className="text-muted-foreground mt-1">Manage restaurant branches</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={filterRestaurant} onValueChange={setFilterRestaurant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by restaurant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Restaurants</SelectItem>
              {restaurants.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button disabled={restaurants.length === 0}>
                <Plus className="h-5 w-5" />
                Add Branch
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingBranch ? 'Edit Branch' : 'Add Branch'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Restaurant *</label>
                  <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((r) => (
                        <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Branch Name *</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Downtown Branch"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">State *</label>
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g., Baghdad"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Full address"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Delivery Price (IQD)</label>
                  <Input
                    type="number"
                    value={deliveryPrice}
                    onChange={(e) => setDeliveryPrice(e.target.value)}
                    placeholder="e.g., 5000"
                  />
                </div>

                <ImageUpload
                  value={image}
                  onChange={setImage}
                  label="Branch Image (Optional)"
                />

                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    ) : editingBranch ? 'Update' : 'Add'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {restaurants.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <GitBranch className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No restaurants yet</h3>
            <p className="text-muted-foreground">Add a restaurant first before adding branches</p>
          </CardContent>
        </Card>
      ) : Object.keys(groupedBranches).length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <GitBranch className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No branches yet</h3>
            <p className="text-muted-foreground mb-6">Add branches to your restaurants</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-5 w-5" />
              Add Branch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedBranches).map(([restaurantId, restaurantBranches]) => (
            <Card key={restaurantId} className="shadow-card">
              <CardHeader className="border-b border-border">
                <div className="flex items-center gap-4">
                  {getRestaurantLogo(restaurantId) ? (
                    <img
                      src={getRestaurantLogo(restaurantId)}
                      alt=""
                      className="h-12 w-12 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
                      <GitBranch className="h-6 w-6 text-secondary-foreground" />
                    </div>
                  )}
                  <CardTitle className="text-xl">{getRestaurantName(restaurantId)}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurantBranches.map((branch, index) => (
                    <div
                      key={branch.id}
                      className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-200 group animate-scale-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground">{branch.name}</h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(branch)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(branch.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {branch.image && (
                        <img
                          src={branch.image}
                          alt="Branch"
                          className="h-16 w-16 rounded-xl object-cover mb-2 border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                      )}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{branch.state}</span>
                        </div>
                        <p className="text-muted-foreground pl-6">{branch.location}</p>
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <Truck className="h-4 w-4" />
                          <span>{branch.deliveryPrice.toLocaleString()} IQD</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
