#!/bin/bash

# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# Remove Owner Device File
sh "$SCRIPT_DIR/removeOwnerDeviceFromProduction.sh"
# Stop and remove all containers Docker Compose file
sh "$SCRIPT_DIR/resetDocker.sh"
# Build Production Containers
sh "$SCRIPT_DIR/build.sh"
# Start Production Containers
sh "$SCRIPT_DIR/start.sh"
