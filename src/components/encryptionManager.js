const algorithm = 'aes-256-ctr';

class EncryptionManager {
  async generateLink(secret, passphrase, includePassphrase, duration) {
    console.log('****', secret, passphrase, includePassphrase, duration);

    const initializationVector = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, passphrase, initializationVector);
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

    const data = response.json();
    console.log(data);

    const queryString = new URLSearchParams();
    queryString.set('secretId', data.secretId);
    if (includePassphrase) {
      queryString.set('passphrase', passphrase);
    }
    const urlLink = new URL(`https://authress.io/app/#/vanish?${queryString.toString()}`);
    return urlLink.toString();
  }

  async decodeSecret(secretId, passphrase) {
    const response = await fetch(`https://vanish.authress.io/secrets/${secretId}`);
    const data = response.json();

    const { data: encryptionData, iv: initializationVector } = JSON.parse(Buffer.from(data.encryptedSecret, 'base64').toString());
    const decipher = crypto.createDecipheriv(algorithm, passphrase, Buffer.from(initializationVector, 'base64'));
    const decryptedSecret = Buffer.concat([decipher.update(Buffer.from(encryptionData, 'base64')), decipher.final()]);
    return decryptedSecret.toString();
  }
}

export default new EncryptionManager();
