const algorithm = 'aes-256-ctr';

const crypto = window.crypto || window.msCrypto;

class EncryptionManager {
  async generateLink(secret, passphrase, includePassphrase, duration) {
    const sha256 = crypto.createHash('sha256');
    sha256.update(passphrase);

    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, sha256.digest(), initializationVector);
    const encryptedData = Buffer.concat([cipher.update(secret), cipher.final()]);

    const encryptedSecret = Buffer.from(JSON.stringify({
      data: encryptedData.toString('base64'),
      iv: initializationVector.toString('base64')
    })).toString('base64');

    const response = await fetch('https://vanish.authress.io/secrets', {
      method: 'POST',
      body: JSON.stringify({
        encryptedSecret,
        duration
      })
    });

    const data = await response.json();

    const queryString = new URLSearchParams();
    queryString.set('secretId', data.secretId);
    if (includePassphrase) {
      queryString.set('passphrase', passphrase);
    }
    const urlLink = new URL(`${window.location.origin}${window.location.pathname}#/vanish?${queryString.toString()}`);
    return urlLink.toString();
  }

  async decodeSecret(secretId, passphrase) {
    const response = await fetch(`https://vanish.authress.io/secrets/${secretId}`);
    const data = await response.json();

    if (response.status >= 400) {
      return null;
    }

    const sha256 = crypto.createHash('sha256');
    sha256.update(passphrase);

    const { data: encryptionData, iv: initializationVector } = JSON.parse(Buffer.from(data.encryptedSecret, 'base64').toString());
    const decipher = crypto.createDecipheriv(algorithm, sha256.digest(), Buffer.from(initializationVector, 'base64'));
    const decryptedSecret = Buffer.concat([decipher.update(Buffer.from(encryptionData, 'base64')), decipher.final()]);
    return decryptedSecret.toString();
  }
}

export default new EncryptionManager();
