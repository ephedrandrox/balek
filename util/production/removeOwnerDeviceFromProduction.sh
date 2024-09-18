#!/bin/bash
# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"
# Remove Owner Device File
if [ -e "$OWNER_DEVICE_FILE" ]; then
    echo "Removing Owner Device File..."
    rm -rf "$OWNER_DEVICE_FILE"
    echo "Owner Device File Removed Successfully."
else
    echo "Owner Device File does not exist. No action needed."
fi