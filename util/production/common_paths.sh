SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UTIL_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
DOCKER_COMPOSE_FILE="$REPO_ROOT/builds/digiscan/docker-compose.yml"
DOCKER_DATA_DIR="$REPO_ROOT/builds/digiscan/data"
BALEK_CONFIG_DIR="$REPO_ROOT/builds/digiscan/config/balek"
OWNER_DEVICE_FILE="$BALEK_CONFIG_DIR/ownerDevice.json"

