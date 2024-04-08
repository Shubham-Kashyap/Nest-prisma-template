interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    discountPercentage: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
    specifications: Specifications[];
    highlights: Specifications[];
    reviews?: Reviews[];
}

type ProductFilter = {
    category: string;
    priceRange: { min: number; max: number };
    rating: number;
};
