#!/bin/bash

# Stop and remove all containers from builds/docker/mysql/docker-compose.yml file
docker compose -f builds/docker/mysql/docker-compose.yml down --rmi all

# Stop and remove all containers from builds/docker/mongo/docker-compose.yml file
docker compose -f builds/docker/mongo/docker-compose.yml down --rmi all

#remove all files in build/docker/mysql/data
rm -rf builds/docker/mysql/mysqlDB/*
#remove all files in build/docker/mongo/data
rm -rf builds/docker/mongo/mongoDB/*

