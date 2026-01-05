import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Restaurant, Branch, MenuItem } from '@/types';
import { UtensilsCrossed, MapPin, Truck, Palette, TreePine, Sparkles, Zap, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { RusticWoodTemplate } from '@/components/menu-templates/RusticWoodTemplate';
import { ElegantMinimalTemplate } from '@/components/menu-templates/ElegantMinimalTemplate';
import { FastFoodDarkTemplate } from '@/components/menu-templates/FastFoodDarkTemplate';
import { PlayfulCreamTemplate } from '@/components/menu-templates/PlayfulCreamTemplate';

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

export type TemplateType = 'default' | 'rustic-wood' | 'elegant-minimal' | 'fast-food-dark' | 'playful-cream';

const TEMPLATES: { id: TemplateType; name: string; description: string; icon: React.ElementType; previewBg: string }[] = [
  { id: 'default', name: 'Default', description: 'Clean modern layout', icon: Palette, previewBg: 'bg-gradient-to-br from-primary/20 to-secondary/30' },
  { id: 'rustic-wood', name: 'Rustic Wood', description: 'Wood texture with gold accents', icon: TreePine, previewBg: 'bg-gradient-to-br from-amber-900 to-amber-700' },
  { id: 'elegant-minimal', name: 'Elegant Minimal', description: 'Clean cream with serif fonts', icon: Sparkles, previewBg: 'bg-gradient-to-br from-stone-100 to-stone-200' },
  { id: 'fast-food-dark', name: 'Fast Food Dark', description: 'Dark theme with orange accents', icon: Zap, previewBg: 'bg-gradient-to-br from-zinc-900 to-orange-900' },
  { id: 'playful-cream', name: 'Playful Cream', description: 'Colorful and fun design', icon: Star, previewBg: 'bg-gradient-to-br from-amber-100 to-orange-100' },
];

export default function MenuPreview() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('default');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);

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

  const filteredBranches = branches.filter((b) => b.restaurantId === selectedRestaurant);
  const selectedBranchData = branches.find((b) => b.id === selectedBranch);
  const selectedRestaurantData = restaurants.find((r) => r.id === selectedRestaurant);

  const filteredItems = menuItems.filter((item) => {
    if (selectedRestaurant && item.restaurantId !== selectedRestaurant) return false;
    if (selectedBranch && item.branchId !== selectedBranch) return false;
    return true;
  });

  // Group items by category
  const categorizedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Sort categories by predefined order
  const sortedCategories = CATEGORIES.filter((cat) => categorizedItems[cat]);

  const renderTemplate = () => {
    const templateProps = {
      restaurant: selectedRestaurantData,
      branch: selectedBranchData,
      categorizedItems,
      sortedCategories,
    };

    switch (selectedTemplate) {
      case 'rustic-wood':
        return <RusticWoodTemplate {...templateProps} />;
      case 'elegant-minimal':
        return <ElegantMinimalTemplate {...templateProps} />;
      case 'fast-food-dark':
        return <FastFoodDarkTemplate {...templateProps} />;
      case 'playful-cream':
        return <PlayfulCreamTemplate {...templateProps} />;
      default:
        return renderDefaultTemplate();
    }
  };

  const renderDefaultTemplate = () => (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card bg-gradient-to-br from-primary/10 to-secondary/30 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {selectedRestaurantData?.name}
            </h2>
            <p className="text-xl text-primary font-medium mb-4">
              {selectedBranchData?.name}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{selectedBranchData?.state} - {selectedBranchData?.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span>Delivery: {selectedBranchData?.deliveryPrice?.toLocaleString()} IQD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Categories */}
      {sortedCategories.length > 0 ? (
        sortedCategories.map((category) => (
          <Card key={category} className="shadow-card">
            <CardHeader className="border-b border-border">
              <CardTitle className="text-xl text-primary">{category}</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorizedItems[category].map((item, index) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="text-lg font-bold text-primary whitespace-nowrap">
                      {item.price.toLocaleString()} IQD
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No menu items</h3>
            <p className="text-muted-foreground">This branch has no menu items yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Menu Preview</h1>
        <p className="text-muted-foreground mt-1">Preview menu as customers will see it</p>
      </div>

      {/* Restaurant & Branch & Template Selection */}
      <Card className="shadow-card mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Select Restaurant, Branch & Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Restaurant</label>
              <Select
                value={selectedRestaurant}
                onValueChange={(v) => {
                  setSelectedRestaurant(v);
                  setSelectedBranch('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {restaurants.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Branch</label>
              <Select
                value={selectedBranch}
                onValueChange={setSelectedBranch}
                disabled={!selectedRestaurant}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedRestaurant ? "Select a branch" : "Select restaurant first"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredBranches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} - {b.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Template</label>
              <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Palette className="h-4 w-4" />
                    {TEMPLATES.find(t => t.id === selectedTemplate)?.name || 'Select Template'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Choose Menu Template</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {TEMPLATES.map((template) => {
                      const IconComponent = template.icon;
                      return (
                        <button
                          key={template.id}
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            setTemplateDialogOpen(false);
                          }}
                          className={`p-4 rounded-xl border-2 text-left transition-all hover:border-primary/50 hover:scale-105 ${
                            selectedTemplate === template.id
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                              : 'border-border bg-secondary/30'
                          }`}
                        >
                          <div className={`h-20 rounded-lg ${template.previewBg} mb-3 flex items-center justify-center`}>
                            <IconComponent className="h-8 w-8 text-white drop-shadow-lg" />
                          </div>
                          <h4 className="font-medium text-foreground">{template.name}</h4>
                          <p className="text-xs text-muted-foreground">{template.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Preview */}
      {selectedRestaurant && selectedBranch ? (
        renderTemplate()
      ) : (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <UtensilsCrossed className="h-8 w-8 text-secondary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a restaurant and branch</h3>
            <p className="text-muted-foreground">Choose from the options above to preview the menu</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
