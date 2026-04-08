# Base: shared PHP extensions
FROM php:8.5-fpm-alpine AS base

RUN apk add --no-cache postgresql-dev curl linux-headers $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_pgsql \
    && docker-php-ext-enable opcache 2>/dev/null || true \
    && pecl install pcov \
    && docker-php-ext-enable pcov \
    && echo "opcache.jit=0" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini

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

COPY --from=docker-context entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["entrypoint.sh"]
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]

# Staging: php-fpm, dev deps stripped
FROM base AS staging

COPY --from=docker-context entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN composer install --no-dev --optimize-autoloader \
    && php artisan key:generate --force \
    && php artisan config:cache \
    && php artisan route:cache

EXPOSE 9000
ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]

# Production: php-fpm hardened with opcache
FROM base AS prod

COPY --from=docker-context entrypoint.sh /usr/local/bin/entrypoint.sh
COPY --from=docker-context php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
RUN chmod +x /usr/local/bin/entrypoint.sh

RUN composer install --no-dev --optimize-autoloader \
    && php artisan key:generate --force \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache

RUN chown -R www-data:www-data /var/www \
    && chmod -R 755 /var/www/storage

EXPOSE 9000
ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
