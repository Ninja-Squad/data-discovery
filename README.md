# Rare project - Data discovery

## Setup

### Backend

The project uses Spring (5.x) for the backend,
with Spring Boot.

You need to install:

- a recent enough JDK8

The application expects to connect on an ElasticSearch instance running on `http://127.0.0.1:9300`,
in a cluster named `es-data-discovery`.
To have such an instance, simply run:

    docker-compose up

And this will start ElasticSearch and a Kibana instance (allowing to explore the data on http://localhost:5601).

Then at the root of the application, run `./gradlew build` to download the dependencies.
Then run `./gradlew bootRun` to start the app.

You can stop the Elastic Search and Kibana instances by running:

    docker-compose stop

### Frontend

The project uses Angular (6.x) for the frontend,
with the Angular CLI.

You need to install:

- a recent enough NodeJS (8.11+)
- Yarn as a package manager (see [here to install](https://yarnpkg.com/en/docs/install))

Then in the `frontend` directory, run `yarn` to download the dependencies.
Then run `yarn start` to start the app, using the proxy conf to reroute calls to `/api` to the backend.

The application will be available on:
- http://localhost:4200/rare-dev for RARe (runs with: `yarn start:rare` or simply `yarn start`)
- http://localhost:4200/wheatis-dev for WheatIS (runs with: `yarn start:wheatis`)

## Build

To build the app, just run:

    ./gradlew assemble
or 
    ./gradlew assemble -Papp=wheatis

This will build a standalone jar at `backend/build/libs/rare.jar` or  `backend/build/libs/wheatis.jar`, that you can run with:

    java -jar backend/build/libs/rare.jar
    java -jar backend/build/libs/wheatis.jar

And the full app run on:

- http://localhost:8080/rare-dev
- http://localhost:8090/wheatis-dev


## CI

The `.gitlab-ci.yml` file describes how Gitlab is running the CI jobs.

It uses a base docker image named `ninjasquad/docker-rare`
available on [DockerHub](https://hub.docker.com/r/ninjasquad/docker-rare/)
and [Github](https://github.com/Ninja-Squad/docker-rare).
The image is based on `openjdk:8` and adds a Chrome binary to let us run the frontend tests
(with a headless Chrome in `--no-sandbox` mode).

We install `node` and `yarn` in `/tmp` (this is not the case for local builds)
to avoid symbolic links issues on Docker.

You can approximate what runs on CI by executing:

    docker run --rm -v "$PWD":/home/rare -w /home/rare ninjasquad/docker-rare ./gradlew build

## Harvest

Harvesting (i.e. importing documents stored in JSON files into ElasticSearch) consists in
creating the necessary index and aliases, and then placing the JSON files into a directory where the server can find them.

To create the index and its aliases execute the script 

    ./scripts/createIndexAndAliases.sh

The directory, by default is `/tmp/rare-dev/resources` and `/tmp/wheatis-dev/resources`. But it's externalized into the 
Spring Boot property `rare.resource-dir`, so it can be easily changed by modifying the value of this property (using an 
environment variable for example).

You can run the scripts:

    ./scripts/harvestRare.sh
    ./scripts/harvestWheatis.sh
    
to trigger a harvest of the resources stored in the Git LFS directories `data/rare` and `data/wheatis`.

Since the harvest process is handle by a webservice which runs inside the Spring Boot application, you 
need to start `rare.jar` or `wheatis.jar` before (see [Build](#build) section)
{: .alert .alert-warning}
    
The files must have the extension `.json`, and must be stored in that directory (not in a sub-directory).
Once the files are ready and the server is started, the harvest is triggered by sending a POST request
to the endpoint `/api/harvests`, as described in the API documentation that you can generate using the 
build task `asciidoctor`, which executes tests and generates documentation based on snippets generated 
by these tests. The documentation is generated in the folder `backend/build/asciidoc/html5/index.html`/

    ./gradlew asciidoctor

## Indices and aliases

The application uses two physical indices: 

 * one to store the harvest results. This one is created automatically if it doesn't exist yet when the application starts.
   It doesn't contain important data, and can be deleted and recreated if really needed.
 * one to store physical resources. This one must be created explicitly before using the application. If not,
 requests to the web services will return errors.

Each index and alias below refers to `rare` application in `dev` environment, the equivalent shall be created for `wheatis` 
app in `dev` environment as same as in `beta` or `prod` environments. For brevity, only `rare-dev` is explained here.
{: .alert .alert-info}

The application doesn't use the physical resources index directly. Instead, it uses two aliases, that must be created 
before using the application:

 * `rare-dev-resource-index` is the alias used by the application to search for documents
 * `rare-dev-resource-harvest-index` is the alias used by the application to store documents when the harvest is triggered.
 
In normal operations, these two aliases should refer to the same physical resource index. The script
`createIndexAndAliases.sh` creates a physical index (named `rare-dev-resource-physical-index`) and creates these two aliases 
referring to this physical index.

Once the index and the aliases have been created, a harvest can be triggered. The first operation that a harvest
does is to create or update (put) the mapping for the document entity into the index aliased by `rare-dev-resource-harvest-index`. 
Then it parses the JSON files and stores them into this same index. Since the `rare-dev-resource-index` alias 
normally refers to the same physical index, searches will find the resources stored by the harvester.

### Why two aliases

Using two aliases is useful when deleting obsolete documents. This is actually done by removing everything
and then harvesting the new JSON files again, to re-populate the index from scratch.

Two scenarios are possible:

#### Deleting with some downtime

The harvest duration depends on the performance of Elasticsearch, of the performance of the harvester, and 
of course, of the number of documents to harvest. If you don't mind about having a period of time 
where the documents are not available, you can simply 

 - delete the physical index;
 - re-create it with its aliases;
 - trigger a new harvest.
 
Keep in mind that, with the current known set of documents (17172), on a development machine where everything is running
concurrently, when both the Elasticsearch server and the application are hot, a harvest only takes 12 seconds.
So, even if you have 10 times that number of documents (170K documents), it should only take around 2 minutes of downtime.
If you have 100 times that number of documents (1.7M documents), it should take around 20 minutes, which is still not a 
very long time.

(Your mileage may vary: I assumed a linear complexity here).

Here are curl commands illustrating the above scenario:
```
# delete the physical index and its aliases
curl -X DELETE "localhost:9200/rare-dev-resource-physical-index"

# recreate the physical index and its aliases
curl -X PUT "localhost:9200/rare-dev-resource-physical-index" -H 'Content-Type: application/json' -d'
{
    "aliases" : {
        "rare-dev-resource-index" : {},
        "rare-dev-resource-harvest-index" : {}
    }
    "settings": ...
}
'
```

**NOTE**: Every time a physical index is created, the settings must be specified, the same ay as in the 
`createIndexAndAliases.sh` script. The exact content of the settings is omitted here for brevity and readability.
{: .alert .alert-info}

#### Deleting with no downtime

If you don't want any downtime, you can instead use the following procedure:

 - create a new physical index (let's name it `rare-dev-resource-new-physical-index`);
 - delete the `rare-dev-resource-harvest-index` alias, and recreate it so that it refers to `rare-dev-resource-new-physical-index`;
 - trigger a harvest. During the harvest, the `rare-dev-resource-index` alias, used by the search,
   still refers to the old physical index, and it thus still works flawlessly;
 - once the harvest is finished, delete the `rare-dev-resource-index` alias, and recreate it so that it refers to 
   `rare-dev-resource-new-physical-index`. All the search operations will now use the new index, containing up-to-date
   documents;
 - delete the old physical index.
 
Here are curl commands illustrating the above scenario:
```
# create a new physical index
curl -X PUT "localhost:9200/rare-dev-resource-new-physical-index" -H 'Content-Type: application/json' -d'
{
  "settings": ...
}
'

# delete the `rare-dev-resource-harvest-index` alias, and recreate it so that it refers to `rare-dev-resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-dev-resource-physical-index", "alias" : "rare-dev-resource-harvest-index" } },
        { "add" : { "index" : "rare-dev-resource-new-physical-index", "alias" : "rare-dev-resource-harvest-index" } }
    ]
}
'

# once the harvest is finished, delete the `resource-index` alias, and recreate it so that it refers to `resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-dev-resource-physical-index", "alias" : "rare-dev-resource-index" } },
        { "add" : { "index" : "rare-dev-resource-new-physical-index", "alias" : "rare-dev-resource-index" } }
    ]
}
'

# delete the old physical index
curl -X DELETE "localhost:9200/rare-dev-resource-physical-index"
```
 
### Mapping migration

Another situation where you might need to reindex all the documents is when the mapping has changed and a new version
of the application must be redeployed. 

#### Upgrading with some downtime

This is the easiest and safest procedure, that I would recommend:

 - create a new physical index (let's name it `rare-dev-resource-new-physical-index`);
 - delete the `rare-dev-resource-harvest-index` and the `rare-dev-resource-index` aliases, and recreate them both so that they refer to 
   `rare-dev-resource-new-physical-index`;
 - stop the existing application, deploy and start the new one;
 - trigger a harvest;
 - once everything is running fine, remove the old physical index.
 
In case anything goes wrong, the two aliases can always be recreated to refer to the old physical index, and the old
application can be restarted.

Here are curl commands illustrating the above scenario:
```
# create a new physical index
curl -X PUT "localhost:9200/rare-dev-resource-new-physical-index" -H 'Content-Type: application/json' -d'
{
  "settings": ...
}
'

# delete the `rare-dev-resource-harvest-index` and the `rare-dev-resource-index` aliases, and recreate them both so that they refer to `rare-dev-resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-dev-resource-physical-index", "alias" : "resource-harvest-index" } },
        { "add" : { "index" : "rare-dev-resource-new-physical-index", "alias" : "resource-harvest-index" } },
        { "remove" : { "index" : "rare-dev-resource-physical-index", "alias" : "rare-dev-resource-index" } },
        { "add" : { "index" : "rare-dev-resource-new-physical-index", "alias" : "rare-dev-resource-index" } }
    ]
}
'

# once everything is running fine, remove the old physical index.
curl -X DELETE "localhost:9200/rare-dev-resource-physical-index"
```

#### Upgrading with a very short downtime (or no downtime at all)

 - create a new physical index (let's name it `resource-new-physical-index`);
 - delete the `rare-dev-resource-harvest-index` alias, and recreate it so that it refers to `rare-dev-resource-new-physical-index`;
 - start the new application, on another machine, or on a different port, so that the new application code can be
   used to trigger a harvest with the new schema, while the old application is still running and exposed to the users
 - trigger the harvest on the **new** application
 - once the harvest is finished, delete the `rare-dev-resource-index` alias, and recreate it so that it refers to 
   `rare-dev-resource-new-physical-index`;
 - expose the new application to the users instead of the old one
 - stop the old application
 
How you execute these various steps depend on the production infrastructure, which is unknown to me. You could
use your own development server to start the new application and do the harvest, and then stop the production application,
deploy the new one and start it. Or you could have a reverse proxy in front of the application, and change its 
configuration to route to the new application once the harvest is done, for example.

Here are curl commands illustrating the above scenario:
```
# create a new physical index
curl -X PUT "localhost:9200/rare-dev-resource-new-physical-index" -H 'Content-Type: application/json' -d'
{
  "settings": ...
}
'

# delete the `rare-dev-resource-harvest-index` alias, and recreate it so that it refers to `rare-dev-resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-dev-resource-physical-index", "alias" : "rare-dev-resource-harvest-index" } },
        { "add" : { "index" : "rare-dev-resource-new-physical-index", "alias" : "rare-dev-resource-harvest-index" } }
    ]
}
'

