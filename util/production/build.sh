#!/bin/bash

# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# Execute the docker compose build command
docker compose -f "$DOCKER_COMPOSE_FILE" build