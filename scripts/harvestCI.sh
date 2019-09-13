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
	$0 -host <"elasticsearch_host_1 elasticsearch_host_2"> -port <elasticsearch_port> -app <application name> -env <environment name> [-h|--help]

PARAMS:
	-host          the hostname or IP of Elasticsearch node (default: $ES_HOST), can contain several hosts (space separated, between quotes) if you want to spread the load on several hosts
	-port          the port of Elasticsearch node (default: $ES_PORT), must be the same port for each host declared using -host parameter
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
		-host) ES_HOST=$(echo "$2" | cut -f 1 -d' ') ; ES_HOSTS="$2" ;shift 2;;
		-port) ES_PORT=$2;shift 2;;
		-app) APP_NAME=$2;shift 2;;
		-env) APP_ENV=$2;shift 2;;
		--) shift;break;;
		-*) echo -e "${RED}ERROR: Unknown option: $1${NC}" && echo && help && echo;exit 1;;
		*) echo -e "${RED}ERROR: Number or arguments unexpected. If you provide several hosts, please double quote them: $1${NC}" && echo && help && echo;exit 1;;
	esac
done

BASEDIR=$(dirname "$0")
DATADIR=$(readlink -f "$BASEDIR/../data/$APP_NAME/")

if [ -z "$APP_NAME" ] || [ -z "$APP_ENV" ]; then
    echo -e "${RED}ERROR: -app and -env parameters are mandatory!${NC}"
    echo && help
	exit 4
fi
if [ -z "$ES_HOST" ]; then
    echo -e "${RED}ERROR: -host parameter has been misconfigured!${NC}"
    echo && help
	exit 4
fi

# Check that all ES nodes belong to the same cluster
previous_cluster_info=""
for es_host in ${ES_HOSTS} ; do
    cluster_info=$(curl -s -m 5 ${es_host}:9200)
    [ $? != 0 ] && {
        echo -e "${RED}ERROR: host ${es_host} has been unreachable in enough time. Please remove it from the node list or check your network is correctly configured. Exiting.${NC}"
        exit 6
    }
    cluster_uuid=$(echo "${cluster_info}" | jq -r '.cluster_uuid?')
    node_name=$(echo "${cluster_info}" | jq -r '.name?')
    previous_cluster_uuid=$(echo "${previous_cluster_info}" | jq -r '.cluster_uuid?')
    previous_node_name=$(echo "${previous_cluster_info}" | jq -r '.name?')

    [ -n "${previous_cluster_uuid}" ] && [ "${previous_cluster_uuid}" != "${cluster_uuid}" ] && {
        echo -e "${RED}ERROR: you try to index data on nodes belonging to different clusters, having cluster_uuid: ${ORANGE}${previous_cluster_uuid}${RED} (node named '${ORANGE}${previous_node_name}${RED}') and ${ORANGE}${cluster_uuid}${RED} (node named '${ORANGE}${node_name}${RED}'). You must provide nodes from the same Elasticsearch cluster. Exiting.${NC}"
         exit 5
    }
    previous_cluster_info="${cluster_info}"
done

HOST_NB=$(($(echo "${ES_HOSTS}" | grep -o ' ' | grep -c .) +1 ))

OUTDIR="/tmp/bulk/${APP_NAME}-${APP_ENV}"
[ -d "$OUTDIR" ] && rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

{
#    set -x
    echo "Indexing files from ${DATADIR} into index located on ${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-resource-alias ..."
    time parallel --bar --link "
            gunzip -c {1} \
            | ID_FIELD=name jq -c -f ${BASEDIR}/to_bulk.jq 2> ${OUTDIR}/{1/.}.jq.err \
            | jq -c '.name = (.name|tostring)' 2>> ${OUTDIR}/{1/.}.jq.err \
            | gzip -c \
            | curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
                -XPOST \"{2}:${ES_PORT}/${APP_NAME}-${APP_ENV}-resource-alias/${APP_NAME}-${APP_ENV}-resource/_bulk\"\
                --data-binary '@-' > ${OUTDIR}/{1/.}.log.gz" \
        ::: ${DATADIR}/*.json.gz ::: ${ES_HOSTS}
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
#    set -x
    echo "Indexing suggestions from ${DATADIR}/suggestions/*.gz into index located on ${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-suggestions-alias ..."
    time parallel -j${HOST_NB} --bar --link "
            curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
                -XPOST \"{2}:${ES_PORT}/${APP_NAME}-${APP_ENV}-suggestions-alias/${APP_NAME}-${APP_ENV}-suggestions/_bulk\"\
                --data-binary '@{1}' > ${OUTDIR}/{1/.}.log.gz" \
        ::: ${DATADIR}/suggestions/bulk_*.gz ::: ${ES_HOSTS}
} || {
	code=$?
	echo -e "${RED}A problem occurred (code=$code) when trying to index suggestions \n"\
		"\tfrom ${DATADIR} on ${APP_NAME} application and on ${APP_ENV} environment${NC}"
	parallel "gunzip -c {} | jq '.errors' | grep -q true  && echo -e '${ORANGE}ERROR found indexing in {}${NC}' ;" ::: ${OUTDIR}/bulk*.log.gz
	exit $code
}
