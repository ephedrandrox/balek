#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# Run The Database Report Utilities on the Production Container
docker compose -f "$DOCKER_COMPOSE_FILE"  exec -T digiscan node util/mysqlReport.js
docker compose -f "$DOCKER_COMPOSE_FILE"  exec -T digiscan node util/mongoReport.js
