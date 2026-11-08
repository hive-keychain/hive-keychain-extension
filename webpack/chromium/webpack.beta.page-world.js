const path = require('path');
const { createPageWorldConfig } = require('../lavamoat/page-world');

module.exports = createPageWorldConfig({
  outputPath: path.join(__dirname, '../../dist-beta'),
  isFirefox: false,
});
