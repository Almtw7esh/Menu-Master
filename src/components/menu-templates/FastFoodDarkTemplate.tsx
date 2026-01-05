import { Restaurant, Branch, MenuItem } from '@/types';
import { UtensilsCrossed, MapPin, Truck, Pizza, Coffee, Cookie } from 'lucide-react';

interface TemplateProps {
  restaurant: Restaurant | undefined;
  branch: Branch | undefined;
  categorizedItems: Record<string, MenuItem[]>;
  sortedCategories: string[];
}

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'pizza': return Pizza;
    case 'beverages': return Coffee;
    case 'desserts': return Cookie;
    default: return UtensilsCrossed;
  }
};

export function FastFoodDarkTemplate({ restaurant, branch, categorizedItems, sortedCategories }: TemplateProps) {
  if (sortedCategories.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-zinc-900 rounded-xl">
        <div className="text-center text-white p-8">
          <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold">No menu items</h3>
          <p className="opacity-70">This branch has no menu items yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden min-h-[600px]">
      {/* Header */}
      <div className="text-center py-10 relative">
        {/* Decorative elements */}
        <div className="absolute top-4 right-8 w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Pizza className="h-8 w-8 text-orange-400" />
        </div>
        <div className="absolute top-8 left-8 w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
          <Coffee className="h-6 w-6 text-red-400" />
        </div>
        
        {/* Brush stroke effect header */}
        <div className="inline-block relative mb-4">
          <div className="absolute inset-0 bg-orange-500 transform -skew-x-3 rounded-md" />
          <h2 className="relative text-xl font-bold text-white px-8 py-2 tracking-wider">
            FAST FOOD
          </h2>
        </div>
        
        <div className="inline-block relative">
          <div className="absolute inset-0 bg-orange-500 transform skew-x-3 rounded-md" />
          <h1 className="relative text-4xl md:text-5xl font-extrabold text-white px-12 py-3" 
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            MENU
          </h1>
        </div>
        
        <p className="text-zinc-400 mt-4">{restaurant?.name} • {branch?.name}</p>
      </div>

      {/* Menu Grid */}
      <div className="px-6 md:px-10 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sortedCategories.map((category) => {
            const CategoryIcon = getCategoryIcon(category);
            return (
              <div key={category} className="relative">
                {/* Category Header with brush stroke */}
                <div className="mb-6 relative">
                  <div className="absolute inset-0 bg-orange-500 transform -skew-x-2 rounded" 
                       style={{ clipPath: 'polygon(0 0, 100% 10%, 95% 100%, 5% 90%)' }} />
                  <h3 className="relative text-lg font-bold text-zinc-900 px-4 py-2 flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    {category.toUpperCase()}
                  </h3>
                </div>

                {/* Items */}
                <div className="space-y-5">
                  {categorizedItems[category].map((item) => (
                    <div key={item.id} className="group">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-white font-semibold group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </h4>
                        <span className="text-orange-400 font-bold ml-2">
                          {item.price.toLocaleString()} IQD
                        </span>
                      </div>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        Fresh and delicious, made with premium ingredients
                      </p>
                    </div>
                  ))}
                </div>

                {/* Decorative food illustration placeholder */}
                <div className="mt-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-orange-500/30 flex items-center justify-center">
                    <CategoryIcon className="h-10 w-10 text-orange-400/60" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="mt-12 pt-6 border-t border-zinc-800 flex flex-wrap justify-center gap-8 text-zinc-500 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-400" />
            <span>{branch?.state} - {branch?.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-400" />
            <span>Delivery: {branch?.deliveryPrice?.toLocaleString()} IQD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
