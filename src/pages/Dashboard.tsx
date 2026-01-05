import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { uploadImageToSupabase } from '@/lib/uploadImageToSupabase';
import { Restaurant } from '@/types';
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';

export default function Dashboard() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to fetch restaurants');
      setLoading(false);
      return;
    }
    setRestaurants(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a restaurant name');
      return;
    }
    if (!logo && !editingRestaurant) {
      toast.error('Please add a logo for the restaurant');
      return;
    }
    setSubmitting(true);
    try {
      if (editingRestaurant) {
        const { error } = await supabase
          .from('restaurants')
          .update({ name, logo })
          .eq('id', editingRestaurant.id);
        if (error) throw error;
        toast.success('Restaurant updated successfully');
      } else {
        const { error } = await supabase
          .from('restaurants')
          .insert([{ name, logo }]);
        if (error) throw error;
        toast.success('Restaurant added successfully');
      }
      resetForm();
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to save restaurant');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setName(restaurant.name);
    setLogo(restaurant.logo || '');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this restaurant? This will also delete all branches and menu items.')) {
      return;
    }
    try {
      const { error } = await supabase
        .from('restaurants')
        .delete()
        .eq('id', id);
      if (error) throw error;
      toast.success('Restaurant deleted successfully');
      fetchRestaurants();
    } catch (error) {
      toast.error('Failed to delete restaurant');
    }
  };

  const resetForm = () => {
    setName('');
    setLogo('');
    setEditingRestaurant(null);
    setDialogOpen(false);
  };

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
          <h1 className="text-3xl font-bold text-foreground">Restaurants</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurants</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-5 w-5" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <ImageUpload
                value={logo}
                onChange={setLogo}
                label="Restaurant Logo"
                required={!editingRestaurant}
              />
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Restaurant Name <span className="text-destructive">*</span></label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter restaurant name"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : editingRestaurant ? (
                    'Update'
                  ) : (
                    'Add'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {restaurants.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No restaurants yet</h3>
            <p className="text-muted-foreground mb-6">Add your first restaurant to get started</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-5 w-5" />
              Add Restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((restaurant, index) => (
            <Card
              key={restaurant.id}
              className="shadow-card hover:shadow-lg transition-all duration-300 animate-scale-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {restaurant.logo ? (
                    <img 
                      src={restaurant.logo} 
                      alt={restaurant.name}
                      className="h-16 w-16 rounded-xl object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-secondary-foreground" />
                    </div>
                  )}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(restaurant)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(restaurant.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground">{restaurant.name}</h3>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
