#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

BASEDIR=$(dirname "$0")
ES_HOST="localhost"
ES_HOSTS="${ES_HOST}"
ES_PORT="9200"
TIMESTAMP=$(date +%s)

APPS="rare, brc4env, wheatis, faidare"
ENVS="dev, beta, staging, prod"

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to index data in Data Discovery portals (RARe, WheatIS and Faidare)

USAGE:
	$0 -host <"elasticsearch_host_1 elasticsearch_host_2"> -port <elasticsearch_port> -app <application name> -env <environment name> -data <data directory> -timestamp <epoch timestamp> [-h|--help]

PARAMS:
	-host          the hostname or IP of Elasticsearch node (default: $ES_HOST), can contain several hosts (space separated, between quotes) if you want to spread the load on several hosts
	-port          the port of Elasticsearch node (default: $ES_PORT), must be the same port for each host declared using -host parameter
	-app           the name of the targeted application: rare, wheatis or faidare
	-env           the environment name of the targeted application (dev, beta, prod ...)
	-data          the data directory in which the JSON files to index can be found (e.g. /mnt/index-data-is/[app])
	               NB: use rare directory for brc4env
	-timestamp     a timestamp used to switch aliases from old indices to newer ones, in order to avoid any downtime
	-h or --help   print this help

DEPENDENCIES:
	- jq 1.6+: https://github.com/stedolan/jq/releases/tag/jq-1.6
	- GNU parallel: https://www.gnu.org/software/parallel/
	- gzip: http://www.gzip.org/

EOF
	exit 1
}

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
		-data) DATADIR=$2;shift 2;;
		-timestamp) TIMESTAMP=$2;shift 2;;
		--) shift;break;;
		-*) echo -e "${RED}ERROR: Unknown option: $1${NC}" && echo && help && echo;exit 1;;
		*) echo -e "${RED}ERROR: Number or arguments unexpected. If you provide several hosts, please double quote them: $1${NC}" && echo && help && echo;exit 1;;
	esac
done

if  [ -z "$APP_NAME" ] || [[ ${APPS} != *${APP_NAME}* ]]; then
	echo -e "${RED_BOLD}ERROR: app parameter is mandatory: the value is empty or invalid!${NC}"
	echo && help
	exit 4
fi
if  [ -z "$APP_ENV" ] || [[ ${ENVS} != *${APP_ENV}* ]] ; then
	echo -e "${RED_BOLD}ERROR: env parameter is mandatory: the value is empty or invalid!${NC}"
	echo && help
	exit 4
fi

if [ -z "${DATADIR}" ] || [ ! -d "${DATADIR}" ] ; then
	echo -e "${RED_BOLD}ERROR: data parameter is mandatory if no-data parameter is not used: the value is empty or invalid!${NC}"
	echo && help
	exit 4
elif [ ! -d "${DATADIR}/data" ] || [ $(find ${DATADIR}/data -type f -name "*.json.gz" -ls | wc -l) -eq 0 ] ; then
	echo -e "${RED_BOLD}ERROR: data directory is absent from ${DATADIR} or it contains no files to index!${NC}"
	echo && help
	exit 4
elif [ ! -d "${DATADIR}/suggestions" ] || [ $(find ${DATADIR}/suggestions -type f -name "*.gz" -ls | wc -l) -eq 0 ] ; then
	echo -e "${RED_BOLD}ERROR: suggestions directory is absent from ${DATADIR} or it contains no files to index!${NC}"
	echo && help
	exit 4
fi

if [ -z "$ES_HOST" ] || [ -z "$ES_PORT" ] ; then
	echo -e "${RED}ERROR: host and port parameters are mandatory!${NC}"
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
PREFIX_ES="${APP_NAME}_search_${APP_ENV}"

DATE_TMSTP=$(${DATE_CMD} -d @${TIMESTAMP})
[ $? != 0 ] && { echo -e "Given timestamp ($TIMESTAMP) is malformed and cannot be transformed to a valid date." ; exit 1; }
echo "Using timestamp corresponding to date: ${DATE_TMSTP}"

