module.exports = {
  apps: [
    {
      name: "fidelizapp",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      instances: 1,
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,

        // API URL para producción
        NEXT_PUBLIC_API_URL: "https://api.your-domain.com",
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "http://localhost:4000",
      },
      log_file: "./logs/combined.log",
      out_file: "./logs/out.log",
      error_file: "./logs/error.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
