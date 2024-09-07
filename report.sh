#!/bin/bash

docker compose -f builds/digiscan/docker-compose.yml exec -T digiscan npm run databaseReport