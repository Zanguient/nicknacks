const crypto = require('crypto');
const Encryptor = {
  // Encrypts a given value and generates a salt if none is provided.
  generateHash: function(value, salt) {
    if (!salt) { salt = this.generateSalt(); }

    console.log(value)
    console.log(salt)

    var hashedPassword = crypto.pbkdf2Sync(value, salt, 10000, 64, 'sha512').toString('hex');
    return {
      hash: hashedPassword,
      salt: salt
    };
  },
  // salt generator
  generateSalt: function(){
    return crypto.randomBytes(64).toString('hex');
  },
  // Compares a hash/salt with a given value
  compareHash: function(value, salt, hash) {
    generatedHash = this.generateHash(value, salt).hash;

    return generatedHash == hash;
  }
}

module.exports = Encryptor;
