// Helper to get the full Supabase image URL if needed
function getMenuItemImageUrl(image: string) {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `https://qwwhlsqwcpjygpmbxjxd.supabase.co/storage/v1/object/public/images/${image}`;
}
import { Restaurant, Branch, MenuItem } from '@/types';
import { UtensilsCrossed, MapPin, Truck } from 'lucide-react';

interface TemplateProps {
  restaurant: Restaurant | undefined;
  branch: Branch | undefined;
  categorizedItems: Record<string, MenuItem[]>;
  sortedCategories: string[];
}

export function RusticWoodTemplate({ restaurant, branch, categorizedItems, sortedCategories }: TemplateProps) {
  if (sortedCategories.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200')] bg-cover bg-center rounded-xl">
        <div className="text-center text-white bg-black/50 p-8 rounded-xl">
          <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-70" />
          <h3 className="text-xl font-bold">No menu items</h3>
          <p className="opacity-80">This branch has no menu items yet</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header Banner */}
      <div className="relative">
        <div className="bg-gradient-to-r from-red-800 to-red-700 py-4 px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 text-center tracking-wide">
            {restaurant?.name}
          </h1>
        </div>
        {/* Decorative curve */}
        <svg viewBox="0 0 1200 40" className="w-full -mt-1" preserveAspectRatio="none">
          <path d="M0,0 L600,40 L1200,0 L1200,40 L0,40 Z" fill="#7f1d1d" />
          <path d="M580,35 L600,40 L620,35" fill="none" stroke="#facc15" strokeWidth="3" />
        </svg>
      </div>

      {/* Menu Content */}
      <div className="p-6 md:p-10">
        {sortedCategories.map((category) => {
          const catKey = String(category);
          console.log('RusticWoodTemplate category:', category, 'typeof:', typeof category);
          return (
            <div key={catKey} className="mb-10">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-red-800 to-red-700 py-3 px-6 rounded-t-lg mb-6">
                <h2 className="text-xl font-bold text-yellow-400 text-center tracking-wider">
                  {category}
                </h2>
              </div>

              {/* Items Grid - 2 columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {categorizedItems[catKey]?.map((item) => {
                  console.log('RusticWoodTemplate item.id:', item.id, 'typeof:', typeof item.id);
                  return (
                    <div key={String(item.id)} className="flex gap-4 items-start">
                      {/* Item Details */}
                      <div className="flex-1">
                        <div className="flex items-baseline gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white drop-shadow-lg">
                            {item.name}
                          </h3>
                          <span className="text-xl font-bold text-yellow-400">
                            {item.price.toLocaleString()} IQD
                          </span>
                        </div>
                        <p className="text-sm text-black opacity-90 leading-relaxed">
                          {item.description || `Delicious ${item.name.toLowerCase()} prepared with fresh ingredients`}
                        </p>
                      </div>
                      {/* Circular Image Placeholder */}
                        <div className="h-16 w-16 rounded-lg bg-white/80 flex items-center justify-center overflow-hidden">
                          {item.image ? (
                            <img
                              src={getMenuItemImageUrl(item.image)}
                              alt={item.name}
                              className="h-16 w-16 rounded-lg object-cover border border-border"
                              onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                            />
                          ) : (
                            <UtensilsCrossed className="h-7 w-7 text-amber-700" />
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Footer Info */}
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
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
