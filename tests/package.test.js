import { describe, it } from 'mocha';
import path from 'path';
import { expect } from 'chai';
import fs from 'fs-extra';
import * as url from 'url';

// eslint-disable-next-line no-underscore-dangle
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

describe('package.json', () => {
  describe('Syntax', () => {
    it('Should be valid node', async () => {
      const packageJson = await fs.readJSON(path.join(__dirname, '../package.json'));
      expect(packageJson.dependencies['@authress/login']).to.eql('*');
    });
  });
});
