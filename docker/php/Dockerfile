FROM php:8.2-apache
RUN apt update
RUN apt install -qq -y vim git unzip iputils-ping libpq-dev sudo net-tools p7zip-full libzip-dev
ENV PHP_MEMORY_LIMIT=256M
VOLUME /var/www/html
RUN pecl install xdebug-3.3.2 && docker-php-ext-enable xdebug
RUN docker-php-ext-install pdo pdo_pgsql
COPY docker/php/000-default.conf /etc/apache2/sites-available/000-default.conf
RUN mkdir ~/.ssh
RUN a2enmod rewrite