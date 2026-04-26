from pathlib import Path
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv(os.path.join(Path(__file__).resolve().parent.parent, '.env'))

# Base directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Secret key - loaded from .env file.
SECRET_KEY = os.environ.get('SECRET_KEY', 'fallback-insecure-key-for-dev-only')

# Debug mode - True in development, False in production
DEBUG = os.environ.get('DEBUG', 'True') == 'True'


ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# All the apps Django needs to know about
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third party apps
    'rest_framework',
    'corsheaders',
    # Our apps
    'tracker',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # serves static files
    'corsheaders.middleware.CorsMiddleware',        # allows React to talk to Django
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database - connected to your PostgreSQL database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME':     os.environ.get('DB_NAME', 'canadavisatracker'),
        'USER':     os.environ.get('DB_USER', 'cvtuser'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST':     os.environ.get('DB_HOST', 'localhost'),
        'PORT':     os.environ.get('DB_PORT', '5432'),
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'America/Toronto'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS - allows your React frontend on localhost:3000 to call this Django API
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
]

# Django REST Framework settings
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}
