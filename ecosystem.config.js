// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'superimg-back-test',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'test',
      },
    },
    {
      name: 'superimg-back-prod',
      script: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
