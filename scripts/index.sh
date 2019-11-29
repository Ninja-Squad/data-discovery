#!/bin/bash

#set -x

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

help() {
		cat <<EOF
DESCRIPTION:
	Wrapper script used to create index and aliases then index data for Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -host <ES host> -port <ES port> -app <application name> -env <environment name> [-h|--help]

PARAMS:
	-host          the hostname or IP of Elasticsearch node (default: $ES_HOST), can contain several hosts (space separated, between quotes) if you want to spread the indexing load on several hosts
	-port          the port value of the targeted Elasticsearch endpoint ($ES_PORT by default)
	-app           the name of the targeted application: rare, wheatis or data-discovery
	-env           the environment name of the targeted application (dev, beta, prod ...)
        --clean	       clean the previous existing indices and rollover alias
	-h or --help   print this help

EOF
	exit 1
}

BASEDIR=$(dirname "$0")
ES_HOST=""
ES_PORT="9200"
APP_NAME=""
APP_ENV=""
TIMESTAMP=$(date +%s)
CLEAN=0

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
		--clean) CLEAN=1;shift 1;;
		--) shift;break;;
		-*) echo -e "${RED_BOLD}Unknown option: $1 ${NC}\n"&& help && echo;exit 1;;
		*) break;;
	esac
done

if [ -z "$ES_HOST" ] || [ -z "$ES_PORT" ] || [ -z "$APP_NAME" ] || [ -z "$APP_ENV" ]; then
    echo "ERROR: host, port, app and env parameters are mandatory!"
    echo && help
    exit 4
fi

# Check ES node connectivity
curl -s -m 5 ${ES_HOST}:${ES_PORT} > /dev/null
[ $? != 0 ] && {
    echo -e "${RED_BOLD}ERROR: node ${ES_HOST}:${ES_PORT} has been unreachable in enough time. Please remove it from the node list or check your network is correctly configured. Exiting.${NC}"
    exit 6
}

# Get previous existing timestamp
PREVIOUS_TIMESTAMP=$(curl -s "${ES_HOST}:${ES_PORT}/_cat/indices/${APP_NAME}*${APP_ENV}-tmstp*" | sed -r "s/.*-tmstp([0-9]+).*/\1/g" | sort -ru | head -1) # no index yet created with current timestamp. So using the latest as previous timestamp.

# Create index, aliases with their mapping
sh ${BASEDIR}/createIndexAndAliases4CI.sh -host "$ES_HOST" -port "$ES_PORT" -app "$APP_NAME" -env "$APP_ENV" -timestamp "$TIMESTAMP"
CODE=$?
[ $CODE -gt 0 ] && { echo -e "${RED_BOLD}Error when creating index, see errors above. Exiting.${NC}" ; exit $CODE ; }
#exit 0
echo

# Does index data in created indices
sh ${BASEDIR}/harvestCI.sh -host "$ES_HOSTS" -port "$ES_PORT" -app "$APP_NAME" -env "$APP_ENV" -timestamp "$TIMESTAMP"
CODE=$?
[ $CODE -gt 0 ] && { echo -e "${RED_BOLD}Error when indexing data, see errors above. Exiting.${NC}" ; exit $CODE ; }

# Clean if asked
[ $CLEAN != 0 ] && {
    echo -e "Found previous timestamp: ${GREEN}${PREVIOUS_TIMESTAMP}${NC}"
    date -d "@${PREVIOUS_TIMESTAMP}" &>/dev/null
    if [ $? != 0 ]; then
        echo -e "Cannot clean previous indices and aliases because no valid previous timestamp has been found: ${ORANGE}${PREVIOUS_TIMESTAMP}${NC}."
    else
        echo "Cleaning previous rollover alias and indices with timestamp ${PREVIOUS_TIMESTAMP}..."
        curl -s -X DELETE "${ES_HOST}:${ES_PORT}/*-tmstp${PREVIOUS_TIMESTAMP}*?pretty"
        CODE=$?
        [ $CODE -gt 0 ] && { echo -e "${RED_BOLD}Error when deleting old alias and indices, see errors above. Exiting.${NC}" ; exit $CODE ; }
    fi
}

exit 0
