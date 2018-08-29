#!/bin/bash

BASEDIR=$(dirname "$0")
DATADIR="$BASEDIR/../data/rare"
app_host=$1

mkdir -p /tmp/rare/resources
cp $DATADIR/*.json.gz /tmp/rare/resources

gzip -d -f /tmp/rare/resources/*.json.gz

curl -i -X POST -u rare:f01a7031fc17 http://${app_host}:8080/rare/api/harvests
