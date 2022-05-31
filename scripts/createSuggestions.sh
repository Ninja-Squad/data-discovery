#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
ORANGE='\033[0;33m'
BOLD='\033[1m'
RED_BOLD="${RED}${BOLD}"
NC='\033[0m' # No format

APPS="rare, brc4env, wheatis, faidare"

help() {
	cat <<EOF
DESCRIPTION: 
    The idea of this script is to generate ready to index bulk files, containing terms to suggest into the
    DataDiscovery application.
    The workflow is the following:
    -> decompress data files in parallel
      -> for each file:
        -> decompressed stream is duplicated towards 2 sub processes via tee command
          -> JQ parsing to extract and analyze keyword fields such as name, species and so on.
            -> using sed then lowercase with tr then sort uniquely (to reduce the output size, most of the fields
                 content is duplicated in documents)
          -> JQ parsing to extract description, parse and analyze it.
            -> using sed then lowercase with tr then sort uniquely (to reduce the output size, descriptions containing
                 many duplicated content)
          -> default tee stdout is redirected to /dev/null to avoid output of whole uncompressed data in the next steps
        -> both process output are then merged by sort -u command (to reduce the output size)
    -> output of all processed files are then again sorted uniquely to remove duplicates found in several files
    -> last step is the generation of bulk files
      -> in parallel, but on the fly, the data is splitted in chunks and each data line sees inserted before it a bulk
           action-metadata line
      -> then, the output is redirected to compressed files
        Script used to create index and aliases for Data Discovery portals (RARe, WheatIS and DataDiscovery)

USAGE:
	$0 -app <application name> -data <data directory> [-h|--help]

PARAMS:
	-app           the application for which to create the suggestions: $APPS
	-data          the data directory in which the JSON files can be found and the suggestion files will be generated (e.g. /mnt/index-data-is/[app])
	               NB: use rare directory for brc4env
	-h or --help   print this help

EOF
	exit 1
}

check_command() {
	command -v $1 >/dev/null || {
		echo -e "${RED_BOLD}Program $1 is missing, cannot continue...${NC}"
		return 1
	}
	return 0
}

MISSING_COUNT=0
check_command jq || ((MISSING_COUNT += 1))
check_command tr || ((MISSING_COUNT += 1))
check_command sed || ((MISSING_COUNT += 1))
check_command tee || ((MISSING_COUNT += 1))
check_command sort || ((MISSING_COUNT += 1))
check_command paste || ((MISSING_COUNT += 1))
check_command gunzip || ((MISSING_COUNT += 1))
check_command parallel || ((MISSING_COUNT += 1))

[ $MISSING_COUNT -ne 0 ] && {
	echo -e "${RED_BOLD}Please, install the $MISSING_COUNT missing program(s). Exiting.${NC}"
	exit $MISSING_COUNT
}

# any params
[ -z "$1" ] && echo -e "${RED_BOLD}ERROR: no parameters have been provided.${NC}" && help

# get params
while [ -n "$1" ]; do
	case $1 in
		-h) help;shift 1;;
		--help) help;shift 1;;
		-app) APP_NAME=$2;shift 2;;
		-data) DATADIR=$2;shift 2;;
		--) shift;break;;
		-*) echo -e "${RED_BOLD}Unknown option: $1 ${NC}\n"&& help && echo;exit 1;;
		*) break;;
	esac
done

if  [ -z "${APP_NAME}" ] || [[ ${APPS} != *${APP_NAME}* ]] ; then
	echo -e "${RED_BOLD}ERROR: app parameter is mandatory: the value is empty or invalid!${NC}"
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

SCRIPT_DIR=$(dirname "$0")
DEFAULT_FILTER_DATA_SCRIPT="${SCRIPT_DIR}/filters/noop_filter.jq"
WHEATIS_FILTER_DATA_SCRIPT=${DEFAULT_FILTER_DATA_SCRIPT}
FAIDARE_FILTER_DATA_SCRIPT=${DEFAULT_FILTER_DATA_SCRIPT}
RARE_FILTER_DATA_SCRIPT=${DEFAULT_FILTER_DATA_SCRIPT}
BRC4ENV_FILTER_DATA_SCRIPT="${SCRIPT_DIR}/filters/pillar_filter_brc4env.jq"

WHEATIS_FIELDS_TO_EXTRACT=".node , .databaseName , .name , .entryType , [.species]"
FAIDARE_FIELDS_TO_EXTRACT=".node , .databaseName , .name , .entryType , [.species]" #, germplasmList, taxonGroup"
RARE_FIELDS_TO_EXTRACT=".pillarName , .databaseSource , .name , .domain, .taxon, .biotopeType, .materialType, .countryOfOrigin, .countryOfCollect"
BRC4ENV_FIELDS_TO_EXTRACT=${RARE_FIELDS_TO_EXTRACT}

