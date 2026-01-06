import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Restaurant, Branch, MenuItem } from '@/types';
import { RusticWoodTemplate } from '@/components/menu-templates/RusticWoodTemplate';
import { ElegantMinimalTemplate } from '@/components/menu-templates/ElegantMinimalTemplate';
import { FastFoodDarkTemplate } from '@/components/menu-templates/FastFoodDarkTemplate';
import { PlayfulCreamTemplate } from '@/components/menu-templates/PlayfulCreamTemplate';
import { Card, CardContent } from '@/components/ui/card';
import { UtensilsCrossed } from 'lucide-react';

const TEMPLATES: Record<string, any> = {
  'rustic-wood': RusticWoodTemplate,
  'elegant-minimal': ElegantMinimalTemplate,
  'fast-food-dark': FastFoodDarkTemplate,
  'playful-cream': PlayfulCreamTemplate,
};

function PublicMenu() {
  const { restaurant, branch, restaurantSlug, branchSlug, templateUuid } = useParams();
  // Always lowercase the slugs from the URL for robust comparison
  const normalizedRestaurantSlug = (restaurantSlug || '').toLowerCase();
  const normalizedBranchSlug = (branchSlug || '').toLowerCase();
  // Utility to slugify names for URLs (copied from MenuPreview for consistency)
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
  const [loading, setLoading] = useState(true);
  const [restaurantData, setRestaurantData] = useState<Restaurant | null>(null);
  const [branchData, setBranchData] = useState<Branch | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [template, setTemplate] = useState<string>('default');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      let rest = null;
      let br = null;
      if (normalizedRestaurantSlug && normalizedBranchSlug) {
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('*');
        rest = (restaurants || []).find(r => matchSlug(r.name, normalizedRestaurantSlug));
        setRestaurantData(rest || null);
        if (!rest) return setLoading(false);
        const { data: branches } = await supabase
          .from('branches')
          .select('*')
          .eq('restaurant_id', rest.id);
        br = (branches || []).find(b => matchSlug(b.name, normalizedBranchSlug));
        setBranchData(br || null);
        if (!br) return setLoading(false);
        setTemplate(br.active_template || 'default');
        const { data: items } = await supabase
          .from('menu_items')
          .select('*')
          .eq('branch_id', br.id);
        const normalizedItems = (items || []).map(item => ({
          ...item,
          id: typeof item.id === 'object' ? JSON.stringify(item.id) : String(item.id),
          category: typeof item.category === 'object' ? JSON.stringify(item.category) : String(item.category),
        }));
        setMenuItems(normalizedItems);
        setLoading(false);
      } else {
        const { data: restaurants } = await supabase
          .from('restaurants')
          .select('*')
          .ilike('name', restaurant || '');
        rest = restaurants?.[0];
        setRestaurantData(rest || null);
        if (!rest) return setLoading(false);
        const { data: branches } = await supabase
          .from('branches')
          .select('*')
          .eq('restaurant_id', rest.id)
          .ilike('name', branch || '');
        br = branches?.[0];
        setBranchData(br || null);
        if (!br) return setLoading(false);
        setTemplate(br.active_template || 'default');
        const { data: items } = await supabase
          .from('menu_items')
          .select('*')
          .eq('branch_id', br.id);
        const normalizedItems = (items || []).map(item => ({
          ...item,
          id: typeof item.id === 'object' ? JSON.stringify(item.id) : String(item.id),
          category: typeof item.category === 'object' ? JSON.stringify(item.category) : String(item.category),
        }));
        setMenuItems(normalizedItems);
        setLoading(false);
      }
    };
    const matchSlug = (name: string, slug: string) => {
      const s = slugify(name);
      // Debug log for each branch/restaurant name
      console.log('DEBUG: matchSlug', name, '→', s, '| URL slug:', slug);
      return s === slug;
    };
    fetchData();
  }, [restaurant, branch, restaurantSlug, branchSlug, templateUuid]);

  // DEBUG: Log the slug for the Arabic branch name 'اليرموك'
  console.log("DEBUG: slugify('اليرموك') =", slugify('اليرموك'));

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  // DEBUG: Log menuItems to check for image field
  console.log('DEBUG: menuItems', menuItems);
  if (!restaurantData || !branchData) {
    let reason = '';
    if (!restaurantData) reason = 'Restaurant not found for this URL.';
    else if (!branchData) reason = 'Branch not found for this URL or not linked to restaurant.';
    console.warn('Debug: restaurantData', restaurantData);
    console.warn('Debug: branchData', branchData);
    return (
      <Card className="shadow-card max-w-lg mx-auto mt-20">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <UtensilsCrossed className="h-8 w-8 text-secondary-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Menu Not Found</h3>
          <p className="text-muted-foreground">This menu link is invalid or unpublished.</p>
          {reason && <p className="text-xs text-red-500 mt-2">{reason}</p>}
        </CardContent>
      </Card>
    );
  }

  // Helper to get the full Supabase image URL if needed
  function getMenuItemImageUrl(image: string) {
    if (!image) return '';
    // If already a full URL, return as is
    if (image.startsWith('http://') || image.startsWith('https://')) return image;
    // Otherwise, assume it's a Supabase storage key
    return `https://qwwhlsqwcpjygpmbxjxd.supabase.co/storage/v1/object/public/images/${image}`;
  }

  // Group items by category (always use string keys)
  const categorizedItems = menuItems.reduce((acc, item) => {
    const catKey = String(item.category);
    if (!acc[catKey]) acc[catKey] = [];
    acc[catKey].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const allCategories = [
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
  const sortedCategories = allCategories.filter((cat) => categorizedItems[String(cat)]);

  const templateProps = {
    restaurant: restaurantData,
    branch: branchData,
    categorizedItems,
    sortedCategories,
  };

  if (template !== 'default' && TEMPLATES[template]) {
    const TemplateComponent = TEMPLATES[template];
    return <TemplateComponent {...templateProps} />;
  }
  // fallback: default template
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="shadow-card bg-gradient-to-br from-primary/10 to-secondary/30 border-primary/20">
        <CardContent className="p-8">
          <div className="text-center flex flex-col items-center">
            {branchData?.image && (
              <img
                src={branchData.image}
                alt="Branch"
                className="h-20 w-20 rounded-xl object-cover mb-4 border border-border"
                onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            )}
            <h2 className="text-3xl font-bold text-foreground mb-2">
              {restaurantData?.name}
            </h2>
            <p className="text-xl text-primary font-medium mb-4">
              {branchData?.name}
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>{branchData?.state} - {branchData?.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Delivery: {branchData?.delivery_price?.toLocaleString()} IQD</span>
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
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categorizedItems[catKey]?.map((item, index) => (
                    <div
                      key={String(item.id)}
                      className="flex justify-between items-center p-4 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition-all animate-fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-center gap-4">
                        {item.image ? (
                          <img
                            src={getMenuItemImageUrl(item.image)}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0 border border-border"
                            onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
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
}

export default PublicMenu;