# Rare project - Data discovery

- [Rare project - Data discovery](#rare-project---data-discovery)
  - [Contribute](#contribute)
    - [Data](#data)
    - [Code](#code)
  - [Setup](#setup)
    - [Backend](#backend)
    - [Frontend](#frontend)
  - [Build](#build)
  - [CI](#ci)
  - [Documentation](#documentation)
  - [Harvest](#harvest)
  - [Indices and aliases](#indices-and-aliases)
  - [Spring Cloud config](#spring-cloud-config)
  - [Building other apps](#building-other-apps)
## Contribute

If you want to install the program locally, it's cool, just keep reading at [Setup section and beyond](#setup).

### Data

You might probably want to know how to contribute to the federation of data. That's great, let's have a look at the [WheatIS/Plant guide](./HOW-TO-JOIN-WHEATIS-AND-PLANT-FEDERATIONS.md) or the [RARe guide](./HOW-TO-JOIN-RARe-FEDERATION.md) to know how to.

### Code

If you do want to contribute to code, that's great also, have a look at [CONTRIBUTING.md](./CONTRIBUTING.MD).

## Setup

### Backend

The project uses Spring (5.x) for the backend, with Spring Boot.

You need to install:

- a recent enough JDK8

The application expects to connect on an Elasticsearch instance running on `http://127.0.0.1:9200`.
To have such an instance, simply run:

    docker-compose up

And this will start Elasticsearch and a Kibana instance (allowing to explore the data on http://localhost:5601).

Then at the root of the application, run `./gradlew build` to download the dependencies.
Then run `./gradlew bootRun` to start the app.

You can stop the Elasticsearch and Kibana instances by running:

    docker-compose stop

or run:

    docker-compose down 

to also remove the stopped containers as well as any networks that were created.

### Frontend

The project uses Angular (8.x) for the frontend, with the Angular CLI.

You need to install:

- a recent enough NodeJS, v10+ is required for Angular 8.
- Yarn as a package manager (see [here to install](https://yarnpkg.com/en/docs/install))

Then in the `frontend` directory, run `yarn` to download the dependencies.
Then run `yarn start` to start the app, using the proxy conf to reroute calls to `/api` to the backend.

The application will be available on:

- <http://localhost:4000/rare-dev> for RARe (runs with: `yarn start:rare` or simply `yarn start`)
- <http://localhost:4100/wheatis-dev> for WheatIS (runs with: `yarn start:wheatis`)
- <http://localhost:4200/data-discovery-dev> for DataDiscovery (runs with: `yarn start:data-discovery`)

See [./frontend/package.json (scripts section)](./frontend/package.json) for other yarn commands.

## Build

To build the app, just run:

    ./gradlew assemble

or

    ./gradlew assemble -Papp=wheatis


which is a shortcut for


   ./gradlew assemble -Papp=wheatis && java -jar path/to/wheatis.jar

This will build a standalone jar at `backend/build/libs/`, that you can run with either:

    java -jar backend/build/libs/rare.jar
    java -jar backend/build/libs/wheatis.jar
    java -jar backend/build/libs/data-discovery.jar

And the full app running on:

- <http://localhost:8080/rare-dev>
- <http://localhost:8180/wheatis-dev>
- <http://localhost:8280/data-discovery-dev>

## CI

The `.gitlab-ci.yml` file describes how Gitlab is running the CI jobs.

It uses a base docker image named `urgi/docker-browsers`
available on [DockerHub](https://hub.docker.com/r/urgi/docker-browsers/)
and [INRA-MIA Gitlab](https://forgemia.inra.fr/urgi-is/docker-rare).
The image is based on `openjdk:8` and adds all stuff needed to run the tests
(ie. a Chrome binary with a headless Chrome in `--no-sandbox` mode).

We install `node` and `yarn` in `/tmp` (this is not the case for local builds)
to avoid symbolic links issues on Docker.

You can approximate what runs on CI by executing:

    docker run --rm -v "$PWD":/home/rare -w /home/rare urgi/docker-browsers ./gradlew build

Or also run a gitlab-runner as Gitlab-CI would do (minus the environment variables and caching system):

    gitlab-runner exec docker test

## Documentation

An API documentation describing most of the webservices can be generated using the
build task `asciidoctor`, which executes tests and generates documentation based on snippets generated
by these tests. The documentation is generated in the folder `backend/build/asciidoc/html5/index.html`

    ./gradlew asciidoctor

## Harvest

Harvesting (i.e. importing JSON documents into Elasticsearch) consists in creating the necessary index and aliases and Elasticsearch templates.

To create the index and its aliases execute the script below for local dev environment:

    ./scripts/index.sh -app rare|wheat|data-discovery --local

The -app parameter will trigger a harvest of the resources stored in the Git LFS directories `data/rare`, `data/wheatis` and `data/data-discovery` respectively.

## Indices and aliases

The application uses several physical indices:

- one to store physical resources, containing the main content
- one to store suggestions, use for the search type-ahead feature only

Both indices must be created explicitly before using the application. If not, requests to the web services will return errors.

Each index and alias below refers to `rare` application in `dev` environment, the equivalent shall be created for `wheatis` and `data-discovery` app in `dev` environment as same as in `beta` or `staging` or `prod` environments. For brevity, only `rare-dev` is explained here.
{: .alert .alert-info}

The application doesn't use the physical resources index directly. Instead, it uses two aliases, that must be created before using the application:

- `rare-dev-resource-alias` is the alias used by the application to store and search for documents
- `rare-dev-suggestions-alias` is the alias used by the application to store and search for suggestions, only used for completion service.

In normal operations, these two aliases should refer to physical indices having a timestamp such as `rare-dev-tmstp1579877133-suggestions` and `rare-dev-tmstp1579877133-resource-index`. Those timestamps allow for reindexing data without breaking another runnning application having another timestamp. The alias switch being done atomicly, we always see data in the web interface.

Using two aliases is useful when deleting obsolete documents. This is actually done by removing everything and then harvesting the new JSON files again, to re-populate the index from scratch.

## Spring Cloud config

On bootstrap, the application will try to connect to a remote Spring Cloud config server to fetch its configuration. The details of this remote server are filled in the `bootstrap.yml` file. By default, it tries to connect to the local server on <http://localhost:8888> but it can of course be changed, or even configured via the `SPRING_CONFIG_URI` environment variable.

It will try to fetch the configuration for the application name `rare`, and the default profile.
If such a configuration is not found, it will then fallback to the local `application.yml` properties.

To avoid running the Spring Cloud config server every time when developing the application,
all the properties are still available in `application.yml` even if they are configured on the remote Spring Cloud server as well.

If you want to use the Spring Cloud config app locally, see <https://forgemia.inra.fr/urgi-is/data-discovery-config>

The configuration is currently only read on startup, meaning the application has to be reboot if the configuration is changed on the Spring Cloud server. For a dynamic reload without restarting the application, see <http://cloud.spring.io/spring-cloud-static/Finchley.SR1/single/spring-cloud.html#refresh-scope>
to check what has to be changed.

In case of testing configuration from the config server, one may use a dedicated branch on `data-discovery-config` project and append the `--spring.cloud.config.label=<branch name to test>` parameter when starting the application's executable jar. More info on [how to pass a parameter to a Spring Boot app](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config).

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
- the frontend application built and embedded inside the jar file is the WheatIS frontend application instead of the  RARe frontend application, i.e. the frontend command `yarn build:wheatis` is executed instead of the command `yarn:rare`.

Since the active Spring profile is different, all the properties specific to this profile
are applies. In particular:

- the context path of the application is `/wheatis-dev` instead of `/rare-dev`;
- the Elasticsearch prefix used for the index aliases is different.

See the `backend/src/main/resources/application.yml` file for details.

You can adapt the elasticsearch index used with the following parameter

    java -jar backend/build/libs/data-discovery.jar --data-discovery.elasticsearch-prefix="data-discovery-staging-"
