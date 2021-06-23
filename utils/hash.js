const crypto = require('crypto');

const hashString = (cadena) => {
    const cadenaHash = crypto.createHash('sha256').update(cadena).digest('base64');
    return cadenaHash;
}

module.exports = {
    hashString
}