WHEATIS_ID_FIELD=""
FAIDARE_ID_FIELD="identifier"
RARE_ID_FIELD="identifier"
BRC4ENV_ID_FIELD=${RARE_ID_FIELD}

DEV_URL_CARD="http://localhost:8380/faidare-dev/"
PROD_URL_CARD="https://urgi.versailles.inrae.fr/faidare/"
BETA_URL_CARD=$(echo $PROD_URL_CARD | sed "s/urgi/beta-urgi/")
STAGING_URL_CARD=$(echo $PROD_URL_CARD | sed "s/urgi/staging-urgi/")

# get app and env names to upper case, (i.e. rare -> RARE)
APP_VAR=$(eval echo $APP_NAME | tr '[a-z]' '[A-Z]')
ENV_VAR=$(eval echo $APP_ENV | tr '[a-z]' '[A-Z]')
# get values for app (i.e. get $RARE_ID_FIELD for RARE ID_FIELD var)
ID_FIELD=$(eval "echo \$$(eval echo $APP_VAR'_ID_FIELD')")
URL_CARD=$(eval "echo \$$(eval echo $ENV_VAR'_URL_CARD')")

MAPPING_FILE="${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${APP_NAME}/*.mapping.json"
[ "$APP_NAME" == "brc4env"  ] && MAPPING_FILE=$(echo $MAPPING_FILE | sed "s/brc4env/rare/")
FIELDS=$(jq '.["properties"] | keys' ${MAPPING_FILE})

OUTDIR="/tmp/bulk/${APP_NAME}-${APP_ENV}"
[ -d "$OUTDIR" ] && rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

export BASEDIR OUTDIR ES_PORT APP_NAME APP_ENV DATADIR TIMESTAMP ID_FIELD URL_CARD FIELDS PREFIX_ES

index_resources() {
	bash -c "set -o pipefail; gunzip -c $1 \
		| jq --arg card '${URL_CARD}' -f ${BASEDIR}/link_card.jq \
		| jq --argjson fields '${FIELDS}' -f ${BASEDIR}/clean_fields.jq \
		| jq -c '.[] | .name = (.name|tostring) | [.]' 2>> ${OUTDIR}/$2.jq.err \
		| jq -c -f ${BASEDIR}/to_bulk.jq 2> ${OUTDIR}/$2.jq.err \
		| gzip -c \
		| curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
			-XPOST \"$3:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-resource-index/_bulk\"\
			--data-binary '@-' > ${OUTDIR}/$2-resources.log.gz "
}

index_suggestions() {
	bash -c "set -o pipefail; curl -s -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip' -H 'Accept-Encoding: gzip' \
		-XPOST \"$3:${ES_PORT}/${PREFIX_INDEX}-tmstp${TIMESTAMP}-suggestions-index/_bulk\"\
		--data-binary '@$1' > ${OUTDIR}/$2-suggestions.log.gz"
}

process_suggestions() {
	{
		echo "Indexing suggestions into ${DATADIR}/${SUGGESTION_DIR}/${APP_NAME}_bulk_*.gz towards index located on ${ES_HOST}:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-suggestions-index ..."
		find ${DATADIR}/${SUGGESTION_DIR}/ -maxdepth 1 -name "${APP_NAME}_bulk_*.gz" | \
			parallel -j${HOST_NB} --bar --link --halt now,fail=1 index_suggestions {1} {1/.} {2} \
			:::: - ::: ${ES_HOSTS}
	} || {
		code=$?
		echo -e "${RED}A problem occurred (code=$code) when trying to index ${SUGGESTION_DIR}\n"\
			"\tfrom ${DATADIR}/${SUGGESTION_DIR} on ${APP_NAME} application and on ${APP_ENV} environment${NC}"
		parallel "gunzip -c {} | jq '.errors' | grep -q true  && echo -e '${ORANGE}ERROR found indexing in {}${NC}' ;" ::: ${OUTDIR}/bulk*.log.gz
		exit $code
	}
}

