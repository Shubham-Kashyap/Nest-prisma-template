import { encryptPassword } from '@utilities/hash';

export const userData = [
    {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@gmail.com',
        password: encryptPassword('Admin@1234'),
        role: 'admin',
        isEmailVerified: true,
        shippingAddress: [
            {
                name: '4321 Oak Avenue, Othertown, CA, USA',
                street: '4321 Oak Avenue',
                city: 'Othertown',
                zip: '90001',
                country: 'USA'
            },
            {
                name: '1234 Maple Street, Anytown, NY, USA',
                street: '1234 Maple Street',
                city: 'Anytown',
                zip: '10001',
                country: 'USA'
            }
        ]
    },
    {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@gmail.com',
        password: encryptPassword('User@1234'),
        role: 'user',
        isEmailVerified: true,
        shippingAddress: [
            {
                name: '789 Pine Street, Anothertown, FL, USA',
                street: '789 Pine Street',
                city: 'Anothertown',
                zip: '33101',
                country: 'USA'
            },
            {
                name: '567 Elm Road, Sometown, TX, USA',
                street: '567 Elm Road',
                city: 'Sometown',
                zip: '73301',
                country: 'USA'
            }
        ]
    }
];
