ARG ELASTIC_VERSION=7.17.29
FROM docker.elastic.co/elasticsearch/elasticsearch:$ELASTIC_VERSION

COPY . /usr/share/elasticsearch/config/analysis/synonyms/

RUN apt-get update && apt-get dist-upgrade -y