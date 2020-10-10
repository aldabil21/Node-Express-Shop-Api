module.exports = {
  apps: [
    {
      name: "app",
      script: "./app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
        PORT: 5000,
        DB_PORT: 3306,
        DB_HOST: "localhost",
        DB_USER: "root",
        DB_PASSWORD: "",
        DB_SCHEMA: "test",
        JWT_SECRET:
          "XnuiME36MIlv8dj61okA1DkqeYQVz7sHF3pfGF0j0l2xUfB4hsrJGcVOoCK5Kx0",
        JWT_EXPIRESIN: "2d",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 5000,
        DB_HOST: "us-cdbr-east-02.cleardb.com",
        DB_USER: "b9e84c12e0c693",
        DB_PASSWORD: "b149436f",
        DB_SCHEMA: "heroku_1e4ef52093bc0c5",
        JWT_SECRET:
          "XnuiME36MIlv8dj61okA1DkqeYQVz7sHF3pfGF0j0l2xUfB4hsrJGcVOoCK5Kx0",
        JWT_EXPIRESIN: "2d",
      },
    },
  ],
};
