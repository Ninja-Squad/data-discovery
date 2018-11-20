# Creating GnpIS Portal (Edited/Created files)

This readme will be useful :
* If we want to create a new instance/portal/app.
* Or if anyone wanted to go back and edit what have been added/edited again.

## Modifications

* Edited `./.gitlab-ci.yml` file in the root directory.

### In `buildSrc` folder

* Added `gnpis` to the `acceptableValues` in `./buildSrc/src/main/kotlin/app.kt` file:

      private val acceptableValues = setOf("rare", "wheatis", "gnpis")

### `backend` folder

* Add this line in `backend/src/main/java/fr/inra/urgi/datadiscovery/config/AppProfile.java`

      public static final String GNPIS = "gnpis-app";

* Added `GNPIS` profil in :
      - `./backend/src/main/java/fr/inra/urgi/datadiscovery/dao/wheatis/WheatisAggregationAnalyzer.java`
      - `./backend/src/main/java/fr/inra/urgi/datadiscovery/dao/wheatis/WheatisDocumentDao.java`
      - `./backend/src/main/java/fr/inra/urgi/datadiscovery/harvest/wheatis/WheatisHarvester.java`

* Add this code to `./backend/src/main/resources/application.yml` (**Specifying a new port for `gnpis-app`**)

      ---
      spring:
        profiles: gnpis-app
        cloud.config.name: gnpis
        security.user:
            name: gnpis
            password: f01a7031fc17

      data-discovery:
        elasticsearch-prefix: 'gnpis-dev-'
        resource-dir: /tmp/gnpis-dev/resources

      server:
        port: 8070
        servlet:
          context-path: /gnpis-dev

### `data` folder

* Create a folder called `gnpis` in `./data`, and put the compressed JSON files in it.

### `frontend` folder

* Edited the `./frontend/coverage/index.html` file.

* Edited `./frontend/src/app/models/test-model-generators.ts` by adding an `import` and `toGnpisDocument` function.

* Created a `gnpis` file in `./frontend/src/app` with the following structure:

```
gnpis
├── gnpis-document
│   ├── gnpis-document.component.html
│   ├── gnpis-document.component.scss
│   ├── gnpis-document.component.spec.ts
│   └── gnpis-document.component.ts
├── gnpis-header
│   ├── gnpis-header.component.html
│   ├── gnpis-header.component.scss
│   ├── gnpis-header.component.spec.ts
│   └── gnpis-header.component.ts
├── gnpis-document.model.ts
└── gnpis.module.ts
```

* Create a `gnpis` file in `./frontend/src/assets` containing the following file:
  - `band.jpg`
  - `favicon.ico`
  - `logo.png`
  - `theme.scss`

And edit them as desired.

* Create and edit those two files in `./frontend/src/environments`:
  - `environment.gnpis.prod.ts`
  - `environment.gnpis.ts`

* Add the `gnpis` configuration in `./frontend/angular.json` file

* Edit `./frontend/package.json` by adding:

      "start:gnpis": "ng serve --configuration=gnpis",
      "build:gnpis": "ng build --configuration=gnpis-production --no-progress",

* Edit `./frontend/proxy.conf.js` by adding:

      {
        context: [
          "/gnpis-dev/api",
          "/gnpis-dev/actuator"
        ],
        target: "http://localhost:8070",
        secure: false
      }

### Scripts

* Add this line to `scripts/createIndexAndAliases.sh` file:

      # GnpIS index/alias
      sh $BASEDIR/createIndexAndAliases4CI.sh localhost gnpis dev

* Create `harvestGnpis.sh` with the following content:

      #!/bin/bash

      # delegates to parameterized script
      BASEDIR=$(dirname "$0")

      sh $BASEDIR/harvestCI.sh localhost 8070 gnpis dev

### Testing

    ./gradlew test

In my case I kept getting `Permission denied` errors, the problem solved by deleting `buildSrc/build` and `backend/build` directory and running the test again.

### Running the App

1. Fire up Docker

        docker-compose up

2. Build the app

        ./gradlew assemble -Papp=gnpis

3. Deploy

        java -jar backend/build/libs/gnpis.jar

4. Index the data

        ./scripts/createIndexAndAliases.sh
        ./scripts/harvestGnpis.sh

5. App is running at : http://localhost:8070/gnpis-dev/

Check out the [main readme](https://forgemia.inra.fr/urgi-is/data-discovery/blob/master/README.md) for more details.

### List of CAMD files

* `[C]` Created.
* `[A]` Added (e.g `gz` file)
* `[M]` Modified.
* `[D]` Deleted before running the test (`./gradlew test`)
* `...` = `fr > inra > urgi > datadiscovery`.
```
./
├── [M] .gitlab-ci.yml
├── backend > [D] build
├── backend > src > main > java > ... > config > [M] AppProfile.java
│                                     > dao > wheatis > [M] WheatisAggregationAnalyzer.java
│                                     > dao > wheatis > [M] WheatisDocumentDao.java
│                                     > harvest > wheatis > [M] WheatisHarvester.java
├── backend > src > main > resources > [M] application.yml
├── backend > src > main > resources > ... > domain > [C] gnpis > [C] GnpisGeneticResource.mapping.json
│   
├── data > gnpis > [A] DATA_FILE1.json.gz (can add many files)
│   
├── buildSrc > [D] build
├── buildSrc > src > main > kotlin > [M] app.kt
│   
├── frontend > [M] angular.json
│            > [M] package.json
│            > [M] proxy.conf.js
├── frontend > src > app > [C] gnpis > gnpis-document > [C] gnpis-document.component.html
│                        > [C] gnpis > gnpis-document > [C] gnpis-document.component.scss
│                        > [C] gnpis > gnpis-document > [C] gnpis-document.model.ts
│                        > [C] gnpis > gnpis-document > [C] gnpis-document.component.spec.ts
│                        > [C] gnpis > gnpis-header > [C] gnpis-header.component.html
│                        > [C] gnpis > gnpis-header > [C] gnpis-header.component.scss
│                        > [C] gnpis > gnpis-header > [C] gnpis-header.component.ts
│                        > [C] gnpis > gnpis-header > [C] gnpis-header.component.spec.ts
│                        > [C] gnpis > [C] gnpis.module.ts
├── frontend > src > app > models > [M] test-model-generators.ts
├── frontend > src > assets > [C] gnpis > [C] band.jpg
│                           > [C] gnpis > [C] favicon.ico
│                           > [C] gnpis > [C] logo.png
│                           > [C] gnpis > [C] theme.scss
├── frontend > src > environments > [C] environment.gnpis.prod.ts
├──                               > [C] environment.gnpis.ts
│
├── scripts > [M] createIndexAndAliases.sh
└── scripts > [C] harvestGnpis.sh
```
