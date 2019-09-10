#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

ES_HOST=localhost
ES_PORT=9200

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to index data in Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -host <elasticsearch_host> -port <elasticsearch_port> -app <application name> -env <environment name> [-h|--help]

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
    echo -e "${ORANGE}Program $1 is missing, cannot continue...${NC}"
    return 1
  }
  return 0
}

MISSING_COUNT=0
check_command gzip || ((MISSING_COUNT += 1))
check_command parallel || ((MISSING_COUNT += 1))
check_command jq || ((MISSING_COUNT += 1))

[ $MISSING_COUNT -ne 0 ] && {
  echo -e "${RED}ERROR: please, install the $MISSING_COUNT missing program(s). Exiting.${NC}"
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
		-*) echo -e "${RED}ERROR: Unknown option: $1${NC}" && echo && help && echo;exit 1;;
		*) echo -e "${RED}ERROR: Number or arguments unexpected. If you provide several hosts, please double quote them: $1${NC}" && echo && help && echo;exit 1;;
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
    echo "Indexing files from ${DATADIR} into index located on ${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-resource-alias ..."
    time parallel --eta "
            gunzip -c {} \
            | ID_FIELD=name jq -c -f ${BASEDIR}/to_bulk.jq 2> ${OUTDIR}/{/.}.jq.err \
            | jq -c '.name = (.name|tostring)' 2>> ${OUTDIR}/{/.}.jq.err \
            | gzip -c \
            | curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
                -XPOST \"${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-resource-alias/${APP_NAME}-${APP_ENV}-resource/_bulk\"\
                --data-binary '@-' > ${OUTDIR}/{/.}.log.gz" \
        ::: ${DATADIR}/*.json.gz
} || {
	code=$?
	echo -e "A problem occured (code=$code) when trying to index data \n"\
		"\tfrom ${DATADIR} on ${APP_NAME} application and on ${APP_ENV} environment"
	parallel "gunzip -c {} | jq '.errors' | grep -q true  && echo -e '\033[0;31mERROR found indexing in {}' ;" ::: ${OUTDIR}/*.log.gz
	exit $code
}
echo "Indexing has finished, updating settings"
curl -s -H 'Content-Type: application/x-ndjson' -XPOST \"${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-resource-alias/_settings\" --data-binary '@-' <<EOF
{
    "number_of_replicas": 0,
    "refresh_interval": "30s",
}
EOF

{
    #set -x
    echo "Indexing suggestions from ${DATADIR}/suggestions/*.gz into index located on ${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-suggestions-alias ..."
    time parallel --eta "
            curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
                -XPOST \"${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-suggestions-alias/${APP_NAME}-${APP_ENV}-suggestions/_bulk\"\
                --data-binary '@{}' > ${OUTDIR}/{/.}.log.gz" \
        ::: ${DATADIR}/suggestions/bulk*.gz
} || {
	code=$?
	echo -e "${RED}A problem occurred (code=$code) when trying to index suggestions \n"\
		"\tfrom ${DATADIR} on ${APP_NAME} application and on ${APP_ENV} environment${NC}"
	parallel "gunzip -c {} | jq '.errors' | grep -q true  && echo -e '${ORANGE}ERROR found indexing in {}${NC}' ;" ::: ${OUTDIR}/bulk*.log.gz
	exit $code
}
