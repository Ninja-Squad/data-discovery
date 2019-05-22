#!/bin/bash
# set -x

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to index data in Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -url <app url> -app <application name> -env <environment name> -copy [-h|--help]

PARAMS:
	-url           the application url (ex: http://HOST:PORT/CONTEXT_PATH)
	-app           the name of the targeted application: rare, wheatis or data-discovery
	-env           the environment name of the targeted application (dev, beta, prod ...)
	-copy          to set if the data files needs to be copied on the application host
	-h or --help   print this help

EOF
	exit 1
}

BASEDIR=$(dirname "$0")
APP_URL=""
APP_NAME=""
APP_ENV=""
COPY_FILES=0

# any params
[ -z "$1" ] && echo && help

# get params
while [ -n "$1" ]; do
	case $1 in
		-h) help;shift 1;;
		--help) help;shift 1;;
		-url) APP_URL=$2;shift 2;;
		-app) APP_NAME=$2;shift 2;;
		-env) APP_ENV=$2;shift 2;;
		-copy) COPY_FILES=1;shift 1;;
		--) shift;break;;
		-*) echo "Unknown option: $1" && echo && help && echo;exit 1;;
		*) break;;
	esac
done

if [ -z "$APP_URL" ] || [ -z "$APP_NAME" ] || [ -z "$APP_ENV" ]; then
    echo "ERROR: url, app and env parameters are mandatory!"
    echo && help
	exit 4
fi

INDEX_DATA_DIR="/tmp/$APP_NAME-$APP_ENV/resources"
if [ $COPY_FILES -eq 0 ]; then
	echo "WARN: Harvester will index JSON already present in $INDEX_DATA_DIR on the application server..."
fi

if [ $COPY_FILES -eq 1 ]; then
    DATADIR="$BASEDIR/../data/$APP_NAME"
	echo "Creating index directory: $INDEX_DATA_DIR" && mkdir -p $INDEX_DATA_DIR
	echo "Decompressing data files from $DATADIR into $INDEX_DATA_DIR"
	
	PARALLEL_FOUND=true
	command -v parallel > /dev/null || PARALLEL_FOUND=false
	if [ "$PARALLEL_FOUND" == "true" ]; then
		echo "... using GNU parallel"
		parallel --bar "gzip -d -f -c {} > $INDEX_DATA_DIR/{/.}" ::: $DATADIR/*.json.gz
	else
		echo "... sequentially"
		cp $DATADIR/*.json.gz $INDEX_DATA_DIR && \
		gzip -d -f $INDEX_DATA_DIR/*.json.gz
	fi
fi

{
	curl -f -i -X POST -u ${APP_NAME}:f01a7031fc17 "${APP_URL}/api/harvests"
} || {
	code=$?
	echo -e "A problem occured (code=$code) when trying to index data \n"\
		"\tfrom $INDEX_DATA_DIR\n"\
		"\ton app ${APP_URL}"
	exit $code
}
