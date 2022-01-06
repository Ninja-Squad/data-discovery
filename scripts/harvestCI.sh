#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

ES_HOST=localhost
ES_HOSTS="${ES_HOST}"
ES_PORT=9200
TIMESTAMP=""

READLINK_CMD="readlink"
DATE_CMD="date"
SED_CMD="sed"
if [[ $OSTYPE == darwin* ]]; then
  # Use greadlink on the mac
  READLINK_CMD="greadlink"
  # Use gdate on the mac
  DATE_CMD="gdate"
  # Use gsed on the mac
  SED_CMD="gsed"
fi

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to index data in Data Discovery portals (RARe, WheatIS and Faidare)

USAGE:
	$0 -host <"elasticsearch_host_1 elasticsearch_host_2"> -port <elasticsearch_port> -app <application name> -env <environment name> -timestamp <epoch timestamp> [-h|--help]

PARAMS:
	-host          the hostname or IP of Elasticsearch node (default: $ES_HOST), can contain several hosts (space separated, between quotes) if you want to spread the load on several hosts
	-port          the port of Elasticsearch node (default: $ES_PORT), must be the same port for each host declared using -host parameter
	-app           the name of the targeted application: rare, wheatis or faidare
	-env           the environment name of the targeted application (dev, beta, prod ...)
	-timestamp     a timestamp used to switch aliases from old indices to newer ones, in order to avoid any downtime
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
		-timestamp) TIMESTAMP=$2;shift 2;;
		--) shift;break;;
		-*) echo -e "${RED}ERROR: Unknown option: $1${NC}" && echo && help && echo;exit 1;;
		*) echo -e "${RED}ERROR: Number or arguments unexpected. If you provide several hosts, please double quote them: $1${NC}" && echo && help && echo;exit 1;;
	esac
done

BASEDIR=$(dirname "$0")
SCRIPT_DIR=$(readlink -f "$BASEDIR")
DATADIR=$("${READLINK_CMD}" -f "$BASEDIR/../data/$APP_NAME/")

DEFAULT_FILTER_DATA_SCRIPT="${SCRIPT_DIR}/filters/noop_filter.jq"
BRC4ENV_FILTER_DATA_SCRIPT="${SCRIPT_DIR}/filters/pillar_filter_brc4env.jq"
WHEATIS_FILTER_DATA_SCRIPT="${SCRIPT_DIR}/filters/wheatis_filter.jq"
FILTER_DATA_SCRIPT=${DEFAULT_FILTER_DATA_SCRIPT}
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
ID_FIELD=""
APP_SETTINGS_NAME="${APP_NAME}"
if [ "$APP_NAME" == "rare" ]; then
    ID_FIELD=identifier
elif [ "$APP_NAME" == "brc4env"  ] ; then
    ID_FIELD=identifier
    FILTER_DATA_SCRIPT="${BRC4ENV_FILTER_DATA_SCRIPT}"
    APP_SETTINGS_NAME="rare"
    DATADIR=$("${READLINK_CMD}" -f "$BASEDIR/../data/rare/")
fi
export ID_FIELD APP_NAME

DATE_TMSTP=$(${DATE_CMD} -d @${TIMESTAMP})
[ $? != 0 ] && { echo -e "Given timestamp ($TIMESTAMP) is malformed and cannot be transformed to a valid date." ; exit 1; }
echo "Using timestamp corresponding to date: ${DATE_TMSTP}"

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

