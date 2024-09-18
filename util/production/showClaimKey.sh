#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"
# if argument provided, set it to hostname, otherwise set to ""
if [ -z "$1" ]; then
    echo "No argument provided. Setting hostname to empty string."
    HOSTNAME=""
else
    echo "Setting hostname to $1"
    HOSTNAME="$1"
fi

# Bring up the container
docker compose -f "$DOCKER_COMPOSE_FILE"  exec -T digiscan npm run showClaimKey "$HOSTNAME"
