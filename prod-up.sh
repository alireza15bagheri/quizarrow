#!/usr/bin/env bash
set -euo pipefail

# Configuration
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE="${ENV_FILE:-.env.prod}"

# Utilities
die() { echo "Error: $*" >&2; exit 1; }
info() { echo -e "\033[1;34m$*\033[0m"; }
ok()   { echo -e "\033[1;32m$*\033[0m"; }

# Pre-flight checks
command -v docker >/dev/null 2>&1 || die "Docker is not installed or not in PATH."
if ! docker compose version >/dev/null 2>&1; then
  die "Docker Compose V2 (docker compose) not available."
fi
[ -f "${COMPOSE_FILE}" ] || die "Missing ${COMPOSE_FILE} in repo root."

if [ ! -f "${ENV_FILE}" ]; then
  if [ -f ".env.prod.example" ]; then
    info "No ${ENV_FILE} found. Using .env.prod.example (values may need adjustment)."
    ENV_FILE=".env.prod.example"
  else
    die "Missing ${ENV_FILE}. Create it from .env.prod.example."
  fi
fi

dc() {
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "$@"
}

usage() {
  cat <<'EOF'
Usage: ./prod-up.sh [command]

Commands:
  up              Build images and start the production stack (default)
  update          Pull service images (if any) and restart stack
  pull            docker compose pull (no restart)
  rebuild         Rebuild images with --pull, then up -d
  down            Stop and remove containers, networks, and orphans
  logs            Tail logs (nginx, backend, db)
  ps              Show container status
  migrate         Run Django migrations
  collectstatic   Run Django collectstatic --noinput
  createsuperuser Create a Django superuser (interactive)
  shell           Open a shell in the backend container
  restart         Restart services (nginx, backend)
  prune-images    Prune dangling Docker images

Environment:
  ENV_FILE=<path>   Override env file (default: .env.prod)

Examples:
  ./prod-up.sh
  ENV_FILE=/path/to/prod.env ./prod-up.sh update
EOF
}

wait_containers() {
  # Simple readiness wait loop (optional). We just show ps for brevity.
  info "Current service status:"
  dc ps
}

cmd="${1:-up}"
case "${cmd}" in
  up|start)
    info "Building and starting production stack..."
    dc up -d --build --remove-orphans
    wait_containers
    ok "Production stack is up."
    echo "Access:"
    echo "- App via Nginx: http://<your-server-ip>/ (configure DNS/ALLOWED_HOSTS for domain)"
    echo "- API base: http://<your-domain-or-ip>/api/"
    ;;

  update)
    info "Pulling images and updating stack..."
    dc pull
    dc up -d --remove-orphans
    wait_containers
    ok "Update complete."
    ;;

  pull)
    info "Pulling service images..."
    dc pull
    ok "Pull complete."
    ;;

  rebuild)
    info "Rebuilding images with --pull..."
    dc build --pull
    info "Restarting stack..."
    dc up -d --remove-orphans
    wait_containers
    ok "Rebuild complete."
    ;;
  
  rebuild-no-cache)
    info "Rebuilding images without cache..."
    dc build --no-cache
    info "Restarting stack..."
    dc up -d --remove-orphans
    wait_containers
    ok "Rebuild without cache complete."
    ;;

  down|stop)
    info "Stopping and removing stack..."
    dc down
    ok "Stack stopped."
    ;;

  logs)
    info "Tailing logs (Ctrl+C to stop)..."
    dc logs -f nginx backend db
    ;;

  ps|status)
    dc ps
    ;;

  migrate)
    info "Running Django migrations..."
    dc exec backend python manage.py migrate --noinput
    ok "Migrations applied."
    ;;

  collectstatic)
    info "Collecting static files..."
    dc exec backend python manage.py collectstatic --noinput
    ok "Static files collected."
    ;;

  createsuperuser)
    info "Creating Django superuser (interactive)..."
    dc exec backend python manage.py createsuperuser
    ;;

  shell)
    info "Opening shell in backend (type 'exit' to leave)..."
    # Use sh because image is slim; bash may not be present.
    dc exec backend sh
    ;;

  restart)
    info "Restarting services..."
    dc restart backend nginx
    ok "Services restarted."
    ;;

  prune-images)
    info "Pruning dangling Docker images..."
    docker image prune -f
    ok "Prune complete."
    ;;

  -h|--help|help)
    usage
    ;;

  *)
    usage
    exit 1
    ;;
esac
