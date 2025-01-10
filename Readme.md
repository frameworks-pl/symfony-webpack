# Installation

- composer.phar require symfony/webpack-encore-bundle
- npm install
- npm install --save-dev @babel/plugin-proposal-class-properties

# Run server locally
- docker-compose up --build -d

# Adding jquery
- install jquery package: `npm install jquery`
- include jquery in app.js: `import $ from 'jquery';`

# Adding obfuscator
- `npm install terser-webpack-plugin --save-dev` (if not already installed)
- in webpack.config.js: 
  - `const TerserPlugin = require('terser-webpack-plugin');`

# Run build
- npm run dev