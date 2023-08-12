const crypto = require('crypto')

const CryptoUtils = {
    algorithm: 'aes-256-gcm',
    getAnonymousUsername: (signedUserId) => {
        const salt = process.env.BETTER_HASH_SALT;
        const saltedUserId = salt + signedUserId + salt;
        const anonymousUsername = crypto.createHash('sha256').update(saltedUserId).digest('hex');

        return anonymousUsername
    },

    sha256: (input) => {
        const salt = process.env.BETTER_HASH_SALT;
        const saltedInput = salt + input + salt;
        const hashedInput = crypto.createHash('sha256').update(saltedInput).digest('hex');

        return hashedInput
    },

    randomInt: (max) => {
        return crypto.randomInt(max);
    },

    encrypt: (text) => {
        const key = crypto.scryptSync(process.env.BETTER_HASH_SALT, 'salt', 32);
        const iv = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv(CryptoUtils.algorithm, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return [encrypted, iv.toString('hex'), cipher.getAuthTag().toString('hex')];
    },

    decrypt: (text, iv, authTag) => {
        const key = crypto.scryptSync(process.env.BETTER_HASH_SALT, 'salt', 32);
        const decipher = crypto.createDecipheriv(CryptoUtils.algorithm, key, Buffer.from(iv, 'hex'));
        decipher.setAuthTag(Buffer.from(authTag, 'hex'))
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    },

    encryptSignedUserId: (signedUserId) => {
        return CryptoUtils.encrypt(signedUserId).join('/')
    },

    decryptAnonymousUserId: (anonymousUserId) => {
        const split = anonymousUserId.split('/')
        const [encrypted, iv, authTag] = split
        return CryptoUtils.decrypt(encrypted, iv, authTag)
    }
}

module.exports = CryptoUtils
