from pathlib import Path
import environ
import os

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))
DEBUG=env.bool("DEBUG", default=False)
SECRET_KEY=env("SECRET_KEY")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # third-party
    "rest_framework",
    # local apps
    "accounts",
    "game",
]

MIDDLEWARE = [
    # CORS and exception handling early so preflight/JSON errors are consistent
    "config.middleware.SimpleCORSMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    # Logging after auth so we can attribute user
    "config.middleware.APILoggingMiddleware",
    # Last chance API exception guard for JSON shape on /api/*
    "config.middleware.APIExceptionMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Useful when hitting backend directly from http://localhost:5173 during dev
# and for future deployments (add your prod origins here or via env)
def _split_env_list(name, default=""):
    raw = os.getenv(name, default)
    return [x.strip() for x in raw.split(",") if x.strip()]

# CSRF trusted origins (dev + optional env)
CSRF_TRUSTED_ORIGINS = list({
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",      # vite preview (http)
    "https://localhost:5173",     # if using https locally
    *(_split_env_list("CSRF_TRUSTED_ORIGINS"))
})

# Cookie behavior: good defaults for local dev proxying
SESSION_COOKIE_SAMESITE = "Lax"
CSRF_COOKIE_SAMESITE = "Lax"
# Keep CSRF cookie accessible to JS (X-CSRFToken header)
CSRF_COOKIE_HTTPONLY = False

# Media for question images
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# DRF baseline
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}

# API/CORS config (simple, dependency-free CORS for API/WS in dev/prod)
API_PATH_PREFIXES = ["/api", "/ws"]
CORS_ALLOWED_ORIGINS = list({
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    *(_split_env_list("CORS_ALLOWED_ORIGINS"))
})
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = ["Content-Type", "X-CSRFToken"]
CORS_ALLOW_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]

# Use a JSON CSRF failure view so frontend can handle errors uniformly
CSRF_FAILURE_VIEW = "accounts.views.csrf_failure_view"

# Logging: concise API request logs in dev
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "api": {
            "format": "%(asctime)s | %(levelname)s | %(message)s"
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "api",
        }
    },
    "loggers": {
        "api": {
            "handlers": ["console"],
            "level": "DEBUG" if DEBUG else "INFO",
            "propagate": False,
        },
    },
}
