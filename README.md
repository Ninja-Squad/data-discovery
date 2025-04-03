# Rare project - Data discovery

[[_TOC_]]

## Contribute

If you want to install the program locally, it's cool, just keep reading at [Setup section and beyond](#setup).

### Data

You might probably want to know how to contribute to the federation of data. That's great, let's have a look at the [WheatIS/Plant guide](./HOW-TO-JOIN-WHEATIS-AND-PLANT-FEDERATIONS.md) or the [RARe guide](./HOW-TO-JOIN-RARe-FEDERATION.md) to know how to.

### Code

If you do want to contribute to code, that's great also, have a look at [CONTRIBUTING.md](./CONTRIBUTING.MD).

## Setup

### Requirements

The application itself is running under a Java OpenJDK 17+: <https://openjdk.java.net/install/>

For getting the data, you need to install Git LFS: <https://git-lfs.github.com/>

The indexing process depends on the following tools, you need to have them installed and available in your `PATH` variable:

- JQ 1.6+: <https://stedolan.github.io/jq/>
- GNU Parallel (recent enough version): <https://www.gnu.org/software/parallel/>
- GNU coreutils (sed, date...): <https://www.gnu.org/software/coreutils/>
- GNU GZIP: <https://git.savannah.gnu.org/cgit/gzip.git>
- GNU Bash v4+: <https://www.gnu.org/software/bash/>


### Data handling

At the moment, all data is located next to the code in the `data` directory. If you want to have a look at the code only, you can ignore this directory at git clone step by setting the variable `GIT_LFS_SKIP_SMUDGE=1`, ie.:

```sh
GIT_LFS_SKIP_SMUDGE=1 git clone git@forgemia.inra.fr:urgi-is/data-discovery.git
```

After clone done, if you want to fetch some of the data (for instance for RARe only), let's run:

```sh
$ git lfs pull -I data/rare/
Downloading LFS objects: 100% (16/16), 8.8 MB | 0 B/s
```

Git might request you to enable additional parameters, which is acceptable:

```sh
git config lfs.https://forgemia.inra.fr/urgi-is/data-discovery.git/info/lfs.locksverify true
```

### Backend

The project uses Spring Boot for the backend.

You need to install:

- a recent enough JDK17

The docker images need quite a bit of resources,
so make sure you have at least 4g of RAM configured (Docker Desktop / Resources / Memory).

The application expects to connect on an Elasticsearch instance running on `http://127.0.0.1:9200`.
To have such an instance, simply run:

```sh
docker compose up
```

