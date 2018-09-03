#!/bin/bash
# set -x
BASEDIR=$(dirname "$0")
APP_HOST=$1
APP_PORT=$2
APP_NAME=$3
ENV=$4

EXP_PARAMS=4
[ ! $# -eq $EXP_PARAMS ] && {
    echo "ERROR: missing $((EXP_PARAMS-$#)) parameter(s). Expected "\
	"$EXP_PARAMS params: 1:APP_HOST ; 2:APP_PORT ; 3:APP_NAME ; 4:ENV"
    exit 4
}

DATADIR="$BASEDIR/../data/$APP_NAME"
INDEX_DATA_DIR="/tmp/$APP_NAME-$ENV/resources"

echo "Creating directory: $INDEX_DATA_DIR" && mkdir -p $INDEX_DATA_DIR
{
	cp $DATADIR/*.json.gz $INDEX_DATA_DIR && \
	gzip -d -f $INDEX_DATA_DIR/*.json.gz && \
	curl -f -i -X POST -u rare:f01a7031fc17 \
	"http://${APP_HOST}:${APP_PORT}/${APP_NAME}-${ENV}/api/harvests"
} || {
	code=$?
	echo -e "A problem occured (code=$code) when trying to index data from\n\t"\
		"$INDEX_DATA_DIR \n on app:\n\t"\
		"http://${APP_HOST}:${APP_PORT}/${APP_NAME}-${ENV}"
	exit $code
}
