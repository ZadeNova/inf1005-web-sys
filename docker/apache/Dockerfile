# # ============================================================
# # Vapour FT — LAMP Dockerfile (Apache + PHP 8.2)
# # Replaces the old php:8.2-fpm + nginx two-container setup
# # with a single php:8.2-apache container.
# # ============================================================

# # ── Stage 1: Composer dependency resolution ──────────────────
# FROM composer:2.7 AS composer-build

# WORKDIR /app

# COPY backend/composer.json backend/composer.lock ./

# RUN composer install \
#     --no-dev \
#     --no-scripts \
#     --no-autoloader \
#     --ignore-platform-reqs

# COPY backend/ .

# RUN composer dump-autoload --optimize --no-dev

# # ── Stage 2: Apache + PHP runtime ────────────────────────────
# FROM php:8.2-apache

# # Install PHP extensions needed by Slim + PDO
# RUN apt-get update && apt-get install -y \
#         zip \
#         unzip \
#     && docker-php-ext-install pdo pdo_mysql \
#     && apt-get clean \
#     && rm -rf /var/lib/apt/lists/*

# # Enable mod_rewrite for .htaccess URL rewriting (critical for Slim)
# RUN a2enmod rewrite

# # Point Apache's DocumentRoot to /var/www/public
# # This is equivalent to nginx's "root /var/www/public;"
# ENV APACHE_DOCUMENT_ROOT=/var/www/public

# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
#     /etc/apache2/sites-available/000-default.conf

# RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
#     /etc/apache2/apache2.conf

# # Allow .htaccess overrides (AllowOverride All) in the document root
# # Without this, Apache ignores .htaccess files entirely
# RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' \
#     /etc/apache2/apache2.conf

# WORKDIR /var/www

# # Copy vendor + backend app from the composer build stage
# COPY --from=composer-build /app /var/www/backend

# EXPOSE 80



# ============================================================
# Vapour FT — Production Dockerfile
# Stage 1: Composer (PHP deps)
# Stage 2: Node (Frontend build)
# Stage 3: Apache + PHP runtime
# ============================================================

# ── Stage 1: Composer ────────────────────────────────────────
FROM composer:2.7 AS composer-build
WORKDIR /app
COPY backend/composer.json backend/composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --ignore-platform-reqs
COPY backend/ .
RUN composer dump-autoload --optimize --no-dev

# ── Stage 2: Node (Frontend build) ───────────────────────────
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
COPY public/ /public/
RUN npm run build

# ── Stage 3: Apache + PHP runtime ────────────────────────────
FROM php:8.2-apache
RUN apt-get update && apt-get install -y \
        zip \
        unzip \
    && docker-php-ext-install pdo pdo_mysql \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*
RUN a2enmod rewrite
ENV APACHE_DOCUMENT_ROOT=/var/www/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/000-default.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/apache2.conf
RUN sed -ri -e 's/AllowOverride None/AllowOverride All/g' \
    /etc/apache2/apache2.conf
WORKDIR /var/www
COPY --from=composer-build /app /var/www/backend
# Copy public dir first (images, static files)
COPY public/ /var/www/public/
# Copy built frontend assets on top (so bundle isn't wiped)
COPY --from=frontend-build /public/assets /var/www/public/assets