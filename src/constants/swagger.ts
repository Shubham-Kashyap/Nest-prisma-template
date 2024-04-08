import { productFieldDescription, userFieldDescription } from '@helpers/message.helper';
import { Role } from './enum';

export default {
    title: 'Nest with prisma',
    description: 'Learning nest with prisma',
    version: '1.0',
    endpoint: 'NWP',
    tag: 'Api`s listing'
};

export const API_PROPERTIES = {
    signup: {
        firstName: userFieldDescription('First name'),
        lastName: userFieldDescription('Last name'),
        email: userFieldDescription('Email'),
        role: userFieldDescription('Role'),
        password: userFieldDescription('Password')
    },
    login: {
        email: userFieldDescription('Email'),
        password: userFieldDescription('Password')
    },
    forgotPassword: {
        email: userFieldDescription('Email')
    },
    product: {
        title: productFieldDescription('Title'),
        description: productFieldDescription('Description'),
        price: productFieldDescription('Price'),
        discountPercentage: productFieldDescription('Discount Percentage'),
        stock: productFieldDescription('Stock'),
        brand: productFieldDescription('Brand'),
        thumbnail: productFieldDescription('Thumbnail'),
        filters: {
            category: 'Category name',
            maxPrice: 'Max price for the product',
            minPrice: 'Min price for the product',
            rating: 'Rating'
        }
    },
    pagination: {
        size: 'Number of records per page',
        page: 'Page number'
    }
};

export const DEFAULT_VALUES = {
    user: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
        phoneNumber: '9877445566',
        password: 'User@1234',
        role: Role.User
    },
    category: {
        name: 'travel'
    },
    product: {
        title: 'ABC product for you',
        description: 'ABC retins quality of the product',
        discount: '10',
        minPrice: 0,
        maxPrice: 500000,
        price: '10',
        rating: 1
    }
};