manage_aliases() {
	{
		echo "Updating aliases for latest resources and suggestions indices with timestamp ${TIMESTAMP} instead of previous ${PREVIOUS_TIMESTAMP}..."
		curl -s -H 'Content-Type: application/json' -XPOST "${ES_HOST}:${ES_PORT}/_aliases?pretty" --data-binary '@-' <<EOF
		{
			"actions" : [
				{ "remove" : { "index" : "${PREFIX_INDEX_SUGGESTION}-*suggestion*", "alias" : "${PREFIX_ALIAS}-suggestions-alias" } },
				{ "remove" : { "index" : "${PREFIX_INDEX_RESOURCE}-*resource*", "alias" : "${PREFIX_ALIAS}-resource-alias" } },
				{ "add" : { "index" : "${PREFIX_INDEX_SUGGESTION}-tmstp${TIMESTAMP}-suggestions-index", "alias" : "${PREFIX_ALIAS}-suggestions-alias" } },
				{ "add" : { "index" : "${PREFIX_INDEX_RESOURCE}-tmstp${TIMESTAMP}-resource-index", "alias" : "${PREFIX_ALIAS}-resource-alias" } }
			]
		}
EOF
	} || {
		code=$?
		echo -e "${RED}A problem occurred (code=$code) when trying to update aliases for resource and suggestions indices having timestamp $TIMESTAMP \n"\
			"\tfrom ${DATADIR} on ${APP_NAME} application and on ${APP_ENV} environment${NC}"
		exit $code
	}
}

export -f index_resources index_suggestions process_suggestions

## ADD DATA IN RESOURCES INDEX
{
	echo "Indexing files into ${DATADIR}/data towards index located on ${ES_HOST}:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-resource-index ..."
	find ${DATADIR}/data/ -maxdepth 2 -name "*.json.gz" | \
		parallel --link -j${HOST_NB} --bar --halt now,fail=1 index_resources {1} {1/.} {2} :::: - ::: ${ES_HOSTS}
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
curl -s -H 'Content-Type: application/x-ndjson' -XPOST \"${ES_HOST}:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-resource-index/_settings\" --data-binary '@-' <<EOF
{
	"number_of_replicas": 0,
	"refresh_interval": "30s",
}
EOF

## ADD DATA IN SUGGESTIONS INDEX
export SUGGESTION_DIR="suggestions"
export PREFIX_INDEX="${PREFIX_ES}"
process_suggestions

if [ -d "${DATADIR}/private-suggestions/" ] && [ $(find ${DATADIR}/private-suggestions/ -type f -name "*.json" -ls | wc -l) -eq 0 ] ; then
	export SUGGESTION_DIR="private-suggestions"
	export PREFIX_INDEX="${PREFIX_ES}-private"
	process_suggestions
fi

## UPDATE ALIASES
# set -x
export PREVIOUS_TIMESTAMP=$(curl -s "${ES_HOST}:${ES_PORT}/_cat/indices/${APP_NAME}*${APP_ENV}-tmstp*" | "${SED_CMD}" -r "s/.*-tmstp([0-9]+).*/\1/g" | sort -ru | head -2 | tail -1)
# current timestamp index has already been created so looking for the 2nd last one

export PREFIX_INDEX_SUGGESTION="${PREFIX_ES}"
export PREFIX_INDEX_RESOURCE="${PREFIX_ES}"
export PREFIX_ALIAS="${PREFIX_ES}"
manage_aliases

if [ -d "${DATADIR}/private-suggestions/" ] && [ $(find ${DATADIR}/private-suggestions/ -type f -name "*.json" -ls | wc -l) -eq 0 ] ; then
	export PREFIX_INDEX_SUGGESTION="${PREFIX_ES}-private"
	export PREFIX_INDEX_RESOURCE="${PREFIX_ES}"
	export PREFIX_ALIAS="${PREFIX_ES}-private"
	manage_aliases
fi
