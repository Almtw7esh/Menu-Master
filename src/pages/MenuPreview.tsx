// Utility to deeply normalize id and category to string
function normalizeToString(val: any): string {
  if (val == null) return '';
  if (typeof val === 'string' || typeof val === 'number') return String(val);
  if (typeof val === 'object') {
    if (val.toString && val.toString !== Object.prototype.toString) {
      try {
        const str = val.toString();
        if (str !== '[object Object]') return str;
      } catch {}
    }
    try {
      return JSON.stringify(val);
    } catch {
      return '[object Object]';
    }
  }
  return String(val);
}
import { useState, useEffect } from 'react';
// Utility to slugify names for URLs
function slugify(text: string) {
  return text
    .toString()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}\s-]/gu, '') // Allow all Unicode letters/numbers
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
}
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
import { Badge } from '@/components/ui/badge';
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
import HelloChickenTemplate from '@/components/menu-templates/HelloChickenTemplate';

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

export type TemplateType = 'default' | 'rustic-wood' | 'elegant-minimal' | 'fast-food-dark' | 'playful-cream' | 'hello-chicken';

const TEMPLATES: { id: TemplateType; name: string; description: string; icon: React.ElementType; previewBg: string }[] = [
  { id: 'default', name: 'Default', description: 'Clean modern layout', icon: Palette, previewBg: 'bg-gradient-to-br from-primary/20 to-secondary/30' },
  { id: 'rustic-wood', name: 'Rustic Wood', description: 'Wood texture with gold accents', icon: TreePine, previewBg: 'bg-gradient-to-br from-amber-900 to-amber-700' },
  { id: 'elegant-minimal', name: 'Elegant Minimal', description: 'Clean cream with serif fonts', icon: Sparkles, previewBg: 'bg-gradient-to-br from-stone-100 to-stone-200' },
  { id: 'fast-food-dark', name: 'Fast Food Dark', description: 'Dark theme with orange accents', icon: Zap, previewBg: 'bg-gradient-to-br from-zinc-900 to-orange-900' },
  { id: 'playful-cream', name: 'Playful Cream', description: 'Colorful and fun design', icon: Star, previewBg: 'bg-gradient-to-br from-amber-100 to-orange-100' },
  { id: 'hello-chicken', name: 'Hello Chicken', description: 'Red bold style, Arabic friendly', icon: UtensilsCrossed, previewBg: 'bg-gradient-to-br from-red-700 to-yellow-200' },
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
  const [publicMenuUrl, setPublicMenuUrl] = useState<string | null>(null);

  // Save selected template for the branch
  const handleApplyTemplate = async () => {
    if (!selectedBranch || !selectedTemplate) {
      toast.error('Please select a branch and template');
      return;
    }
    const { error } = await supabase
      .from('branches')
      .update({ active_template: selectedTemplate })
      .eq('id', selectedBranch);
    if (error) {
      toast.error('Failed to apply template');
    } else {
      toast.success('Template applied! This branch menu is now public.');
      const domain = window.location.origin;
      const restaurantSlug = selectedRestaurantData?.name ? slugify(selectedRestaurantData.name) : 'restaurant';
      const branchSlug = selectedBranchData?.name ? slugify(selectedBranchData.name) : 'branch';
      const templateUuid = selectedTemplate;
      setPublicMenuUrl(`${domain}/${restaurantSlug}/${branchSlug}/${templateUuid}`);
    }
  };

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
      // Defensive normalization: ensure id and category are always strings
      console.log('RAW menuItemsData from Supabase:', menuItemsData);
      const normalizedMenuItems = (menuItemsData || []).map(item => ({
        ...item,
        id: normalizeToString(item.id),
        category: normalizeToString(item.category),
      }));
      setMenuItems(normalizedMenuItems);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter((b) => b.restaurant_id === selectedRestaurant);
  const selectedBranchData = branches.find((b) => b.id === selectedBranch);
  const selectedRestaurantData = restaurants.find((r) => r.id === selectedRestaurant);

  const filteredItems = menuItems.filter((item) => {
    if (selectedRestaurant && item.restaurant_id !== selectedRestaurant) return false;
    if (selectedBranch && item.branch_id !== selectedBranch) return false;
    return true;
  });

  // Group items by category (always use string keys)
  const categorizedItems = filteredItems.reduce((acc, item) => {
    const catKey = String(item.category);
    if (!acc[catKey]) acc[catKey] = [];
    acc[catKey].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Sort categories by predefined order (always use string keys)
  const sortedCategories = CATEGORIES.filter((cat) => categorizedItems[String(cat)]);

  const templateComponents: Record<string, any> = {
    'rustic-wood': RusticWoodTemplate,
    'elegant-minimal': ElegantMinimalTemplate,
    'fast-food-dark': FastFoodDarkTemplate,
    'playful-cream': PlayfulCreamTemplate,
    'hello-chicken': HelloChickenTemplate,
  };

  const renderTemplate = () => {
    // For HelloChickenTemplate, convert categorizedItems/sortedCategories to menuSections
    if (selectedTemplate === 'hello-chicken') {
      const menuSections = sortedCategories.map((cat) => ({
        title: String(cat),
        items: categorizedItems[String(cat)] || [],
      }));
      return (
        <HelloChickenTemplate
          restaurantName={selectedRestaurantData?.name || ''}
          branchName={selectedBranchData?.name || ''}
          menuSections={menuSections}
          primaryColor={selectedBranchData?.template_settings?.primaryColor}
          accentColor={selectedBranchData?.template_settings?.accentColor}
          logoUrl={selectedRestaurantData?.logo}
        />
      );
    }
    const templateProps = {
      restaurant: selectedRestaurantData,
      branch: selectedBranchData,
      categorizedItems,
      sortedCategories,
    };
    if (selectedTemplate in templateComponents) {
      const TemplateComponent = templateComponents[selectedTemplate];
      return <TemplateComponent {...templateProps} />;
    }
    return renderDefaultTemplate();
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
                <span>Delivery: {selectedBranchData?.delivery_price?.toLocaleString()} IQD</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Categories */}
      {sortedCategories.length > 0 ? (
        sortedCategories.map((category) => {
          const catKey = String(category);
          return (
            <Card key={catKey} className="shadow-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-xl text-primary">{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorizedItems[catKey]?.map((item, index) => (
                    <div
                      key={String(item.id)}
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
          );
        })
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
                    <SelectItem key={String(r.id)} value={String(r.id)}>
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
                  {filteredBranches.map((b) => {
                    let publicUrl = '';
                    if (b.active_template && b.name && selectedRestaurantData?.name) {
                      const slugify = (text: string) => text.toString().normalize('NFKD').replace(/[\u0300-\u036F]/g, '').replace(/[^a-zA-Z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').toLowerCase();
                      const domain = window.location.origin;
                      const restaurantSlug = slugify(selectedRestaurantData.name);
                      const branchSlug = slugify(b.name);
                      publicUrl = `${domain}/${restaurantSlug}/${branchSlug}/${b.active_template}`;
                    }
                    return (
                      <div key={String(b.id)} className="px-2 py-1">
                        <SelectItem value={String(b.id)} className="flex flex-col items-start">
                          <span className="flex items-center gap-2">
                            {b.name} - {b.state}
                            {b.active_template && (
                              <Badge variant="default" className="ml-2 bg-green-100 text-green-700 border-green-200">Published</Badge>
                            )}
                          </span>
                          {b.active_template && publicUrl && (
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary underline break-all hover:text-orange-500 mt-1"
                              onClick={e => e.stopPropagation()}
                            >
                              {publicUrl}
                            </a>
                          )}
                        </SelectItem>
                      </div>
                    );
                  })}
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
                        <div key={template.id} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-background hover:bg-secondary/30 transition-all">
                          <IconComponent className="h-8 w-8 mb-2" />
                          <span className="font-semibold">{template.name}</span>
                          <span className="text-xs text-muted-foreground mb-2">{template.description}</span>
                          <Button
                            variant={template.id === selectedTemplate ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedTemplate(template.id);
                              setTemplateDialogOpen(false);
                            }}
                            className="w-full"
                          >
                            {template.id === selectedTemplate ? 'Selected' : 'Choose'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show public menu URL if available */}


      {/* Render menu preview */}
      <div className="mt-8">
        {renderTemplate()}
          {selectedTemplate && (
            <Button
              onClick={handleApplyTemplate}
              className="mt-2 w-full"
              variant="default"
            >
              Apply This Template
            </Button>
          )}
      </div>
    </div>
  );
}