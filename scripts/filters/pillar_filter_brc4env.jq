#!/usr/bin/env jq -Mf

# Apply a filter to only select BRC4Env related documents

[
    .[] | select(.pillarName == "Pilier Environnement")
]