# get app name to upper case, (i.e. rare -> RARE)
APP_VAR=$(eval echo $APP_NAME | tr '[a-z]' '[A-Z]')
# get values for app (i.e. get $RARE_FILTER_DATA_SCRIPT for RARE FILTER_DATA_SCRIPT var)
FILTER_DATA_SCRIPT=$(eval "echo \$$(eval echo $APP_VAR'_FILTER_DATA_SCRIPT')")
FIELDS_TO_EXTRACT=$(eval "echo \$$(eval echo $APP_VAR'_FIELDS_TO_EXTRACT')")
export FILTER_DATA_SCRIPT FIELDS_TO_EXTRACT

extract_suggestions() {
	if [[ $PUBLIC_ONLY -eq 1 ]] ; then
		GROUP_FILTER="jq '.[] | select(.groupId == 0 or .groupId == null) | [.]' |"
	else
		GROUP_FILTER=""
	fi
	
	bash -c "set -o pipefail; gunzip -c $1 |                        # tee below allows to redirect gunzip stdout to several processes using: >(subprocess)
	${GROUP_FILTER}													# add a filter based on groupId field to get only public data if needed (only for faidare)
	jq -rc -f ${FILTER_DATA_SCRIPT} |                               # add a filter on some data if needed (noop by default, only brc4env pillar for brc4env)
	tee \
		>(
			jq -r '.[]| [ ${FIELDS_TO_EXTRACT} ] | flatten' |
			sed -r '
				s/\"//g ;                                           # remove double quotes
				s/,$//g ;                                           # remove line ending commas
				s/[][]//g ;                                         # remove brackets
				s/^[[:space:].-]*//g ;                              # remove leading spaces, dashes and dots
				s/[_-]$//g ;                                        # remove trailing dash and underscore
				/^$/d ;                                             # drop empty lines
				/^.{0,2}$/d ;                                       # drop words which length is lower than 3
				/^[0-9:#]{2,}/d ;                                   # drop words starting with at least 2 digits or some special characters
			' |
			tr '[:upper:]' '[:lower:]' | LC_ALL=C sort -u
		) \
		>/dev/null \
		>(
			jq '.[]|.description' |
			sed -r '
				s/\\n/\n/g ;                                        # split on all literal backslash+n (\n)
				s/__/\n/g ;                                         # split on double underscores
				s/\.\s/\n/g ;                                       # split on dot followed by space
				s/[^[:alnum:]\._-]/\n/g ;                           # split on any special character except underscore dot and dash (only keep sequences of alphanum+dot+underscore+dash)
			' |                                                     # above sed is separated from the one below since the first splits lines and would interfere with changes and line drops if both were merged
			sed -r '
				s/^[[:space:].-]*//g ;                              # remove leading spaces, dashes and dots
				s/[_-]$//g ;                                        # remove trailing dash and underscore
				/^.{0,2}$/d ;                                       # drop words which length is lower than 3
				/^[^[:alpha:]]*[[:alpha:]]{,1}[^[:alpha:]]*$/d ;    # drop words having only 0 or 1 alphabetical characters rounded by non alphabetical characters (such as: _0001G000023), considering them as not relevant
				/^[0-9]{2,}/d ;                                     # drop words starting with at least 2 digits
				/_[0-9]{4,}_/d ;                                    # drop words containing sequence of at least 4 digits, rounded by underscores
				/match_part/d ;                                     # drop words containing match_part literal
				/mp[0-9]{4,}/d ;                                    # drop words containing mp literal followed by sequence of at least 4 digits
				/match[0-9]{4,}/d ;                                 # drop words containing match literal followed by sequence of at least 4 digits
				/^_.*/d ;                                           # drop words starting by an underscore
				/^[ATGCatgc]+$/d ;                                  # drop sequence of nucleotides (sequence of ATGC case insensitive)
				/^0.*/d ;                                           # drop words starting with a 0
			' |
			tr '[:upper:]' '[:lower:]' |
			LC_ALL=C sort -u
		) |
	LC_ALL=C sort -u"
}
export -f extract_suggestions

process_suggestions() {
	[ ! -d "${DATADIR}/${SUGGESTION_DIR}" ] && echo "Creating missing directory:" && mkdir -v "${DATADIR}/${SUGGESTION_DIR}"
	
	time find ${DATADIR}/data -maxdepth 2 -name "*.gz" | parallel --bar extract_suggestions | \
	LC_ALL=C sort -u | \
	parallel --pipe -k \
		"sed -r 's/(.*)$/{ \"index\": { }}\n{ \"suggestions\": \"\1\" }/g ; # insert ES bulk metadata above each JSON array
		         s/[\\]+\"/\"/g'                                            # remove any backslash before double quote to prevent any malformed JSON
		"| \
	parallel --blocksize 10M --pipe -l 1000 "gzip -c > ${DATADIR}/${SUGGESTION_DIR}/${APP_NAME}_bulk_{#}.gz"
}

if [ "${APP_NAME}" == "faidare" ]; then
	export SUGGESTION_DIR="private-suggestions"
	export PUBLIC_ONLY=0
	process_suggestions
	
	export SUGGESTION_DIR="suggestions"
	export PUBLIC_ONLY=1
	process_suggestions
else
	export SUGGESTION_DIR="suggestions"
	export PUBLIC_ONLY=0
	process_suggestions
fi
