#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

help() {
	cat <<EOF
DESCRIPTION: 
	Script used to create index and aliases for Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -host <ES host> -port <ES port> -app <application name> -env <environment name> -timestamp <epoch timestamp>  [-h|--help]

PARAMS:
	-host          the host name of the targeted Elasticsearch endpoint
	-port          the port value of the targeted Elasticsearch endpoint ($ES_PORT by default)
	-app           the name of the targeted application: rare, wheatis or faidare
	-env           the environment name of the targeted application (dev, beta, prod ...)
	-timestamp     a timestamp used to switch aliases from old indices to newer ones, in order to avoid any downtime
	-h or --help   print this help

EOF
	exit 1
}

DATE_CMD="date"
if [[ $OSTYPE == darwin* ]]; then
    # Use gdate on the mac
    DATE_CMD="gdate"
fi

check_command() {
  command -v $1 >/dev/null || {
    echo -e "${RED_BOLD}Program $1 is missing, cannot continue...${NC}"
    return 1
  }
  return 0
}

MISSING_COUNT=0
check_command jq || _=$((MISSING_COUNT += 1))

[ $MISSING_COUNT -ne 0 ] && {
  echo -e "${RED_BOLD}Please, install the $MISSING_COUNT missing program(s). Exiting.${NC}"
  exit $MISSING_COUNT
}

BASEDIR=$(dirname "$0")
ES_HOST=""
ES_PORT="9200"
APP_NAME=""
APP_ENV=""
TIMESTAMP=""

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
		-timestamp) TIMESTAMP=$2;shift 2;;
		--) shift;break;;
		-*) echo -e "${RED_BOLD}Unknown option: $1 ${NC}\n"&& help && echo;exit 1;;
		*) break;;
	esac
done

if [ -z "$ES_HOST" ] || [ -z "$ES_PORT" ] || [ -z "$APP_NAME" ] || [ -z "$APP_ENV" ]; then
    echo -e "${RED}ERROR: host, port, app and env parameters are mandatory!${NC}"
    echo && help
	exit 4
fi

DATE_CMD="date"
if [[ $OSTYPE == darwin* ]]; then
  # Use gdate on the mac
  DATE_CMD="gdate"
fi
DATE_TMSTP=$(${DATE_CMD} -d @${TIMESTAMP})
[ $? != 0 ] && { echo -e "Given timestamp ($TIMESTAMP) is malformed and cannot be transformed to a valid date." ; exit 1; }
echo "Using timestamp corresponding to date: ${DATE_TMSTP}"

TMP_FILE=$(mktemp)
if [ "${APP_NAME}" == "brc4env" ]; then
    APP_SETTINGS_NAME="rare"
else
    APP_SETTINGS_NAME="${APP_NAME}"
fi

PREFIX_ES="${APP_NAME}_search_${APP_ENV}"
CODE=0

check_acknowledgment() {
    jq '.acknowledged? == true' ${TMP_FILE} | grep 'true' >/dev/null || {
        CODE=$((CODE+=1)) ;
        echo -e "${RED_BOLD}ERROR: unexpected response from previous command:${NC}${ORANGE}"; echo ; cat "${TMP_FILE}" ; echo -e "${NC}";
    }
}

# each curl command below sees its output checked for acknowledgment from Elasticsearch, else display an error with colorized output

### SETTINGS & MAPPINGS TEMPLATE
echo ; echo "Create settings/mappings template: ${PREFIX_ES}-settings-template"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/_template/${PREFIX_ES}-settings-template?pretty" -H 'Content-Type: application/json' -d"
{
  \"index_patterns\": [\"${PREFIX_ES}-tmstp*-resource*\"],
  \"order\": 101,
  \"mappings\":
        $(cat ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/${APP_SETTINGS_NAME}/*.mapping.json)
    ,
  \"settings\":
    $(cat ${BASEDIR}/../backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/${APP_SETTINGS_NAME}/settings.json )
}
"\
> ${TMP_FILE}
check_acknowledgment
echo "You can check the state of the settings template with:"
echo "curl -s -X GET '${ES_HOST}:${ES_PORT}/_template/${PREFIX_ES}-settings-template?pretty'"

## CREATE FIRST INDEX ALIASED BY THE ROLLOVER
echo ; echo "Create index to write first in: ${PREFIX_ES}-tmstp${TIMESTAMP}-resource-index"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-resource-index?pretty" > ${TMP_FILE}
check_acknowledgment
echo "You can check the state of the aliased index with:"
echo "curl -s -X GET '${ES_HOST}:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-resource-index/?pretty'"

## CREATE SUGGESTION INDEX
echo ; echo "Create index aiming to store all suggestions: ${PREFIX_ES}-tmstp${TIMESTAMP}-suggestions-index"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-suggestions-index?pretty"\
 -H 'Content-Type: application/json' -d"
{
    \"mappings\":
        $(cat ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/suggestions.mapping.json)
        ,
    \"settings\":
            $(cat ${BASEDIR}/../backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/settings-suggestions.json)
}
"\
> ${TMP_FILE}
check_acknowledgment
echo "You can check the state of the index index with:"
echo "curl -s -X GET '${ES_HOST}:${ES_PORT}/${PREFIX_ES}-tmstp${TIMESTAMP}-suggestions-index?pretty'"

## CREATE PRIVATE SUGGESTION INDEX
echo ; echo "Create index aiming to store all suggestions: ${PREFIX_ES}-private-tmstp${TIMESTAMP}-suggestions-index"
curl -s -X PUT "${ES_HOST}:${ES_PORT}/${PREFIX_ES}-private-tmstp${TIMESTAMP}-suggestions-index?pretty"\
 -H 'Content-Type: application/json' -d"
{
    \"mappings\":
        $(cat ${BASEDIR}/../backend/src/main/resources/fr/inra/urgi/datadiscovery/domain/suggestions.mapping.json)
        ,
    \"settings\":
            $(cat ${BASEDIR}/../backend/src/test/resources/fr/inra/urgi/datadiscovery/dao/settings-suggestions.json)
}
"\
> ${TMP_FILE}
check_acknowledgment
echo "You can check the state of the index index with:"
echo "curl -s -X GET '${ES_HOST}:${ES_PORT}/${PREFIX_ES}-private-tmstp${TIMESTAMP}-suggestions-index?pretty'"

rm -f $TMP_FILE

[ $CODE -gt 0 ] && { echo "${RED_BOLD}ERROR: a problem occurred during previous steps. Found ${CODE} errors.${NC}" ; exit ${CODE} ; }

echo ; echo -e "${GREEN}${BOLD}All seems OK.${NC}"
