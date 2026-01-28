module.exports = {
  apps: [
    {
      name: "astrotattwa-web",
      cwd: "/var/www/astrotattwa-web",
      script: "node",
      args: "node_modules/next/dist/bin/next start -p 3000",
      env: {
        NODE_ENV: "production",

        // Supabase
        SUPABASE_URL: "https://ccrmlamtoxrilnhuwuu.supabase.co",
        NEXT_PUBLIC_SUPABASE_URL: "https://ccrmlamtoxrilnhuwuu.supabase.co",
        SUPABASE_SERVICE_ROLE_KEY: "sb_secret_-3NHltxdy5UG2nh0bjhv6w_67Cawioa"
      }
    }
  ]
};
