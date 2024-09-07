#!/bin/bash

# Stop and remove all containers from builds/docker/mysql/docker-compose.yml file
docker compose -f builds/digiscan/docker-compose.yml down --rmi all
docker compose -f builds/digiscan/docker-compose.yml build


#remove all files in build/digiscan/data
sudo rm -rf builds/digiscan/data/*

