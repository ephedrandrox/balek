#!/bin/bash

# Include the common paths
source "$(dirname "${BASH_SOURCE[0]}")/common_paths.sh"

# Function to check if a Docker image exists locally
image_exists() {
    local image="$1"
    docker image inspect "$image" > /dev/null 2>&1
}

# Read the Docker Compose file to get the list of images
IMAGES=$(docker compose -f "$DOCKER_COMPOSE_FILE" config | grep 'image:' | awk '{print $2}')

# Check each image and build if it does not exist
echo "Checking if Docker images are built..."
for image in $IMAGES; do
    if image_exists "$image"; then
        echo "Image $image already exists. Skipping build."
    else
        echo "Image $image does not exist. Building..."
        docker compose -f "$DOCKER_COMPOSE_FILE" build "$image"
    fi
done

# Bring up the services in detached mode
echo "Starting the Docker services..."
docker compose -f "$DOCKER_COMPOSE_FILE" up -d

echo "Docker services are up and running."
