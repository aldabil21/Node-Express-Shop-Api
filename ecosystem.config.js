module.exports = {
  apps: [
    {
      name: "app",
      script: "./app.js",
      instances: "max",
      exec_mode: "cluster",
      env: {
        NODE_ENV: "development",
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
        DB_HOST: "u3r5w4ayhxzdrw87.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
        DB_USER: "v5b6zhzxqd662xmq",
        DB_PASSWORD: "yft0ts5dbytl68w1",
        DB_SCHEMA: "qvn915fhm16fywgy",
        JWT_SECRET:
          "XnuiME36MIlv8dj61okA1DkqeYQVz7sHF3pfGF0j0l2xUfB4hsrJGcVOoCK5Kx0",
        JWT_EXPIRESIN: "2d",
      },
    },
  ],
};
