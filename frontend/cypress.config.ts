import { defineConfig } from 'cypress';

export default defineConfig({
  video: false,
  reporter: 'mocha-spec-json-output-reporter',
  reporterOptions: {
    fileName: 'cypress-result.json'
  },
  e2e: {
    baseUrl: 'http://localhost:4200/faidare-dev'
  }
});
