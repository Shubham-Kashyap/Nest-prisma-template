import 'dotenv/config';

type SeederName = 'category' | 'products' | 'user';

type SeederDefinition = {
    name: SeederName;
    description: string;
    run: () => Promise<void>;
};

const seeders: SeederDefinition[] = [
    {
        name: 'category',
        description: 'Seeds product categories',
        run: async () => {
            const module = await import('./seeder/category/category.seeder');
            await module.default();
        }
    },
    {
        name: 'user',
        description: 'Seeds demo users and addresses',
        run: async () => {
            const module = await import('./seeder/user/user.seeder');
            await module.default();
        }
    },
    {
        name: 'products',
        description: 'Seeds products catalog data',
        run: async () => {
            const module = await import('./seeder/products/products.seeder');
            await module.default();
        }
    }
];

const parseRequestedSeeders = (argv: string[]) => {
    const onlyArg = argv.find((arg) => arg.startsWith('--only='));
    const listArg = argv.includes('--list');

    if (listArg) {
        return {
            listOnly: true,
            names: [] as SeederName[]
        };
    }

    if (!onlyArg) {
        return {
            listOnly: false,
            names: seeders.map((seeder) => seeder.name)
        };
    }

    const names = onlyArg
        .replace('--only=', '')
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean) as SeederName[];

    return {
        listOnly: false,
        names
    };
};

const validateRequestedSeeders = (names: SeederName[]) => {
    const availableSeederNames = new Set(seeders.map((seeder) => seeder.name));
    const invalidNames = names.filter((name) => !availableSeederNames.has(name));

    if (invalidNames.length) {
        throw new Error(
            `Unknown seeders: ${invalidNames.join(', ')}. Available seeders: ${seeders
                .map((seeder) => seeder.name)
                .join(', ')}`
        );
    }
};

const listSeeders = () => {
    console.log('Available seeders:');
    seeders.forEach((seeder) => {
        console.log(`- ${seeder.name}: ${seeder.description}`);
    });
};

export const seed = async (requestedSeederNames: SeederName[]) => {
    validateRequestedSeeders(requestedSeederNames);

    const selectedSeeders = seeders.filter((seeder) => requestedSeederNames.includes(seeder.name));

    if (!selectedSeeders.length) {
        console.log('No seeders selected. Nothing to run.');
        return;
    }

    try {
        for (const seeder of selectedSeeders) {
            console.log(`Running seeder: ${seeder.name}`);
            await seeder.run();
        }

        console.log(`Seeding completed successfully for: ${selectedSeeders.map((seeder) => seeder.name).join(', ')}`);
    } catch (error) {
        console.error('Error occurred during seeding:', error);
        throw error;
    }
};

const bootstrap = async () => {
    const { listOnly, names } = parseRequestedSeeders(process.argv.slice(2));

    if (listOnly) {
        listSeeders();
        return;
    }

    if (!(process.env.MONGODB_URL ?? process.env.MONGODB_URI ?? process.env.MONGO_URL)) {
        throw new Error('MONGODB_URL is required to run Mongo seeders. Add it to .env before running seed commands.');
    }

    await seed(names);
    console.log('Database seeding process finished.');
};

bootstrap().catch((error) => {
    console.error('Seeding process failed:', error);
    process.exit(1);
});
