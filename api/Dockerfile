# Base: shared PHP extensions
FROM php:8.5-fpm-alpine AS base

RUN apk add --no-cache postgresql-dev curl \
    && docker-php-ext-install pdo pdo_pgsql opcache

RUN curl -sS https://getcomposer.org/installer \
    | php -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www

COPY composer.json composer.lock ./
RUN composer install --no-scripts --no-autoloader

COPY . .
RUN composer dump-autoload --optimize

# Local: artisan serve with debug
FROM base AS local

RUN cp .env.example .env && php artisan key:generate --force

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# Staging: php-fpm, dev dep stripped
FROM base AS staging

RUN composer install --no-dev --optimize-autoloader \
    && php artisan key:generate --force \
    && php artisan config:cache \
    && php artisan route:cache

EXPOSE 9000
CMD ["php-fpm"]

# Production: php-fpm hardened with opcache
FROM base AS prod

RUN composer install --no-dev --optimize-autoloader \
    && php artisan key:generate --force \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

EXPOSE 9000
CMD ["php-fpm"]
