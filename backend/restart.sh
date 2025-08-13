#!/bin/sh

# Clean up unused Docker resources
yes | docker builder prune --all
yes | docker system prune --volumes

# Build and start containers in the background
docker-compose build --no-cache
docker-compose up

# Show logs (optional — remove if you don’t want logs to stream)
docker-compose logs -f
