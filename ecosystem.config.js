module.exports = {
  apps: [
    {
      name: "astrotattwa-web",
      cwd: "/var/www/astrotattwa-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
