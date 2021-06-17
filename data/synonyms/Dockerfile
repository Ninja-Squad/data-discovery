ARG ELASTIC_VERSION=7.13.2
FROM docker.elastic.co/elasticsearch/elasticsearch:$ELASTIC_VERSION

COPY . /usr/share/elasticsearch/config/analysis/synonyms/

RUN yum update -y