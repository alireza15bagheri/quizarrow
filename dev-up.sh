#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.dev"
if [ ! -f "${ENV_FILE}" ] && [ -f ".env.dev.example" ]; then
  echo "No ${ENV_FILE} found. Using .env.dev.example (values may need adjustment)."
  ENV_FILE=".env.dev.example"
fi

has_watch() {
  docker compose watch --help >/dev/null 2>&1
}

cmd=${1:-}
case "${cmd}" in
  --watch|-w)
    echo "Starting dev stack with docker compose watch (live sync/rebuild)..."
    exec docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" watch
    ;;
  "" )
    echo "Building images and starting dev stack..."
    docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" up -d --build --remove-orphans
    echo "Done."
    echo "- Backend: http://localhost:8000"
    echo "- Frontend: http://localhost:5173"
    if has_watch; then
      echo
      echo "Tip: run './dev-up.sh --watch' for live rebuild/sync on changes."
    fi
    ;;
  *)
    echo "Usage: $0 [--watch]"
    exit 1
    ;;
esac