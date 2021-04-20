FROM alpine
LABEL Author="Raphaël FLORES <raphael.flores@inrae.fr>"

COPY scripts/createSuggestions.sh scripts/index.sh scripts/createIndexAndAliases4CI.sh scripts/harvestCI.sh scripts/to_bulk.jq /opt/scripts/
COPY scripts/filters/* /opt/scripts/filters/

# COPY dao settings
COPY backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/rare/settings.json /opt/backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/rare/settings.json
COPY backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/wheatis/settings.json /opt/backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/wheatis/settings.json
COPY backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/data-discovery/settings.json /opt/backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/data-discovery/settings.json

# COPY dao mappings
COPY /backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/rare/RareGeneticResource.mapping.json /opt/backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/rare/RareGeneticResource.mapping.json
COPY /backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/wheatis/WheatisGeneticResource.mapping.json /opt/backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/wheatis/WheatisGeneticResource.mapping.json
COPY /backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/data-discovery/WheatisGeneticResource.mapping.json /opt/backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/data-discovery/WheatisGeneticResource.mapping.json

# COPY suggestions settings
COPY backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/suggestions.mapping.json /opt/backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/suggestions.mapping.json
COPY backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/settings-suggestions.json /opt/backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/settings-suggestions.json

RUN apk add --update --no-cache bash curl jq parallel wget grep gzip sed date coreutils

RUN chmod +x /opt/scripts/index.sh
RUN mkdir ~/.parallel && touch ~/.parallel/will-cite

ENTRYPOINT ["/opt/scripts/index.sh"]