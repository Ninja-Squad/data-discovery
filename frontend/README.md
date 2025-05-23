# RareFrontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

## Development server

Run `pnpm start` or `pnpm start:rare` for a dev server. 
Navigate to `http://localhost:4000/rare-dev`. The app will automatically reload if you change any of the source files.

To start another app, you can:
- for WheatIS, run : `pnpm start:wheatis`, then go to `http://localhost:4100/wheatis-dev`.
- for DataDiscovery, run: `pnpm start:data-discovery`, then go to `http://localhost:4200/data-discovery-dev`.

## Build

Run `pnpm build` or `pnpm build:rare` for a production build of the RARe project. 
The build artifacts will be stored in the `dist/` directory. 

Use the `pnpm build:wheatis` flag for a production build of WheatIS, and `pnpm build:data-discovery` for DataDiscovery.

## Running unit tests

Run `pnpm test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Linting and formatting

Run `ng lint --fix` to lint and format the frontend,
with automatic fixes (when possible).

## Internationalization

The application is internationalized: 
it reads the preferred language of the user 
from its browser, and tries to use it.
It uses the English language by default if none is found.
Translations are provided in French and in English,
in the `fr.json` and `en.json` files.
These translations are used by the 
[`ngx-translate` library](https://github.com/ngx-translate/core).

The translation keys usually follow the convention
`component-name.text-key` to easily find them. 

## Analyzing Application size

Run `pnpm build:stats` to generate size statistics and `pnpm analyze` to visualize them.

# Add another application

Each application (like RARe or WheatIS) works in the same way.
Everything is shared between apps, 
except a dedicated module (like `RareModule` and `WheatisModule`)
that contains the component able to display the resource,
and a TypeScript interface describing the resource.  

Each application also has a few configuration files
for the the builds, proxy, etc.

To add a new application, you'll need to:

- create a new module
- create an interface extending `GeneticResourceModel` and representing the resource (see `RareGeneticResourceModel`)
- create a component to display the resource (see `RareGeneticResourceComponent`)
- create a component to display the header (see `RareHeaderComponent`)
- create environment files for dev and production (see `environment.rare.ts` and `environment.rare.prod.ts`),
containing the module created, the links of the navbar, the aggregation names, etc. 
- add targets to use these files in `angular.json` (see the targets `rare` and `rare-production`)
- add a proxy configuration for the context (see `proxy.conf.js`)
- add scripts to serve and build the application (see `package.json`)
- add the assets for the application (logo, band, favicon... see `src/assets/rare` and `angular.json`)
- update the Gradle build (see `build.gradle.kts`)
