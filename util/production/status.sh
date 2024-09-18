#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# Bring up the container
docker compose -f "$DOCKER_COMPOSE_FILE"  ps
