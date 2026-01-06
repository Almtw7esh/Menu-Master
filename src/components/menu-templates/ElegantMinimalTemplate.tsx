// Helper to get the full Supabase image URL if needed
function getMenuItemImageUrl(image: string) {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `https://qwwhlsqwcpjygpmbxjxd.supabase.co/storage/v1/object/public/images/${image}`;
}
import { Restaurant, Branch, MenuItem } from '@/types';
import { UtensilsCrossed, MapPin, Truck, Sparkles } from 'lucide-react';

interface TemplateProps {
  restaurant: Restaurant | undefined;
  branch: Branch | undefined;
  categorizedItems: Record<string, MenuItem[]>;
  sortedCategories: string[];
}

export function ElegantMinimalTemplate({ restaurant, branch, categorizedItems, sortedCategories }: TemplateProps) {
  // Separate main dishes from simple list items (beverages, desserts)
  const mainCategories = sortedCategories.filter(c => !['Beverages', 'Desserts'].includes(c));
  const simpleCategories = sortedCategories.filter(c => ['Beverages', 'Desserts'].includes(c));

  if (sortedCategories.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-stone-50 rounded-xl border border-stone-200">
        <div className="text-center text-stone-600 p-8">
          <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-serif">No menu items</h3>
          <p className="opacity-70">This branch has no menu items yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 rounded-xl overflow-hidden border border-stone-200">
      {/* Header */}
      <div className="text-center py-12 px-6">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Sparkles className="h-5 w-5 text-stone-400" />
          <span className="text-sm tracking-[0.3em] text-stone-500 uppercase">
            {branch?.name}
          </span>
          <Sparkles className="h-5 w-5 text-stone-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-800 tracking-wide">
          FOOD MENU
        </h1>
        <p className="text-stone-500 mt-2">{restaurant?.name}</p>
      </div>

      {/* Main Menu Items - Grid with circular images */}
      <div className="px-6 md:px-12 pb-8">
        {mainCategories.map((category) => {
          const catKey = String(category);
          console.log('ElegantMinimalTemplate category:', category, 'typeof:', typeof category);
          return (
            <div key={catKey} className="mb-10">
              <h2 className="text-center text-lg font-serif text-stone-600 mb-8 tracking-wider">
                — {category} —
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categorizedItems[catKey]?.map((item) => {
                  console.log('ElegantMinimalTemplate item.id:', item.id, 'typeof:', typeof item.id);
                  return (
                    <div key={String(item.id)} className="flex gap-5">
                    {/* Circular Image Placeholder */}
                    <div className="w-24 h-24 rounded-full bg-stone-200 flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-white shadow-lg">
                      {item.image ? (
                        <img
                          src={getMenuItemImageUrl(item.image)}
                          alt={item.name}
                          className="h-24 w-24 rounded-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                        />
                      ) : (
                        <UtensilsCrossed className="h-10 w-10 text-stone-400" />
                      )}
                    </div>
                    {/* Item Details */}
                    <div className="flex-1 pt-2">
                      <h3 className="text-lg font-serif font-semibold text-stone-800">
                        {item.name}
                      </h3>
                      <p className="text-stone-500 text-sm mt-1">
                        {item.price.toLocaleString()} IQD
                      </p>
                      <p className="text-stone-400 text-sm mt-2 leading-relaxed">
                        {item.description || 'Expertly prepared with the finest ingredients and traditional techniques.'}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Simple List Categories (Beverages, Desserts) */}
        {simpleCategories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 pt-8 border-t border-stone-200">
            {simpleCategories.map((category) => {
              const catKey = String(category);
              console.log('ElegantMinimalTemplate simple category:', category, 'typeof:', typeof category);
              return (
                <div key={catKey}>
                  <h3 className="text-xl font-serif font-bold text-stone-800 mb-6">
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {categorizedItems[catKey]?.map((item) => {
                      console.log('ElegantMinimalTemplate simple item.id:', item.id, 'typeof:', typeof item.id);
                      return (
                        <div key={String(item.id)} className="flex justify-between items-center">
                        <span className="text-stone-700">{item.name}</span>
                        <span className="text-stone-500">{item.price.toLocaleString()} IQD</span>
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-12 pt-8 border-t border-stone-200 flex flex-wrap justify-center gap-8 text-stone-500 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{branch?.state} - {branch?.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Delivery: {branch?.delivery_price?.toLocaleString()} IQD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
