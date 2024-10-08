#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# run the addDevice.js script on the production container with arguments passed to this script
docker compose -f "$DOCKER_COMPOSE_FILE"  exec -T digiscan node util/database/addDevice.js "$@"
