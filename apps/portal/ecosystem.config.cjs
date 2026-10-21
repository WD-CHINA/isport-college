const runtime = {
  NODE_ENV: 'production',
  HOST: '127.0.0.1',
  PORT: '8040',
  NITRO_HOST: '127.0.0.1',
  NITRO_PORT: '8040',
}

module.exports = {
  apps: [
    {
      name: 'isport-academy',
      cwd: __dirname,
      script: './server/index.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: runtime,
    },
  ],
}
