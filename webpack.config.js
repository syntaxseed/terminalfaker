const path = require('path');

module.exports = {
  entry: './src/js/index.js',
  mode: 'development',
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'src'),
  },
};
