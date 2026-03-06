FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/backend

# Copy backend files
COPY ../../backend .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

EXPOSE 9000