FIELDS=$(jq '.["properties"] | keys' ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${APP_SETTINGS_NAME}/*.mapping.json)
export BASEDIR OUTDIR ES_PORT APP_NAME APP_ENV TIMESTAMP FIELDS FILTER_DATA_SCRIPT

index_resources() {
    bash -c "set -o pipefail; gunzip -c $1 \
            | jq -rc -f ${FILTER_DATA_SCRIPT} \
            | jq --argjson fields '${FIELDS}' -f ${BASEDIR}/clean_fields.jq \
            | jq -c '.[] | .name = (.name|tostring) | [.]' 2>> ${OUTDIR}/$2.jq.err \
            | jq -c -f ${BASEDIR}/to_bulk.jq 2> ${OUTDIR}/$2.jq.err \
            | gzip -c \
            | curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
                -XPOST \"$3:${ES_PORT}/${APP_NAME}-${APP_ENV}-tmstp${TIMESTAMP}-resource-index/_bulk\"\
                --data-binary '@-' > ${OUTDIR}/$2-resources.log.gz "
}

index_suggestions() {
    bash -c "set -o pipefail; curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
                -XPOST \"$3:${ES_PORT}/${APP_NAME}-${APP_ENV}-tmstp${TIMESTAMP}-suggestions/_bulk\"\
                --data-binary '@$1' > ${OUTDIR}/$2-suggestions.log.gz"
}

export -f index_resources index_suggestions

{
    # set -x
    echo "Indexing files from ${DATADIR} into index located on ${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-tmstp${TIMESTAMP}-resource-index ..."
    find ${DATADIR}/data/ -maxdepth 2 -name "*.json.gz" | \
        parallel --link -j${HOST_NB} --bar --halt now,fail=1 index_resources {1} {1/.} {2} \
        :::: - ::: ${ES_HOSTS}
} || {
	code=$?
	echo -e "A problem occured (code=$code) when trying to index data \n"\
		"\tfrom ${DATADIR} on ${APP_NAME} application and on ${APP_ENV} environment"
	parallel "gunzip -c {} | jq '.errors' | grep -q true && echo -e '\033[0;31mERROR related to data found when indexing {}' ;" ::: ${OUTDIR}/*.log.gz
	parallel "gunzip -c {} | jq '.error? | length == 0' | grep -q false && echo -e '\033[0;31mERROR related to Elasticsearch API usage found when indexing {}' ;" ::: ${OUTDIR}/*.log.gz
	exit $code
}
# check all JQ err files...
FILES_IN_ERROR=$(find "${OUTDIR}" -size "+0" -name "*jq.err")
[ -n "${FILES_IN_ERROR}" ] && { echo -e "${RED}ERROR: some problems occured with JQ processing, look at files:${ORANGE} ${FILES_IN_ERROR}${NC}" ; exit 4 ; }

echo "Indexing has finished, updating settings"
curl -s -H 'Content-Type: application/x-ndjson' -XPOST \"${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-tmstp${TIMESTAMP}-resource/_settings\" --data-binary '@-' <<EOF
{
    "number_of_replicas": 0,
    "refresh_interval": "30s",
}
EOF

{
    # set -x
    echo "Indexing suggestions from ${DATADIR}/suggestions/${APP_NAME}_bulk_*.gz into index located on ${ES_HOST}:${ES_PORT}/${APP_NAME}-${APP_ENV}-tmstp${TIMESTAMP}-suggestions ..."
    find ${DATADIR}/suggestions/ -maxdepth 1 -name "${APP_NAME}_bulk_*.gz" | \
        parallel -j${HOST_NB} --bar --link --halt now,fail=1 index_suggestions {1} {1/.} {2} \
        :::: - ::: ${ES_HOSTS}
} || {
	code=$?
	echo -e "${RED}A problem occurred (code=$code) when trying to index suggestions \n"\
		"\tfrom ${DATADIR} on ${APP_NAME} application and on ${APP_ENV} environment${NC}"
	parallel "gunzip -c {} | jq '.errors' | grep -q true  && echo -e '${ORANGE}ERROR found indexing in {}${NC}' ;" ::: ${OUTDIR}/bulk*.log.gz
	exit $code
}
# set -x
PREVIOUS_TIMESTAMP=$(curl -s "${ES_HOST}:${ES_PORT}/_cat/indices/${APP_NAME}*${APP_ENV}-tmstp*" | "${SED_CMD}" -r "s/.*-tmstp([0-9]+).*/\1/g" | sort -ru | head -2 | tail -1) # current timestamp index has already been created so looking for the 2nd last one
{
    echo -e "Updating aliases for latest resources and suggestions indices with timestamp ${TIMESTAMP} instead of previous ${PREVIOUS_TIMESTAMP}..."
    curl -s -H 'Content-Type: application/json' -XPOST "${ES_HOST}:${ES_PORT}/_aliases?pretty" --data-binary '@-' <<EOF
    {
        "actions" : [
            { "remove" : { "index" : "${APP_NAME}-${APP_ENV}-*suggestion*", "alias" : "${APP_NAME}-${APP_ENV}-suggestions-alias" } },
            { "remove" : { "index" : "${APP_NAME}-${APP_ENV}-*resource*", "alias" : "${APP_NAME}-${APP_ENV}-resource-alias" } },
            { "add" : { "index" : "${APP_NAME}-${APP_ENV}-tmstp${TIMESTAMP}-suggestions", "alias" : "${APP_NAME}-${APP_ENV}-suggestions-alias" } },
            { "add" : { "index" : "${APP_NAME}-${APP_ENV}-tmstp${TIMESTAMP}-resource-index", "alias" : "${APP_NAME}-${APP_ENV}-resource-alias" } }
        ]
    }
EOF
} || {
	code=$?
	echo -e "${RED}A problem occurred (code=$code) when trying to update aliases for resource and suggestions indices having timestamp $TIMESTAMP \n"\
		"\tfrom ${DATADIR} on ${APP_NAME} application and on ${APP_ENV} environment${NC}"
	exit $code
}
