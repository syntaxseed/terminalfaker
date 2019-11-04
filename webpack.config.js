const path = require('path');

module.exports = {
  entry: './src/main/index.js',
  mode: 'development',
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'src/js'),
  },
};
