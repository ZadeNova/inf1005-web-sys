# FROM php:8.2-fpm

# RUN apt-get update && apt-get install -y \
#     git \
#     curl \
#     zip \
#     unzip \
#     && apt-get clean

# # Critical — without this PDO queries won't work
# RUN docker-php-ext-install pdo pdo_mysql

# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# WORKDIR /var/www/backend

# EXPOSE 9000

# composer dependency resolution
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

# Production PHP-fpm runtime
FROM php:8.2-fpm-alpine


# Install OS dependencies and php extensions 
RUN apk add --no-cache \
        zip \
        unzip \
    && docker-php-ext-install pdo pdo_mysql \
    && rm -rf /var/cache/apk/*

RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /var/www/backend

# Copy vendor + app from the build stage (no Composer binary in final image)
COPY --from=composer-build --chown=appuser:appgroup /app /var/www/backend

USER appuser

EXPOSE 9000
