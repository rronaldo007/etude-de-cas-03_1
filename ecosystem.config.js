module.exports = {
  apps: [
    {
      name: "app",
      script: "./www/app.js",
      instances: 3,
      exec_mode: "cluster",
      error_file: "./logs/err.log",
      max_memory_restart: "200M",
      env_production: {
        NODE_ENV: "production",
      },
    },
  ],
};