And this will start Elasticsearch and a Kibana instance (allowing to explore the data on <http://localhost:5601>).

Then at the root of the application, run `./gradlew build` to download the dependencies.
Then run `./gradlew bootRun` to start the app.

You can stop the Elasticsearch and Kibana instances by running:

```sh
docker compose stop
```

or run the following command to also remove the stopped containers as well as any networks that were created:

```sh
docker compose down
```

### Frontend

The project uses Angular for the frontend, with the Angular CLI.

You need to install:

- a recent enough NodeJS (ie. v18 LTS) is required for Angular.
- Pnpm as a package manager (see [here to install](https://pnpm.io/installation))

Then in the `frontend` directory, run `pnpm` to download the dependencies.
Then run `pnpm start` to start the app, using the proxy conf to reroute calls to `/api` to the backend.

The application will be available on:

- <http://localhost:4000/rare-dev> for RARe (runs with: `pnpm start:rare` or simply `pnpm start`)
- <http://localhost:4000/brc4env-dev> for RARe with basket (runs with: `pnpm start:brc4env`)
- <http://localhost:4100/wheatis-dev> for WheatIS (runs with: `pnpm start:wheatis`)
- <http://localhost:4200/faidare-dev> for Faidare (runs with: `pnpm start:faidare`)

See [./frontend/package.json (scripts section)](./frontend/package.json) for other pnpm commands.

## Build

To build the app, just run:

```sh
./gradlew assemble
```

or

```sh
./gradlew assemble -Papp=wheatis
```

or

```sh
./gradlew assemble -Papp=brc4env
```

This will build a standalone jar at `backend/build/libs/`, that you can run with either:

```sh
java -jar backend/build/libs/rare.jar
java -jar backend/build/libs/brc4env.jar
java -jar backend/build/libs/wheatis.jar
java -jar backend/build/libs/faidare.jar
```

And the full app running on:

- <http://localhost:8080/rare-dev>
- <http://localhost:8180/wheatis-dev>
- <http://localhost:8280/faidare-dev>
- <http://localhost:8580/brc4env-dev>

## CI

The `.gitlab-ci.yml` file describes how Gitlab is running the CI jobs.

It uses a base docker image named `urgi/docker-browsers`
available on [DockerHub](https://hub.docker.com/r/urgi/docker-browsers/)
and [INRA-MIA Gitlab](https://forgemia.inra.fr/urgi-is/docker-rare).
The image is based on `openjdk:8` and adds all stuff needed to run the tests
(ie. a Chrome binary with a headless Chrome in `--no-sandbox` mode).

We install `node` and `pnpm` in `/tmp` (this is not the case for local builds)
to avoid symbolic links issues on Docker.

You can approximate what runs on CI by executing:

```sh
docker run --rm -v "$PWD":/home/rare -w /home/rare urgi/docker-browsers ./gradlew build
```

Or also run a gitlab-runner as Gitlab-CI would do (minus the environment variables and caching system):

```sh
gitlab-runner exec docker test
```

## Documentation

An API documentation describing most of the webservices can be generated using the
build task `asciidoctor`, which executes tests and generates documentation based on snippets generated
by these tests. The documentation is generated in the folder `backend/build/docs/asciidoc/index.html`

```sh
./gradlew asciidoctor
```

## Harvest

Before all, if you have cloned the repository without fetching the data (see [Data handling](#data-handling) section), take care to get it before running any indexing script.

### TL;DR

You can use the `./scripts/index.sh` file as described in the section "UNIX/BSD or macOS". Or, if you're adventurous with Docker 
you can try the following.

Data (from master branch) indexing to your local Elasticsearch is done using the following command. Note that your local Elasticsearch instance should be already runing using `docker-compose up`:

```sh
docker run -t --volume $(pwd)/data:/opt/data/ --volume /tmp/bulk:/tmp/bulk/ --network=container:elasticsearch registry.forgemia.inra.fr/urgi-is/docker-rare/data-discovery-loader:latest --help
```

Example for indexing RARe data:

```sh
docker run -t --volume $(pwd)/data:/opt/data/ --volume /tmp/bulk:/tmp/bulk/ --network=container:elasticsearch registry.forgemia.inra.fr/urgi-is/docker-rare/data-discovery-loader:latest -host elasticsearch -app rare -env dev
```

If you need to spread the load on several CPUs, duplicate the value of `host` argument to simulate several Elasticsearch nodes, ie. below to use 4 CPUs:

```sh
docker run -t --volume $(pwd)/data:/opt/data/ --volume /tmp/bulk:/tmp/bulk/ --network=container:elasticsearch registry.forgemia.inra.fr/urgi-is/docker-rare/data-discovery-loader:latest -host "elasticsearch elasticsearch elasticsearch elasticsearch" -app rare -env dev
```

Take care to use your branch's `CI_COMMIT_REF_SLUG` instead of `latest` docker tag if you have modified the indexing scripts, Elasticsearch mappings or settings, see <https://docs.gitlab.com/ee/ci/variables/predefined_variables.html>. Example for branch `story/faidare-fusion`, use docker tag `story-faidare-fusion`:

```sh
docker run -t --volume $(pwd)/data:/opt/data/ --volume /tmp/bulk:/tmp/bulk/ --network=container:elasticsearch registry.forgemia.inra.fr/urgi-is/docker-rare/data-discovery-loader:story-faidare-fusion -host "elasticsearch elasticsearch elasticsearch elasticsearch" -app rare -env dev
```

If you need to test the docker loader with your local changes, look at job named `build-loader-docker-image` in the `.gitlab-ci.yml` at the root of the project to see how to build the image with your custom docker tag.

Output logs should be available in directory `/tmp/bulk/rare-dev`.

### Portability

#### Docker

[TL;DR](#TLDR) section above expects to have an available docker image on the forgemia docker registry. You can update or push such an image using the following:

```sh
# build the image
docker build -t registry.forgemia.inra.fr/urgi-is/docker-rare/data-discovery-loader:latest .

# Login before pushing the image
docker login registry.forgemia.inra.fr/urgi-is/docker-rare -u <your ForgeMIA username>

# push the built image
docker push registry.forgemia.inra.fr/urgi-is/docker-rare/data-discovery-loader:latest
```

That should ease the indexing of data without having to craft a dedicated environment, which is explained below.

#### UNIX/BSD or macOS

Feedback related to portability on MacOS and other GNU/Linux distro is really welcomed.

For macOS, care to use latest GNU Parallel and Bash v4 versions, not the version provided by default via Brew.
Don't use zsh!

Install the following packages to be able to run the scripts:

```sh
brew install gnu-sed coreutils parallel
```

Harvesting (i.e. importing JSON documents into Elasticsearch) consists in creating the necessary index and aliases and Elasticsearch templates.

To create the index and its aliases execute the script below for local dev environment:

```sh
./scripts/index.sh -app rare|brc4env|wheatis|data-discovery|faidare --local -data data/[rare|brc4env|wheatis|data-discovery|faidaire]
```

The `-app` parameter will trigger a harvest of the resources stored in the Git LFS subdirectories `data/rare` and `data/faidare` filtered or not (`wheatis` and `brc4env` rely on `faidare` and `rare` data respectively).

## Indices and aliases

The application uses several physical indices:

- one to store physical resources, containing the main content
- one to store suggestions, used for the search type-ahead feature only

Both indices must be created explicitly before using the application. If not, requests to the web services will return errors.

Each index and alias below refers to `rare` application in `dev` environment, the equivalent shall be created for `wheatis` and `data-discovery` app in `dev` environment as same as in `beta` or `staging` or `prod` environments. For brevity, only `rare-dev` is explained here.
{: .alert .alert-info}

The application doesn't use the physical resources index directly. Instead, it uses two aliases, that must be created before using the application:

- `rare-dev-resource-alias` is the alias used by the application to store and search for documents
- `rare-dev-suggestions-alias` is the alias used by the application to store and search for suggestions, only used for completion service.

In normal operations, these two aliases should refer to physical indices having a timestamp such as `rare-dev-tmstp1579877133-suggestions` and `rare-dev-tmstp1579877133-resource-index`. Those timestamps allow for reindexing data without breaking another runnning application having another timestamp. The alias switch being done atomicly, we always see data in the web interface.

Using two aliases is useful when deleting obsolete documents. This is actually done by removing everything and then harvesting the new JSON files again, to re-populate the index from scratch.

## Spring Cloud config

On bootstrap, the application will try to connect to a remote Spring Cloud config server to fetch its configuration. The details of this remote server are filled in the `application.yml` file. By default, it tries to connect to the local server on <http://localhost:8888> but it can of course be changed, or even configured via the `SPRING_CONFIG_URI` environment variable.

It will try to fetch the configuration for the application name specified in the profile-specific `spring.cloud.config.name` property.
If such a configuration is not found, it will then fallback to the local `application.yml` properties.

To avoid running the Spring Cloud config server every time when developing the application,
all the properties are still available in `application.yml` even if they are configured on the remote Spring Cloud server as well.

If you want to use the Spring Cloud config app locally, see <https://forgemia.inra.fr/urgi-is/data-discovery-config>

The configuration is currently only read on startup, meaning the application has to be reboot if the configuration is changed on the Spring Cloud server. For a dynamic reload without restarting the application, see <http://cloud.spring.io/spring-cloud-static/Finchley.SR1/single/spring-cloud.html#refresh-scope>
to check what has to be changed.

In case of testing configuration from the config server, one may use a dedicated branch on `data-discovery-config` project and append the `--spring.cloud.config.label=<branch name to test>` parameter when starting the application's executable jar, or use the corresponding Spring [env variable](https://docs.spring.io/spring-boot/docs/current/reference/html/spring-boot-features.html#boot-features-external-config-relaxed-binding-from-environment-variables) (_ie._ `SPRING_CLOUD_CONFIG_LABEL`). More info on [how to pass a parameter to a Spring Boot app](https://docs.spring.io/spring-boot/docs/current/reference/html/boot-features-external-config.html#boot-features-external-config).

## Building other apps

By default, the built application is RARe (without basket, i.e. without the possibility to add accessions to a basket and create an accession order on the rare-basket application). But this project actually allows building other applications (RARe with basket and WheatIS, for the moment, but more could come).

To build a different app, specify an `app` property when building. For example, to assemble
the WheatIS app, run the following command

```sh
./gradlew assemble -Papp=wheatis
```

You can also run the backend WheatIS application using

```sh
./gradlew bootRun -Papp=wheatis
```

To assemble the RARe app with support for adding accessions to a basket, run the following command

```sh
./gradlew assemble -Papp=brc4env
```

You can also run the backend RARe application with basket support using

```sh
./gradlew bootRun -Papp=brc4env
```

Adding this property has the following consequences:

- the generated jar file (in `backend/build/libs`) is named `wheatis.jar` (resp. `brc4env.jar` instead of `rare.jar`;
- the Spring active profile is `wheatis-app` (resp. `brc4env-app`) instead of `rare-app`;
- the frontend application built and embedded inside the jar file is the WheatIS frontend application (resp. the RARe application with basket support) instead of the RARe frontend application, i.e. the frontend command `pnpm build:wheatis` (resp. `pnpm build:brc4env`) is executed instead of the command `pnpm:rare`.

Since the active Spring profile is different, all the properties specific to this profile
are applied. In particular:

- the context path of the application is `/wheatis-dev` instead of `/rare-dev`;
- the Elasticsearch prefix used for the index aliases is different.

See the `backend/src/main/resources/application.yml` file for details.

You can adapt the elasticsearch index used with the following parameter

```sh
java -jar backend/build/libs/faidare.jar --data-discovery.elasticsearch-prefix="faidare-staging-"
```

For debuging:

```sh
java -jar backend/build/libs/faidare.jar --debug
```

## Configuration

The RARe and RARe with basket applications can be configured to apply an implicit filtering on the searches,
aggregations, and pillar list. There is currently only one implicit filter that can be added, which is a filter on the pillar name.

To activate it, add the following YAML configuration under the appropriate profile:

```yaml
rare:
  implicit-terms:
    PILLAR:
      - Pilier Forêt
      - Pilier Micro-organisme
```
