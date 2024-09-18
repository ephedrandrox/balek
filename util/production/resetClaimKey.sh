#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

sh "$SCRIPT_DIR/stop.sh"
sh "$SCRIPT_DIR/removeOwnerDeviceFromProduction.sh"
sh "$SCRIPT_DIR/start.sh"



