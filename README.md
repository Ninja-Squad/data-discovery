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

The application will be available on http://localhost:4200/rare

## Build

To build the app, just run:

    ./gradlew assemble

This will build a standalone jar at `backend/build/libs/rare.jar`, that you can run with:

    java -jar backend/build/libs/rare.jar

And the full app runs on http://localhost:8080/rare


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
creating the necessary index and aliases, and then placing the JSON files into a directory where the server can find them.

To create the index and its aliases execute the script 

    ./scripts/createIndexAndAliases.sh

The directory, by default is `/tmp/rare/resources`. But it's externalized into the Spring Boot property
`rare.resource-dir`, so it can be easily changed by modifying the value of this property (using an 
environment variable for example).

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

The application doesn't use the physical resources index directly. Instead, it uses two aliases, that must be created 
before using the application:

 * `rare-resource-index` is the alias used by the application to search for genetic resources
 * `rare-resource-harvest-index` is the alias used by the application to store genetic resources when the harvest is triggered.
 
In normal operations, these two aliases should refer to the same physical resource index. The script
`createIndexAndAliases.sh` creates a physical index (named `rare-resource-physical-index`) and creates these two aliases 
referring to this physical index.

Once the index and the aliases have been created, a harvest can be triggered. The first operation that a harvest
does is to create or update (put) the mapping for the genetic resource entity into the index aliased by `rare-resource-harvest-index`. 
Then it parses the JSON files and stores them into this same index. Since the `rare-resource-index` alias 
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
curl -X DELETE "localhost:9200/rare-resource-physical-index"

# recreate the physical index and its aliases
curl -X PUT "localhost:9200/rare-resource-physical-index" -H 'Content-Type: application/json' -d'
{
    "aliases" : {
        "rare-resource-index" : {},
        "rare-resource-harvest-index" : {}
    }
    "settings": ...
}
'
```

**NOTE**: Every time a physical index is created, the settings must be specified, the same ay as in the 
`createIndexAndAliases.sh` script. The exact content of the settings is omitted here for brevity and readability.

#### Deleting with no downtime

If you don't want any downtime, you can instead use the following procedure:

 - create a new physical index (let's name it `rare-resource-new-physical-index`);
 - delete the `rare-resource-harvest-index` alias, and recreate it so that it refers to `rare-resource-new-physical-index`;
 - trigger a harvest. During the harvest, the `rare-resource-index` alias, used by the search,
   still refers to the old physical index, and it thus still works flawlessly;
 - once the harvest is finished, delete the `rare-resource-index` alias, and recreate it so that it refers to 
   `rare-resource-new-physical-index`. All the search operations will now use the new index, containing up-to-date
   documents;
 - delete the old physical index.
 
Here are curl commands illustrating the above scenario:
```
# create a new physical index
curl -X PUT "localhost:9200/rare-resource-new-physical-index" -H 'Content-Type: application/json' -d'
{
  "settings": ...
}
'

# delete the `rare-resource-harvest-index` alias, and recreate it so that it refers to `rare-resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-resource-physical-index", "alias" : "rare-resource-harvest-index" } },
        { "add" : { "index" : "rare-resource-new-physical-index", "alias" : "rare-resource-harvest-index" } }
    ]
}
'

# once the harvest is finished, delete the `resource-index` alias, and recreate it so that it refers to `resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-resource-physical-index", "alias" : "rare-resource-index" } },
        { "add" : { "index" : "rare-resource-new-physical-index", "alias" : "rare-resource-index" } }
    ]
}
'

# delete the old physical index
curl -X DELETE "localhost:9200/rare-resource-physical-index"
```
 
### Mapping migration

Another situation where you might need to reindex all the documents is when the mapping has changed and a new version
of the application must be redeployed. 

#### Upgrading with some downtime

This is the easiest and safest procedure, that I would recommend:

 - create a new physical index (let's name it `rare-resource-new-physical-index`);
 - delete the `rare-resource-harvest-index` and the `rare-resource-index` aliases, and recreate them both so that they refer to 
   `rare-resource-new-physical-index`;
 - stop the existing application, deploy and start the new one;
 - trigger a harvest;
 - once everything is running fine, remove the old physical index.
 
In case anything goes wrong, the two aliases can always be recreated to refer to the old physical index, and the old
application can be restarted.

Here are curl commands illustrating the above scenario:
```
# create a new physical index
curl -X PUT "localhost:9200/rare-resource-new-physical-index" -H 'Content-Type: application/json' -d'
{
  "settings": ...
}
'

# delete the `rare-resource-harvest-index` and the `rare-resource-index` aliases, and recreate them both so that they refer to `rare-resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-resource-physical-index", "alias" : "resource-harvest-index" } },
        { "add" : { "index" : "rare-resource-new-physical-index", "alias" : "resource-harvest-index" } },
        { "remove" : { "index" : "rare-resource-physical-index", "alias" : "rare-resource-index" } },
        { "add" : { "index" : "rare-resource-new-physical-index", "alias" : "rare-resource-index" } }
    ]
}
'

# once everything is running fine, remove the old physical index.
curl -X DELETE "localhost:9200/rare-resource-physical-index"
```

#### Upgrading with a very short downtime (or no downtime at all)

 - create a new physical index (let's name it `resource-new-physical-index`);
 - delete the `rare-resource-harvest-index` alias, and recreate it so that it refers to `rare-resource-new-physical-index`;
 - start the new application, on another machine, or on a different port, so that the new application code can be
   used to trigger a harvest with the new schema, while the old application is still running and exposed to the users
 - trigger the harvest on the **new** application
 - once the harvest is finished, delete the `rare-resource-index` alias, and recreate it so that it refers to 
   `rare-resource-new-physical-index`;
 - expose the new application to the users instead of the old one
 - stop the old application
 
How you execute these various steps depend on the production infrastructure, which is unknown to me. You could
use your own development server to start the new application and do the harvest, and then stop the production application,
deploy the new one and start it. Or you could have a reverse proxy in front of the application, and change its 
configuration to route to the new application once the harvest is done, for example.

Here are curl commands illustrating the above scenario:
```
# create a new physical index
curl -X PUT "localhost:9200/rare-resource-new-physical-index" -H 'Content-Type: application/json' -d'
{
  "settings": ...
}
'

# delete the `rare-resource-harvest-index` alias, and recreate it so that it refers to `rare-resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-resource-physical-index", "alias" : "rare-resource-harvest-index" } },
        { "add" : { "index" : "rare-resource-new-physical-index", "alias" : "rare-resource-harvest-index" } }
    ]
}
'

# once the harvest is finished, delete the `resource-index` alias, and recreate it so that it refers to `resource-new-physical-index`
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d'
{
    "actions" : [
        { "remove" : { "index" : "rare-resource-physical-index", "alias" : "rare-resource-index" } },
        { "add" : { "index" : "rare-resource-new-physical-index", "alias" : "rare-resource-index" } }
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
 
 - the context path of the application is `/wheatis` instead of `/rare`; 
 - the resource directory where the JSON files to harvest are looked up is different;
 - the Elasticsearch prefix used for the index aliases is different.

See the `application.yml` file for details.
