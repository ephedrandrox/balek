#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

#remove all files in Docker data directory
echo "Removing all files in Docker data directory"
echo "sudo rm -rf $DOCKER_DATA_DIR/*"



sudo rm -rf "$DOCKER_DATA_DIR/*"

