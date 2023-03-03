module.exports = [
  {
    name: 'hatch',
    script: 'src/clients/hatchClient.ts',
    time: true,
    cron: '0 * * * *',
  },
  {
    name: 'prototype',
    script: 'src/clients/prototypeClient.ts',
    time: true,
    cron: '0 * * * *',
  },
];
