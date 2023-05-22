
const crypto = window.crypto || window.msCrypto;

class EncryptionManager {
  async generateLink(secret, passphrase, includePassphrase, duration) {
    const sha256key = await (window.crypto || window.msCrypto).subtle.digest('SHA-256', new TextEncoder().encode(passphrase));
    const key = await crypto.subtle.importKey('raw', sha256key, 'AES-CTR', false, ['encrypt', 'decrypt']);

    const initializationVector = await window.crypto.getRandomValues(new Uint8Array(16));
    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-CTR', counter: initializationVector, length: 128 }, key, new TextEncoder().encode(secret));

    const encryptedSecret = `${btoa(String.fromCharCode(...new Uint8Array(encryptedData)))}~${btoa(String.fromCharCode(...new Uint8Array(initializationVector)))}`;

    for (let iteration = 0; iteration < 5; iteration++) {
      try {
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
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error attempting to store secret', error);
        await new Promise(resolve => setTimeout(resolve, 20 * 2 ** iteration));
      }
    }

    return null;
  }

  async decodeSecret(secretId, passphrase) {
    let data;
    for (let iteration = 0; iteration < 5; iteration++) {
      try {
        const response = await fetch(`https://vanish.authress.io/secrets/${secretId}`);
        if (response.status >= 400) {
          return null;
        }

        try {
          data = await response.json();
          break;
        } catch (error) {
          return null;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error attempting to fetch secret', error);
        await new Promise(resolve => setTimeout(resolve, 20 * 2 ** iteration));
      }
    }

    if (!data) {
      return null;
    }
    
    const encryptedSecret = data.encryptedSecret;

    const sha256key = await (window.crypto || window.msCrypto).subtle.digest('SHA-256', new TextEncoder().encode(passphrase));
    const key = await crypto.subtle.importKey('raw', sha256key, 'AES-CTR', false, ['encrypt', 'decrypt']);

    const [encryptionData, initializationVector] = encryptedSecret.split('~');

    const decryptedData = await crypto.subtle.decrypt({
      name: 'AES-CTR',
      counter: Uint8Array.from(atob(initializationVector), c => c.charCodeAt(0)),
      length: 128
    }, key, Uint8Array.from(atob(encryptionData), c => c.charCodeAt(0)));

    return new TextDecoder().decode(decryptedData);
  }
}

export default new EncryptionManager();
