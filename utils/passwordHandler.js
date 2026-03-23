const crypto = require('crypto');

module.exports = {
    generateRandomPassword: function (length = 16) {
        return crypto.randomBytes(Math.ceil(length * 3 / 4))
            .toString('base64')
            .slice(0, length)
            .replace(/\+/g, '0')
            .replace(/\//g, '1');
    }
};
