interface ProductImage {
    id: string;
    url: string;
    productId: string;
}

interface ProductReview {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

interface ProductHighlight {
    id: string;
    title: string;
    description: string;
    productId: string;
}

interface ProductSpecification {
    id: string;
    title: string;
    description: string;
    productId: string;
}

interface Category {
    id: string;
    name: string;
    description: string;
}

interface Product {
    id: string;
    title: string;
    description: string;
    price: number | string;
    discountPercentage?: number | string | null;
    stock: number | string;
    brand: string;
    thumbnail: string;
    isDeleted: boolean;
    categoryId: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    category?: Category;
    images?: ProductImage[];
    reviews?: ProductReview[];
    highlights?: ProductHighlight[];
    specifications?: ProductSpecification[];
}

type ProductFilter = {
    category?: string;
    priceRange?: { min?: number; max?: number };
    rating?: number;
};

interface UpdateProductDto extends Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'>> {
    category?: string;
}
