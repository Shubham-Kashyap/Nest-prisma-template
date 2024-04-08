export default () => ({
    port: parseInt(process.env.PORT, 10) || 8000,
    bycrypt_salt: process.env.BCRYPT_SALT,
    incomming_requests_logging: process.env.INCOMMING_REQUESTS_LOGGING,
    database: {
        url: process.env.DATABASE_URL
    },
    jwt: {
        validity: process.env.JWT_VALIDITY,
        secret: process.env.JWT_SECRET,
        algorithm: process.env.JWT_ALGORITHM
    }
});
