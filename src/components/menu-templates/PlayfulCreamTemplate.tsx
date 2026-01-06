// Defensive normalization utility
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
      // Helper to get the full Supabase image URL if needed
      function getMenuItemImageUrl(image: string) {
        if (!image) return '';
        if (image.startsWith('http://') || image.startsWith('https://')) return image;
        return `https://qwwhlsqwcpjygpmbxjxd.supabase.co/storage/v1/object/public/images/${image}`;
      }
  return String(val);
}
import { Restaurant, Branch, MenuItem } from '@/types';
import { UtensilsCrossed, MapPin, Truck, Star, Pizza, Coffee, Sandwich } from 'lucide-react';

interface TemplateProps {
  restaurant: Restaurant | undefined;
  branch: Branch | undefined;
  categorizedItems: Record<string, MenuItem[]>;
  sortedCategories: string[];
}

const getCategoryIcon = (category: string) => {
  switch (String(category).toLowerCase()) {
    case 'pizza': return Pizza;
    case 'beverages': return Coffee;
    case 'sandwiches': return Sandwich;
    default: return UtensilsCrossed;
  }
};

export function PlayfulCreamTemplate({ restaurant, branch, categorizedItems, sortedCategories }: TemplateProps) {
  if (sortedCategories.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-amber-50 rounded-xl border-2 border-amber-200">
        <div className="text-center text-amber-800 p-8">
          <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold">No menu items</h3>
          <p className="opacity-70">This branch has no menu items yet</p>
        </div>
      </div>
    );
  }

  // Log categories and items for debugging
  sortedCategories.forEach((cat) => {
    if (typeof cat !== 'string' && typeof cat !== 'number') {
      console.warn('Non-primitive category:', cat);
    }
    const items = categorizedItems[normalizeToString(cat)];
    if (items) {
      items.forEach((item) => {
        if (typeof item.id !== 'string' && typeof item.id !== 'number') {
          console.warn('Non-primitive item.id:', item.id, 'in category:', cat);
        }
      });
    }
  });

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl overflow-hidden border-2 border-amber-100 relative">
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 w-24 h-24 opacity-20">
        <Pizza className="w-full h-full text-orange-400 rotate-12" />
      </div>
      <div className="absolute bottom-20 left-4 w-16 h-16 opacity-20">
        <Coffee className="w-full h-full text-red-400 -rotate-12" />
      </div>
      <div className="absolute top-1/3 right-8 w-12 h-12 opacity-15">
        <Sandwich className="w-full h-full text-green-500 rotate-6" />
      </div>

      {/* Header */}
      <div className="text-center py-10 px-6 relative">
        {/* Decorative leaves */}
        <div className="absolute top-6 left-1/4 text-2xl opacity-60">🌿</div>
        <div className="absolute top-8 right-1/4 text-xl opacity-60">🌿</div>
        <p className="text-orange-600 font-medium tracking-wider mb-2">{branch?.name}</p>
        {/* Stylized Menu Title */}
        <div className="relative inline-block">
          <span className="text-5xl md:text-6xl font-script text-red-600 italic">Menu</span>
        </div>
        <div className="mt-4">
          <span className="text-sm bg-red-600 text-white px-4 py-1 rounded-full uppercase tracking-wider">
            {restaurant?.name}
          </span>
        </div>
      </div>

      {/* Menu Cards - 3 Column Layout */}
      <div className="px-6 md:px-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sortedCategories.map((category, index) => {
            const catKey = normalizeToString(category);
            if (!catKey) {
              console.warn('Skipping empty/invalid category key:', category);
              return null;
            }
            const CategoryIcon = getCategoryIcon(category);
            const isSpecial = index === 0; // First category gets special styling
            return (
              <div 
                key={catKey} 
                className={`rounded-2xl p-6 border-2 ${
                  isSpecial 
                    ? 'bg-white border-red-200 shadow-lg' 
                    : 'bg-white/80 border-amber-200'
                }`}
              >
                {/* Category Header */}
                <div className="text-center mb-6">
                  <p className="text-orange-500 text-sm font-medium tracking-wider mb-1">
                    {isSpecial && '★ ★ ★ ★ ★'}
                  </p>
                  <h3 className="text-xl font-bold text-green-700 tracking-wide">
                    {catKey}
                  </h3>
                  <h4 className="text-2xl font-script text-red-600 italic">
                    Menu
                  </h4>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {categorizedItems[catKey]?.map((item) => {
                    const normId = normalizeToString(item.id);
                    if (!normId) {
                      console.warn('Skipping item with invalid id:', item);
                      return null;
                    }
                    return (
                      <div key={normId} className="border-b border-amber-100 pb-3 last:border-0">
                        <div className="flex items-start gap-3">
                          {/* Small icon */}
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-1">
                            <CategoryIcon className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-green-800 flex items-center gap-1">
                                {item.name}
                                <Star className="h-3 w-3 text-orange-400 fill-orange-400" />
                              </h4>
                              <span className="text-red-600 font-bold text-sm whitespace-nowrap ml-2">
                                {item.price.toLocaleString()} IQD
                              </span>
                            </div>
                            <p className="text-amber-700 text-xs mt-1 leading-relaxed">
                              {item.description || `Delicious ${item.name.toLowerCase()} with fresh ingredients`}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {/* Footer Info */}
        <div className="mt-10 pt-6 border-t border-amber-200 flex flex-wrap justify-center gap-8 text-amber-700 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-red-500" />
            <span>{branch?.state} - {branch?.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-red-500" />
            <span>Delivery: {branch?.delivery_price?.toLocaleString()} IQD</span>
          </div>
        </div>
      </div>
    </div>
  );
}