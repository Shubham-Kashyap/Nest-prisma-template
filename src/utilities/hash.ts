import * as bcrypt from 'bcrypt';

/**
 * Encrypt password
 * @param {string} text Plain text
 * @returns {string} Encrypted string for password
 */
export const encryptPassword = (text: string): string => {
    return bcrypt.hashSync(text, parseInt(process.env.BCRYPT_SALT || '10', 10));
};

/**
 * Compare password
 * @param {string} text Plain text
 * @param {string} encryptedPassword User's encrypted password
 * @returns {Boolean}
 */
export const comparePasswords = (text: string, encryptedPassword: string): boolean => {
    return bcrypt.compareSync(text, encryptedPassword);
};
