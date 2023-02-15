module.exports = [
  {
    name: 'hatch',
    script: 'dist/src/clients/hatchClient.js',
    time: true,
    cron: '0 * * * *',
  },
  {
    name: 'prototype',
    script: 'dist/src/clients/prototypeClient.js',
    time: true,
    cron: '0 * * * *',
  },
];
