# Rare project - Data discovery

## Setup

### Backend

The project uses Spring (5.x) for the backend,
with Spring Boot.

You need to install:

- a recent enough JDK8

Then at the root of the application, run `./gradlew build` to download the dependencies.
Then run `./gradlew bootRun` to start the app.

### Frontend

The project uses Angular (6.x) for the frontend,
with the Angular CLI.

You need to install:

- a recent enough NodeJS (8.11+)
- Yarn as a package manager (see [here to install](https://yarnpkg.com/en/docs/install))

Then in the `frontend` directory, run `yarn` to download the dependencies.
Then run `yarn start` to start the app, using the proxy conf to reroute calls to `/api` to the backend.

The application will be available on http://localhost:4200

## Build

To build the app, just run:

    ./gradlew assemble

This will build a standalone jar at `backend/build/libs/rare.jar`, that you can run with:

    java -jar backend/build/libs/rare.jar

And the full app runs on http://localhost:8080


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