# once the harvest is finished, delete the `resource-index` alias, and recreate it so that it refers to `resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-dev-resource-physical-index", "alias" : "rare-dev-resource-index" } },
        { "add" : { "index" : "rare-dev-resource-new-physical-index", "alias" : "rare-dev-resource-index" } }
    ]
}
'
```
    
## Spring Cloud config

On bootstrap, the application will try to connect to a remote Spring Cloud config server
to fetch its configuration.
The details of this remote server are filled in the `bootstrap.yml` file.
By default, it tries to connect to the remote server on http://localhost:8888
but it can of course be changed, or even configured via the `SPRING_CONFIG_URI` environment variable.

It will try to fetch the configuration for the application name `rare`, and the default profile.
If such a configuration is not found, it will then fallback to the local `application.yml` properties.
To avoid running the Spring Cloud config server every time when developing the application,
all the properties are still available in `application.yml` even if they are configured on the remote Spring Cloud server as well.

If you want to use the Spring Cloud config app locally, 
see https://forgemia.inra.fr/urgi-is/data-discovery-config

The configuration is currently only read on startup,
meaning the application has to be reboot if the configuration is changed on the Spring Cloud server.
For a dynamic reload without restarting the application, 
see http://cloud.spring.io/spring-cloud-static/Finchley.SR1/single/spring-cloud.html#refresh-scope
to check what has to be changed.

In case of testing configuration from the config server, one may use a dedicated branch on `data-discovery-config` project 
and append the `--spring.cloud.config.label=<branch name to test>` parameter when starting the application's executable jar.
More info on how pass a parameter to a Spring Boot app: 
https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config

## Building other apps

By default, the built application is RARe. But this project actually allows building other
applications (WheatIS, for the moment, but more could come).

To build a different app, specify an `app` property when building. For example, to assemble
the WheatIS app, run the following command

    ./gradlew assemble -Papp=wheatis
    
You can also run the backend WheatIS application using

    ./gradlew bootRun -Papp=wheatis
    
Adding this property has the following consequences:

 - the generated jar file (in `backend/build/libs`) is named `wheatis.jar` instead of `rare.jar`;
 - the Spring active profile in `bootstrap.yml` is `wheatis-app` instead of `rare-app`;
 - the frontend application built and embedded inside the jar file is the WheatIS frontend application instead of the RARe frontend application, i.e. the frontend command `yarn build:wheatis` is executed instead of the command `yarn:rare`.
 
Since the active Spring profile is different, all the properties specific to this profile
are applies. In particular:
 
 - the context path of the application is `/wheatis-dev` instead of `/rare-dev`; 
 - the resource directory where the JSON files to harvest are looked up is different;
 - the Elasticsearch prefix used for the index aliases is different.

See the `backend/src/main/resources/application.yml` file for details.

### Example of adding a new application (GnpIS Portal)

This readme will be useful :
* If we want to create a new application.
* Or if anyone wanted to go back and edit what have been added/edited again.

> In this example we created a new application which is very similar to `WheatIS` (for the moment), so there weren't many changes in the backend (we kept using the `WheatIS` java classes). Check out the [frontend README](https://forgemia.inra.fr/urgi-is/data-discovery/blob/master/frontend/README.md#add-another-application) for more details.

#### Modifications

* Edited `./.gitlab-ci.yml` file in the root directory.

##### In `buildSrc` folder

* Added `gnpis` to the `acceptableValues` in `./buildSrc/src/main/kotlin/app.kt` file:

      private val acceptableValues = setOf("rare", "wheatis", "gnpis")

##### `backend` folder

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

##### `data` folder

* Create a folder called `gnpis` in `./data`, and put the compressed JSON files in it.

##### `frontend` folder

* Edited the `./frontend/coverage/index.html` file.

* Edited `./frontend/src/app/models/test-model-generators.ts` by adding an `import` and `toGnpisDocument` function.

* Created a `gnpis` module in `./frontend/src/app` with the following structure:

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

* Create and edit the environment files in `./frontend/src/environments`:
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

##### Scripts

* Add this line to `scripts/createIndexAndAliases.sh` file:

      # GnpIS index/alias
      sh $BASEDIR/createIndexAndAliases4CI.sh localhost gnpis dev

* Create `harvestGnpis.sh` with the following content:

      #!/bin/bash

      # delegates to parameterized script
      BASEDIR=$(dirname "$0")

      sh $BASEDIR/harvestCI.sh localhost 8070 gnpis dev

##### Testing

    ./gradlew test

In our case, after launching the test, we kept getting `Permission denied` errors, the problem was solved by deleting `buildSrc/build` and `backend/build` directory and running the test again.

##### Running the App

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

##### List of CAMD files

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

##### Example of the ports used according to the applications and the environment:

|         | RARE | WheatIS | GnpIS  |
|:-------:|:----:|:-------:|:------:|
| dev     | 8080 |   8090  |  8070  |
| beta    | 8081 |   8091  |  8071  |
| staging | 8082 |   8092  |  8072  |
| prod    | 8083 |   8093  |  8073  |