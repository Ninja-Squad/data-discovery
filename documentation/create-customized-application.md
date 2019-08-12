# How to create a customized (look & feel and schema) new version of the data-discovery application

It has been made possible to implement quite easily a new version of the data-discovery application in order to adapt
it with a new schema or another look & feel. The example below describes the changes which have been made to
introduce the `data-discovery` app in addition to the existing `rare` and `wheatis`.

WARNING: those changes are not fully maintained over time, so some changes can be deprecated and new ones could be
required. This is a best effort documentation only.

> In this example we created a new application which is very similar to `WheatIS` (at the moment of writing), so there
> aren't many changes in the backend (we kept using the `WheatIS` java classes). Check out the
> [frontend README](../frontend/README.md#add-another-application)
> for other details.

## CI/CD

* Update`.gitlab-ci.yml` in root directory to create a `data-discovery` specific job for each application specific job.

## In `buildSrc` folder

* Add `data-discovery` to the `acceptableValues` in `./buildSrc/src/main/kotlin/app.kt` file:

```kotlin
      private val acceptableValues = setOf("rare", "wheatis", "data-discovery")
```

## `backend` folder

* Add this line in `backend/src/main/java/fr/inra/urgi/datadiscovery/config/AppProfile.java`

```java
      public static final String DATADISCOVERY = "data-discovery-app";
```

* Add `DATADISCOVERY` profile in:
  - `./backend/src/main/java/fr/inra/urgi/datadiscovery/dao/wheatis/WheatisAggregationAnalyzer.java`
  - `./backend/src/main/java/fr/inra/urgi/datadiscovery/dao/wheatis/WheatisDocumentDao.java`

* Add this code to `./backend/src/main/resources/application.yml` (**specify a new port for `data-discovery-app`**)

```
      ---
      spring:
        profiles: data-discovery-app
        cloud.config.name: data-discovery
        security.user:
            name: data-discovery
            password: f01a7031fc17

      data-discovery:
        elasticsearch-prefix: 'data-discovery-dev-'
        resource-dir: /tmp/data-discovery-dev/resources

      server:
        port: 8280
        servlet:
          context-path: /data-discovery-dev
```

## `data` folder

* Create a folder called `data-discovery` in `./data`, and put the compressed JSON files inside it.

## `frontend` folder

* Edit the `./frontend/coverage/index.html` file.

* Edit `./frontend/src/app/models/test-model-generators.ts` by adding an `import` and `toDataDiscoveryDocument` function.

* Since `DataDiscovery` and `WheatIS` share the same document structure we created a `data-discovery` module in
`./frontend/src/app` containing only `data-discovery-header` and used the `generic-document` found in
`frontend/src/app/urgi-common`, this generic document is common between DataDiscovery and WheatIS:

```
data-discovery
├── data-discovery-header
│   ├── data-discovery-header.component.html
│   ├── data-discovery-header.component.scss
│   ├── data-discovery-header.component.spec.ts
│   └── data-discovery-header.component.ts
├── data-discovery-document.model.ts
└── data-discovery.module.ts
```

```
urgi-common
├── generic-document
│   ├── generic-document.component.html
│   ├── generic-document.component.scss
│   ├── generic-document.component.spec.ts
│   └── generic-document.component.ts
├── generic-document.model.ts
└── ...
```

* Create a `data-discovery` file in `./frontend/src/assets` containing the following file:
  - `band.jpg`
  - `favicon.ico`
  - `logo.png`
  - `theme.scss`

And edit them as desired.

* Create and edit the environment files in `./frontend/src/environments`:
  - `environment.data-discovery.prod.ts`
  - `environment.data-discovery.ts`

* Add `data-discovery` configuration in `./frontend/angular.json` file

* Edit `./frontend/package.json` by adding:

      "start:data-discovery": "ng serve --configuration=data-discovery",
      "build:data-discovery": "ng build --configuration=data-discovery-production --no-progress",

* Edit `./frontend/proxy.conf.js` by adding:

```js
      {
        context: [
          "/data-discovery-dev/api",
          "/data-discovery-dev/actuator"
        ],
        target: "http://localhost:8280",
        secure: false
      }
```

## Scripts

* Add this line to `scripts/createIndexAndAliases.sh` file:

```bash
      # DataDiscovery index/alias
      sh $BASEDIR/createIndexAndAliases4CI.sh localhost data-discovery dev
```

* Create `harvestDataDiscovery.sh` with the following content:

```bash
      #!/bin/bash

      # delegates to parameterized script
      BASEDIR=$(dirname "$0")

      sh $BASEDIR/harvestCI.sh -host localhost -port 9200 -app data-discovery -env dev
```

## Testing

`./gradlew clean test`

## Running the App

1. Fire up Docker

        docker-compose up

2. Build the app

        ./gradlew assemble -Papp=data-discovery

3. Deploy

        java -jar backend/build/libs/data-discovery.jar

4. Index the data

        ./scripts/createIndexAndAliases.sh
        ./scripts/harvestDataDiscovery.sh

5. App is running at : http://localhost:8280/data-discovery-dev/

## Ports used according to the applications and the environment:

Checkout the (confidential) [README.md](https://forgemia.inra.fr/urgi-is/data-discovery-config/blob/master/README.md)
file for the full list of deployment environments for the `data-discovery` webapp (server ports & context paths).
