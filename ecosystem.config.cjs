module.exports = {
  apps: [
    {
      name: 'eightOunce',
      script: 'dist/clients/eightOunceClient.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
    {
      name: 'monogram',
      script: 'dist/clients/monogramClient.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
    {
      name: 'pirates',
      script: 'dist/clients/piratesClient.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
    {
      name: 'revolver',
      script: 'dist/clients/revolverClient.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
    {
      name: 'rogueWave',
      script: 'dist/clients/rogueWaveClient.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
    {
      name: 'rosso',
      script: 'dist/clients/rossoClient.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
    {
      name: 'subtext',
      script: 'dist/clients/subtextClient.js',
      watch: true,
      time: true,
      cron: '0 * * * *',
    },
  ],
};
