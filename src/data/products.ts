export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  badge?: string;
}

export const categories = [
  { name: "Electronics", icon: "📱", slug: "electronics" },
  { name: "Fashion", icon: "👗", slug: "fashion" },
  { name: "Home & Kitchen", icon: "🏠", slug: "home" },
  { name: "Beauty", icon: "💄", slug: "beauty" },
  { name: "Sports", icon: "⚽", slug: "sports" },
  { name: "Books", icon: "📚", slug: "books" },
  { name: "Toys", icon: "🧸", slug: "toys" },
  { name: "Grocery", icon: "🛒", slug: "grocery" },
];

export const products: Product[] = [
  { id: 1, name: "Wireless Bluetooth Headphones Pro", price: 1999, originalPrice: 4999, discount: 60, rating: 4.3, reviews: 12453, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop", category: "electronics", badge: "Bestseller" },
  { id: 2, name: "Smart Watch Ultra Series 5", price: 3499, originalPrice: 7999, discount: 56, rating: 4.5, reviews: 8921, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop", category: "electronics", badge: "New" },
  { id: 3, name: "Premium Cotton T-Shirt Pack of 3", price: 599, originalPrice: 1499, discount: 60, rating: 4.1, reviews: 34521, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop", category: "fashion" },
  { id: 4, name: "Running Shoes Air Max", price: 2799, originalPrice: 5999, discount: 53, rating: 4.4, reviews: 19876, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop", category: "sports", badge: "Top Rated" },
  { id: 5, name: "Stainless Steel Water Bottle 1L", price: 449, originalPrice: 999, discount: 55, rating: 4.6, reviews: 45231, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&h=300&fit=crop", category: "home" },
  { id: 6, name: "Organic Face Serum 30ml", price: 799, originalPrice: 1599, discount: 50, rating: 4.2, reviews: 6754, image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=300&h=300&fit=crop", category: "beauty" },
  { id: 7, name: "Wireless Charging Pad Fast", price: 699, originalPrice: 1499, discount: 53, rating: 4.0, reviews: 11234, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=300&fit=crop", category: "electronics" },
  { id: 8, name: "Laptop Backpack Anti-Theft", price: 1299, originalPrice: 2999, discount: 57, rating: 4.5, reviews: 23456, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop", category: "fashion", badge: "Deal of the Day" },
  { id: 9, name: "Non-Stick Cookware Set 5pcs", price: 1899, originalPrice: 3999, discount: 52, rating: 4.3, reviews: 8765, image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop", category: "home" },
  { id: 10, name: "Yoga Mat Premium 6mm", price: 899, originalPrice: 1799, discount: 50, rating: 4.4, reviews: 15678, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=300&h=300&fit=crop", category: "sports" },
  { id: 11, name: "Bestselling Novel Collection", price: 399, originalPrice: 999, discount: 60, rating: 4.7, reviews: 67890, image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=300&fit=crop", category: "books" },
  { id: 12, name: "Kids Building Blocks 200pcs", price: 649, originalPrice: 1299, discount: 50, rating: 4.6, reviews: 9876, image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=300&h=300&fit=crop", category: "toys" },
];

export const bannerSlides = [
  { id: 1, title: "Mega Electronics Sale", subtitle: "Up to 70% Off on Top Brands", cta: "Shop Now" },
  { id: 2, title: "Fashion Week Special", subtitle: "New Arrivals at Unbeatable Prices", cta: "Explore" },
  { id: 3, title: "Home Makeover Deals", subtitle: "Transform Your Space for Less", cta: "Discover" },
];
