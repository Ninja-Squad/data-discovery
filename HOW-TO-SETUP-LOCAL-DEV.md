# How to set up Docker

Objective: Set up local environment for faidare cards and search

In data-discovery:
`git lfs pull -I data/faidare/`
`docker compose up`
Load search metadata:
`./scripts/index.sh -host localhost -app faidare -env dev -data data/faidare`

In faidare git repository
`./scripts/harvest.sh -jsonDir data/test/ -es_host localhost -env dev -v`

# Run applications
Default parameters are already set for local instances
## faidare (cards & exporter & BrAPI)
./gradlew assemble -Papp=faidare
java -jar backend/build/libs/faidare.jar
## data-discovery (faidare-search
./gradlew assemble -Papp=faidare)
java -jar backend/build/libs/faidare.jar

## web interface
http://localhost:8280/faidare-dev

To debug: gradlew to generate the jar, then run the jar in your IDE (IntelliJ, VisualStudio, etc...) in debug mode.