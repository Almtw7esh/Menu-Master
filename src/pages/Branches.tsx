import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Restaurant, Branch } from '@/types';
import { Plus, Pencil, Trash2, GitBranch, MapPin, Truck, Phone } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

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
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [filterRestaurant, setFilterRestaurant] = useState<string>('all');
  const [template, setTemplate] = useState('fast-food-dark');
  const [primaryColor, setPrimaryColor] = useState('#ff6600');
  const [accentColor, setAccentColor] = useState('#222');

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
      const branchData = {
        restaurant_id: selectedRestaurant,
        name,
        state,
        location,
        delivery_price: parseFloat(deliveryPrice) || 0,
        ...(whatsapp && { whatsapp }),
        ...(image && { image }),
        active_template: template,
        template_settings: {
          primaryColor,
          accentColor,
        },
      };

      if (editingBranch) {
        const { error } = await supabase
          .from('branches')
          .update(branchData)
          .eq('id', editingBranch.id);
        if (error) throw error;
        toast.success('Branch updated successfully');
      } else {
        const { error } = await supabase
          .from('branches')
          .insert([{ ...branchData }]);
        if (error) throw error;
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
    setSelectedRestaurant(branch.restaurant_id);
    setName(branch.name);
    setState(branch.state);
    setLocation(branch.location);
    setDeliveryPrice((branch.delivery_price ?? '').toString());
    setWhatsapp(branch.whatsapp || '');
    setImage(branch.image || '');
    setTemplate(branch.active_template || 'fast-food-dark');
    setPrimaryColor(branch.template_settings?.primaryColor || '#ff6600');
    setAccentColor(branch.template_settings?.accentColor || '#222');
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;

    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);
      if (error) throw error;
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
    setWhatsapp('');
    setImage('');
    setEditingBranch(null);
    setTemplate('fast-food-dark');
    setPrimaryColor('#ff6600');
    setAccentColor('#222');
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
    : branches.filter((b) => b.restaurant_id === filterRestaurant);

  // Group branches by restaurant
  const groupedBranches = filteredBranches.reduce((acc, branch) => {
    const restaurantId = branch.restaurant_id;
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
                <SelectItem key={String(r.id)} value={String(r.id)}>{r.name}</SelectItem>
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
            <DialogContent className="max-w-lg w-full">
              <DialogHeader>
                <DialogTitle>
                  {editingBranch ? 'Edit Branch' : 'Add Branch'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-sm font-medium">Restaurant *</label>
                  <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((r) => (
                        <SelectItem key={String(r.id)} value={String(r.id)}>{r.name}</SelectItem>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">WhatsApp Number</label>
                  <Input
                    type="text"
                    value={whatsapp.startsWith('+964') ? whatsapp.slice(4) : whatsapp}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setWhatsapp('+964' + val);
                    }}
                    placeholder="7XXXXXXXXX"
                    prefix="+964"
                  />
                </div>

                <div className="space-y-2">
                  <ImageUpload
                    value={image}
                    onChange={setImage}
                    label="Branch Image (Optional)"
                  />
                </div>


                <div className="flex flex-col md:flex-row gap-4 col-span-1 md:col-span-2">
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Menu Template</label>
                    <select
                      value={template}
                      onChange={e => setTemplate(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="fast-food-dark">Fast Food Dark</option>
                      <option value="elegant-minimal">Elegant Minimal</option>
                      <option value="rustic-wood">Rustic Wood</option>
                      <option value="playful-cream">Playful Cream</option>
                    </select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={e => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded shadow"
                        aria-label="Primary Color"
                      />
                      <span className="text-xs font-mono">{primaryColor}</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-sm font-medium">Accent Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={e => setAccentColor(e.target.value)}
                        className="w-10 h-10 p-0 border-none bg-transparent cursor-pointer rounded shadow"
                        aria-label="Accent Color"
                      />
                      <span className="text-xs font-mono">{accentColor}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2 col-span-1 md:col-span-2">
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
            <Card key={String(restaurantId)} className="shadow-card">
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
                      key={String(branch.id)}
                      className="p-4 rounded-xl bg-secondary/50 border border-border hover:border-primary/50 transition-all duration-200 group animate-scale-in relative"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                          {branch.name}
                          {branch.active_template && (
                            <Badge variant="success" className="ml-2 bg-green-100 text-green-700 border-green-200">Published</Badge>
                          )}
                        </h4>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(branch)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(branch.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {branch.active_template && branch.name && getRestaurantName(branch.restaurant_id) && (
                        (() => {
                          // Slugify helper (Unicode-friendly, matches PublicMenu)
                          const slugify = (text: string) => text
                            .toString()
                            .normalize('NFKD')
                            .replace(/[^\p{L}\p{N}\s-]/gu, '')
                            .trim()
                            .replace(/\s+/g, '-')
                            .replace(/-+/g, '-')
                            .toLowerCase();
                          const domain = window.location.origin;
                          const restaurantName = getRestaurantName(branch.restaurant_id);
                          const restaurantSlug = slugify(restaurantName);
                          const branchSlug = slugify(branch.name);
                          // Use the template name (active_template) as the last URL segment
                          let templateName = '';
                          if (typeof branch.active_template === 'string') {
                            templateName = branch.active_template;
                          }
                          // Only show link if both slugs and templateName are non-empty
                          if (!restaurantSlug || !branchSlug || !templateName) return null;
                          const publicUrl = `${domain}/${restaurantSlug}/${branchSlug}/${templateName}`;
                          return (
                            <div className="sticky top-2 z-10 mt-1 mb-2">
                              <a
                                href={publicUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary underline break-all hover:text-orange-500"
                                onClick={e => e.stopPropagation()}
                              >
                                {publicUrl}
                              </a>
                            </div>
                          );
                        })()
                      )}
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
                          <span>{branch.delivery_price?.toLocaleString()} IQD</span>
                        </div>
                        {branch.whatsapp && (
                          <div className="flex items-center gap-2 text-green-700 font-medium mt-1">
                            <Phone className="h-4 w-4" />
                            <span>
                              <a
                                href={`https://wa.me/${branch.whatsapp.replace(/^\+/, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-green-800"
                                onClick={e => e.stopPropagation()}
                              >
                                {branch.whatsapp}
                              </a>
                            </span>
                          </div>
                        )}
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