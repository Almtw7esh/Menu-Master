export interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  createdAt: Date;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  state: string;
  location: string;
  deliveryPrice: number;
  image?: string;
  createdAt: Date;
}

export interface MenuItem {
  id: string;
  branchId: string;
  restaurantId: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
}
