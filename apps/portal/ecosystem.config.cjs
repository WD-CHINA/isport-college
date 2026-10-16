const runtime = {
  NODE_ENV: 'production',
  HOST: '127.0.0.1',
  PORT: '8040',
  NITRO_HOST: '127.0.0.1',
  NITRO_PORT: '8040',
  NUXT_API_BASE: 'http://127.0.0.1:8090',
  NUXT_PUBLIC_API_BASE: '/',
  NUXT_PUBLIC_SITE_ENV: 'test',
}

module.exports = {
  apps: [
    {
      name: 'isport-college',
      cwd: '/data/isport-test2/web/isport-college',
      script: './server/index.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1G',
      env: runtime,
      env_production: runtime,
    },
  ],
}
