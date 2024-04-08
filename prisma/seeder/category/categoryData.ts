import { Prisma } from '@prisma/client';

export const categories: Prisma.CategoryCreateManyInput[] = [
    {
        description: 'Mobiles',
        name: 'mobiles'
    },
    {
        description: 'Fashion',
        name: 'fashion'
    },
    {
        description: 'Electronics',
        name: 'electronics'
    },
    {
        description: 'Home',
        name: 'home'
    },
    {
        description: 'Travel',
        name: 'travel'
    },
    {
        description: 'Appliances',
        name: 'appliances'
    },
    {
        description: 'Furniture',
        name: 'furniture'
    },
    {
        description: 'Beauty,Toys & more',
        name: 'beauty,toys_&_more'
    },
    {
        description: 'Grocery',
        name: 'grocery'
    }
];
