#!/bin/bash

ES_HOST=localhost
ES_PORT=9200

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to index data in Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -host <elasticsearch_host> -port <elasticsearch_port> -app <application name> -env <environment name> -copy [-h|--help]

PARAMS:
	-host          the hostname or IP of Elasticsearch node (default: $ES_HOST)
	-port          the port of Elasticsearch node (default: $ES_PORT)
	-app           the name of the targeted application: rare, wheatis or data-discovery
	-env           the environment name of the targeted application (dev, beta, prod ...)
	-h or --help   print this help

DEPENDENCIES:
    - jq 1.6+: https://github.com/stedolan/jq/releases/tag/jq-1.6
    - GNU parallel: https://www.gnu.org/software/parallel/
    - gzip: http://www.gzip.org/

EOF
	exit 1
}

check_command() {
  command -v $1 >/dev/null || {
    echo "Program $1 is missing, cannot continue..."
    return 1
  }
  return 0
}

MISSING_COUNT=0
check_command gzip || ((MISSING_COUNT += 1))
check_command parallel || ((MISSING_COUNT += 1))
check_command jq || ((MISSING_COUNT += 1))

[ $MISSING_COUNT -ne 0 ] && {
  echo "Please, install the $MISSING_COUNT missing program(s). Exiting."
  exit $MISSING_COUNT
}

# any params
[ -z "$1" ] && echo && help

# get params
while [ -n "$1" ]; do
	case $1 in
		-h) help;shift 1;;
		--help) help;shift 1;;
		-host) ES_HOST=$2;shift 2;;
		-port) ES_PORT=$2;shift 2;;
		-app) APP_NAME=$2;shift 2;;
		-env) APP_ENV=$2;shift 2;;
		--) shift;break;;
		-*) echo "Unknown option: $1" && echo && help && echo;exit 1;;
		*) break;;
	esac
done

BASEDIR=$(dirname "$0")
DATADIR=$(readlink -f "$BASEDIR/../data/$APP_NAME/")

if [ -z "$APP_NAME" ] || [ -z "$APP_ENV" ]; then
    echo "ERROR: -app and -env parameters are mandatory!"
    echo && help
	exit 4
fi

OUTDIR="/tmp/bulk/${APP_NAME}-${APP_ENV}"
[ -d "$OUTDIR" ] && rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

{
#set -x
echo "Indexing files from $DATADIR into index located on ${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-resource-physical-index ..."
time parallel -j4 --bar "gunzip -c {} | ID_FIELD=name jq -c -f ${BASEDIR}/to_bulk.jq | gzip -c | curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' -XPOST \"${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-resource-physical-index/${APP_NAME}-${APP_ENV}-resource/_bulk\" --data-binary '@-' > ${OUTDIR}/{/.}.log.gz" ::: $DATADIR/G*.json.gz
} || {
	code=$?
	echo -e "A problem occured (code=$code) when trying to index data \n"\
		"\tfrom $DATADIR on app ${APP_NAME} and on env ${APP_ENV}"
	exit $code
}
