const PROXY_CONFIG = [
  {
    context: [
      "/rare-dev/api",
      "/rare-dev/actuator",
    ],
    target: "http://localhost:8080",
    secure: false
  },
  {
    context: [
      "/wheatis-dev/api",
      "/wheatis-dev/actuator"
    ],
    target: "http://localhost:8180",
    secure: false
  },
  {
    context: [
      "/data-discovery-dev/api",
      "/data-discovery-dev/actuator"
    ],
    target: "http://localhost:8280",
    secure: false
  },
  {
    context: [
      "/rare-with-basket-dev/api",
      "/rare-with-basket-dev/actuator"
    ],
    target: "http://localhost:8580",
    secure: false
  }
];

module.exports = PROXY_CONFIG;
