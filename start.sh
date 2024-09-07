#!/bin/bash

# Bring up the container
docker compose -f builds/digiscan/docker-compose.yml up -d
docker compose -f builds/digiscan/docker-compose.yml exec -T digiscan npm run showAdminDeviceInvitation