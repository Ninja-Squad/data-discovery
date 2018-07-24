# Rare project - Data discovery

## Setup

### Backend

The project uses Spring (5.x) for the backend,
with Spring Boot.

You need to install:

- a recent enough JDK8

The application expects to connect on an ElasticSearch instance running on `http://127.0.0.1:9300`,
in a cluster named `es-rare`.
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

## Harvest

Harvesting (i.e. importing genetic resources stored in JSON files into ElasticSearch) consists in
placing the JSON files into a directory where the server can find them.

This directory, by default is `/tmp/rare/resources`. But it's externalized into the Spring Boot property
`rare.resource-dir`, so it can be easily changed by modifying the value of this property (using an 
environment variable for example).

The files must have the extension `.json`, and must be stored in that directory (not in a sub-directory).
Once the files are ready and the server is started, the harvest is triggered by sending a POST request
to the endpoint `/api/harvests`, without any request body.
This endpoint, as well as the actuator endpoints, is only accessible to an authenticated user. The user (`rare`) and its password (`f01a7031fc17`) are configured in the application.yml file (and can thus be overridden using environment variables for example).

Example with the `http` command ([HTTPie](https://httpie.org/)):

    http --auth rare:f01a7031fc17 POST http://localhost:8080/api/harvests
    
Example with the `curl` command:

    curl -i -X POST -u rare:f01a7031fc17 http://localhost:8080/api/harvests
    
The harvest job is executed asynchronously, and a response is immediately sent back, with the URL allowing
to get the result of the job. For example:

    HTTP/1.1 201 
    Content-Length: 0
    Date: Tue, 24 Jul 2018 12:58:04 GMT
    Location: http://localhost:8080/api/harvests/abb5784d-3006-48fb-b5db-d3ff9583e8b9
    
To get the result of the job, you can then send a GET request to the returned URL:

    http --auth rare:f01a7031fc17 GET http://localhost:8080/api/harvests/abb5784d-3006-48fb-b5db-d3ff9583e8b9

or

    curl -u rare:f01a7031fc17 http://localhost:8080/api/harvests/abb5784d-3006-48fb-b5db-d3ff9583e8b9
    
`http` has the advantage of nicely formetting the returned JSON.

The response contains a detailed report containing the start instant, and the list of files
that have been processed, with the number of successfully imported resources, and the errors
that occurred, if any.

It's only when the property `endInstant` of the returned JSON is non-null that the job is complete.
```
{
    "endInstant": "2018-07-24T12:56:28.077Z",
    "files": [
        {
            "errorCount": 0,
            "errors": [],
            "fileName": "rare_pilier_microbial.json",
            "successCount": 10
        },
        {
            "errorCount": 2,
            "errors": [
                {
                    "column": 4,
                    "error": "Error while parsing object: com.fasterxml.jackson.databind.exc.MismatchedInputException: Cannot deserialize instance of `java.lang.String` out of START_ARRAY token\n at [Source: UNKNOWN; line: -1, column: -1] (through reference chain: fr.inra.urgi.rare.domain.GeneticResource[\"name\"])",
                    "index": 4790,
                    "line": 105594
                },
                {
                    "column": 4,
                    "error": "Error while parsing object: com.fasterxml.jackson.databind.exc.MismatchedInputException: Cannot deserialize instance of `java.lang.String` out of START_ARRAY token\n at [Source: UNKNOWN; line: -1, column: -1] (through reference chain: fr.inra.urgi.rare.domain.GeneticResource[\"countryOfCollect\"])",
                    "index": 5905,
                    "line": 130127
                }
            ],
            "fileName": "rare_pilier_plant.json",
            "successCount": 14522
        }
    ],
    "globalErrors": [],
    "id": "55e70557-79e8-4e40-a44b-2ef4b3df076a",
    "startInstant": "2018-07-24T12:56:27.322Z"
}
```
