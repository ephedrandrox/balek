#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# Stop and start the production containers
sh "$SCRIPT_DIR/stop.sh"
sh "$SCRIPT_DIR/start.sh"
