module.exports = {
  apps: [
    {
      name: 'scrapers',
      script: 'dist/index.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
  ],
};
