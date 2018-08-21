const PROXY_CONFIG = [
  {
    context: [
      "/rare/api",
      "/rare/actuator"
    ],
    target: "http://localhost:8080",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
