#!/bin/bash

# Remove Owner Device File
sh util/removeOwnerFileFromProduction.sh

sh util/resetProductionContainers.sh

sh start.sh
