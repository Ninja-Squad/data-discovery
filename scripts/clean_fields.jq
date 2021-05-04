#!/usr/bin/env jq -Mf

[.[] | [ ($fields[] as $ddkey | { ($ddkey?|tostring) : .[$ddkey?]  } | select(.[$ddkey?] != null) ) ] | add ]