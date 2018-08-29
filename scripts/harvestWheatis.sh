#!/bin/bash

BASEDIR=$(dirname "$0")
DATADIR="$BASEDIR/../data/wheatis"
app_host=$1

mkdir -p /tmp/wheatis/resources
cp $DATADIR/*.json.gz /tmp/wheatis/resources

gzip -d -f /tmp/wheatis/resources/*.json.gz

curl -i -X POST -u rare:f01a7031fc17 http://${app_host}:8080/wheatis/api/harvests
