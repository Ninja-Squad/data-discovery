const PROXY_CONFIG = [
  {
    context: ['/rare-dev/api', '/rare-dev/actuator'],
    target: 'http://localhost:8080',
    secure: false
  },
  {
    context: ['/wheatis-dev/api', '/wheatis-dev/actuator'],
    target: 'http://localhost:8180',
    secure: false
  },
  {
    context: ['/faidare-dev/api', '/faidare-dev/actuator'],
    target: 'http://localhost:8280',
    secure: false
  },
  {
    context: ['/brc4env-dev/api', '/brc4env-dev/actuator'],
    target: 'http://localhost:8580',
    secure: false
  }
];

export default PROXY_CONFIG;
