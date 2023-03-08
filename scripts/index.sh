#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

export SHELL=/bin/bash

BASEDIR=$(dirname "$0")
ES_HOST="localhost"
ES_HOSTS="${ES_HOST}"
ES_PORT="9200"
TIMESTAMP=$(date +%s)
CLEAN=0
INDEX=1
LOCAL=0

APPS="rare, brc4env, wheatis, faidare"
ENVS="dev, beta, staging, prod"

help() {
		cat <<EOF
DESCRIPTION:
	Wrapper script used to create index and aliases then index data for Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -host <ES host> -port <ES port> -app <application name> -env <environment name> -data <data directory> [--local] [--no-data] [-h|--help]

PARAMS:
	-host          the hostname or IP of Elasticsearch node (default: $ES_HOST), can contain several hosts (space separated, between quotes) if you want to spread the indexing load on several hosts. To increase parallel indexation, you can double te same IP (eg -host "192.168.10.xxx 192.168.10.xxx")
	-port          the port value of the targeted Elasticsearch endpoint (default: $ES_PORT)
	-app           the name of the targeted application: $APPS
	-env           the environment name of the targeted application: $ENVS
	-data          the data directory in which the JSON files to index can be found (e.g. /mnt/index-data-is/[env]/[app])
	               NB: use rare directory for brc4env
	--local        use local environment for RARe application (by default) and ignore all Elasticsearch related options (env, host, port)
	--no-data      does not index data, only create indices and aliases
	--clean	       clean the previous existing indices and rollover alias
	-h or --help   print this help

EOF
	exit 1
}

DATE_CMD="date"
SED_CMD="sed"
if [[ $OSTYPE == darwin* ]]; then
	# Use gdate on the mac
	DATE_CMD="gdate"
	# Use gsed on the mac
	SED_CMD="gsed"
fi

# any params
[ -z "$1" ] && echo && help

# get params
while [ -n "$1" ]; do
	case $1 in
		-h) help;shift 1;;
		--help) help;shift 1;;
		-host) [ "$LOCAL" -eq "1" ] || ES_HOST=$(echo "$2" | cut -f 1 -d' ') ; ES_HOSTS="$2" ;shift 2;;
		-port) [ "$LOCAL" -eq "1" ] || ES_PORT=$2;shift 2;;
		-app) APP_NAME=$2;shift 2;;
		-env) [ "$LOCAL" -eq "1" ] || APP_ENV=$2;shift 2;;
		-data) DATADIR=$2;shift 2;;
		--local) LOCAL=1 ; echo "Working in local mode, ignoring all Elasticsearch related options (env, host, port)" ;shift;;
		--no-data) INDEX=0;shift 1;;
		--clean) CLEAN=1;shift 1;;
		--) shift;break;;
		-*) echo -e "${RED_BOLD}Unknown option: $1 ${NC}\n"&& help && echo;exit 1;;
		*) break;;
	esac
done

[ $LOCAL == 1 ] && { [ -z "$APP_NAME" ] && APP_NAME="rare" ; APP_ENV="dev" ; ES_HOSTS="localhost" ; ES_HOST="localhost" ; ES_PORT="9200" ; }

if [ -z "$ES_HOST" ] || [ -z "$ES_PORT" ] ; then
	echo "ERROR: host and port parameters are mandatory!${NC}"
	echo && help
	exit 4
fi

if  [ -z "${APP_NAME}" ] || [[ ${APPS} != *${APP_NAME}* ]] ; then
	echo -e "${RED_BOLD}ERROR: app parameter is mandatory: the value is empty or invalid!${NC}"
	echo && help
	exit 4
fi

if  [ -z "${APP_ENV}" ] || [[ ${ENVS} != *${APP_ENV}* ]] ; then
	echo -e "${RED_BOLD}ERROR: env parameter is mandatory: the value is empty or invalid!${NC}"
	echo && help
	exit 4
fi

if [ $INDEX -eq 1 ] ; then
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
fi

# Check ES node connectivity
curl -s -m 5 ${ES_HOST}:${ES_PORT} > /dev/null
[ $? != 0 ] && {
	echo -e "${RED_BOLD}ERROR: node ${ES_HOST}:${ES_PORT} has been unreachable in enough time. Please remove it from the node list or check your network is correctly configured. Exiting.${NC}"
	exit 6
}

PREFIX_ES="${APP_NAME}_search_${APP_ENV}"

# Get previous existing timestamps
PREVIOUS_TIMESTAMPS=$(curl -s "${ES_HOST}:${ES_PORT}/_cat/indices/${PREFIX_ES}-tmstp*" | "${SED_CMD}" -r "s/.*-tmstp([0-9]+).*/\1/g" | sort -ru | grep -v "$TIMESTAMP")

# Create index, aliases with their mapping
$SHELL "${BASEDIR}"/createIndexAndAliases4CI.sh -host "$ES_HOST" -port "$ES_PORT" -app "$APP_NAME" -env "$APP_ENV" -timestamp "$TIMESTAMP"
CODE=$?
[ $CODE -gt 0 ] && { echo -e "${RED_BOLD}Error when creating index, see errors above. Exiting.${NC}" ; exit $CODE ; }
echo

# Index data in created indices
if [ $INDEX -eq 1 ] ; then
	$SHELL "${BASEDIR}"/harvestCI.sh -host "$ES_HOSTS" -port "$ES_PORT" -app "$APP_NAME" -env "$APP_ENV" -data "$DATADIR" -timestamp "$TIMESTAMP"
fi
CODE=$?
[ $CODE -gt 0 ] && { echo -e "${RED_BOLD}Error when indexing data, see errors above. Exiting.${NC}" ; exit $CODE ; }

# Clean if asked
[ $CLEAN != 0 ] && {
	echo -e "Found following previous timestamps:\n${GREEN}${PREVIOUS_TIMESTAMPS}${NC}"
	for TMSTP in ${PREVIOUS_TIMESTAMPS}; do
		"${DATE_CMD}" -d "@${TMSTP}" &>/dev/null
		if [ $? != 0 ]; then
			echo -e "Cannot clean previous indices and aliases based on this timestamp (${ORANGE}${TMSTP}${NC}) because it looks to be invalid."
		else
			echo "Cleaning previous indices with timestamp ${TMSTP}..."
			curl -s -X DELETE "${ES_HOST}:${ES_PORT}/*-tmstp${TMSTP}*?pretty"
			CODE=$?
			[ $CODE -gt 0 ] && { echo -e "${RED_BOLD}Error when deleting old alias and indices, see errors above. Exiting.${NC}" ; exit $CODE ; }
		fi
	done
}
[ $CLEAN -eq 0 ] && echo -e "If a clean of indices had been triggered, following timestamps would have been deleted:\n${PREVIOUS_TIMESTAMPS}."

exit 0
