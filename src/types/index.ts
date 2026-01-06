
export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  created_at: Date;
}

export interface Branch {
  id: string;
  restaurant_id: string;
  name: string;
  state: string;
  location: string;
  delivery_price: number;
  whatsapp?: string;
  active_template?: string;
  image?: string;
  template_settings?: Record<string, any>;
  created_at: Date;
}

export interface MenuItem {
  id: string;
  branch_id: string;
  restaurant_id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  created_at: Date;
}

export interface Category {
  id: string;
  name: string;
}
