import React from 'react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface HelloChickenTemplateProps {
  restaurantName: string;
  branchName: string;
  menuSections?: MenuSection[];
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
}

// This template is inspired by the Hello Chicken menu design in the provided images.
const HelloChickenTemplate: React.FC<HelloChickenTemplateProps> = ({
  restaurantName,
  branchName,
  menuSections,
  primaryColor = '#d0021b',
  accentColor = '#fff',
  logoUrl,
}) => {
  const safeMenuSections = Array.isArray(menuSections) ? menuSections : [];
  return (
    <div
      style={{
        background: `radial-gradient(circle at 20% 10%, #ffe5e5 0%, ${primaryColor} 100%)`,
        minHeight: '100vh',
        color: accentColor,
        fontFamily: 'Cairo, Arial, sans-serif',
      }}
      className="p-4 md:p-8"
    >
      <div className="flex flex-col items-center mb-6">
        {logoUrl && (
          <img src={logoUrl} alt="Logo" className="h-24 w-24 rounded-full shadow-lg mb-2 bg-white object-contain" />
        )}
        <h1 className="text-3xl md:text-4xl font-extrabold text-white drop-shadow-lg text-center" style={{ color: accentColor }}>{restaurantName}</h1>
        <h2 className="text-lg md:text-xl font-semibold text-white/80 mt-1 text-center">{branchName}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {safeMenuSections.map((section, idx) => (
          <div key={section.title + idx} className="bg-white/90 rounded-2xl shadow-lg p-4 mb-4" style={{ color: '#b71c1c' }}>
            <h3 className="text-2xl font-bold mb-3 text-center" style={{ color: primaryColor }}>{section.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.items.map((item) => (
                <div key={item.id} className="flex flex-col items-center bg-white rounded-xl p-3 shadow border border-red-100">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="h-20 w-20 object-cover rounded-lg mb-2 border border-red-200" />
                  )}
                  <div className="text-center">
                    <div className="font-bold text-lg" style={{ color: primaryColor }}>{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-600 mt-1 mb-1" style={{ direction: 'rtl' }}>{item.description}</div>
                    )}
                    <div className="font-extrabold text-xl mt-1" style={{ color: '#d0021b' }}>{item.price.toLocaleString()} IQD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <footer className="mt-10 text-center text-xs text-white/70">
        <span>Powered by Menu Master</span>
      </footer>
    </div>
  );
};

export default HelloChickenTemplate;
