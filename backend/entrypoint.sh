#!/usr/bin/env bash
set -euo pipefail

wait_for_db() {
  if [ -n "${DB_HOST:-}" ]; then
    echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT:-5432}..."
    for i in {1..60}; do
      if nc -z "${DB_HOST}" "${DB_PORT:-5432}"; then
        echo "PostgreSQL is up."
        return
      fi
      sleep 1
    done
    echo "ERROR: Timed out waiting for PostgreSQL."
    exit 1
  fi
}

django_manage() {
  python manage.py "$@"
}

main() {
  export DJANGO_SETTINGS_MODULE="${DJANGO_SETTINGS_MODULE:-config.settings}"

  wait_for_db

  echo "Applying migrations..."
  django_manage migrate --noinput

  # Collect static only if enabled and not in debug
  DEBUG_LC=$(printf "%s" "${DEBUG:-0}" | tr '[:upper:]' '[:lower:]')
  if [ "${DJANGO_COLLECTSTATIC:-1}" != "0" ] && [ "${DEBUG_LC}" != "1" ] && [ "${DEBUG_LC}" != "true" ]; then
    echo "Collecting static files..."
    django_manage collectstatic --noinput
  else
    echo "Skipping collectstatic (DEBUG=${DEBUG_LC}, DJANGO_COLLECTSTATIC=${DJANGO_COLLECTSTATIC:-1})"
  fi

  if [ "${DEBUG_LC}" = "1" ] || [ "${DEBUG_LC}" = "true" ]; then
    echo "Starting Django development server..."
    exec python manage.py runserver 0.0.0.0:8000
  else
    echo "Starting Gunicorn..."
    WORKERS="${GUNICORN_WORKERS:-3}"
    exec gunicorn config.wsgi:application \
      --workers "${WORKERS}" \
      --bind 0.0.0.0:8000 \
      --access-logfile '-' \
      --error-logfile '-'
  fi
}

main "$@"