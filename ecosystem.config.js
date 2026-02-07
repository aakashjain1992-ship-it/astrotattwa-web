module.exports = {
  apps: [
    {
      name: "astrotattwa-web",
      cwd: "/var/www/astrotattwa-web",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        // DO NOT HARDCODE SECRETS HERE
        // Use .env.local file instead
      }
    }
  ]
};
