#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# Stop and remove all containers Docker Compose file
docker compose -f "$DOCKER_COMPOSE_FILE" down --rmi all
docker compose -f "$DOCKER_COMPOSE_FILE" build


