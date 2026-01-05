FROM php:8.1-apache

# base
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    git \
    gnupg \
    iputils-ping

# git
RUN git config --global --add safe.directory /var/www/html

# install PHP extensions manager
ADD --chmod=0755 https://github.com/mlocati/docker-php-extension-installer/releases/download/2.9.24/install-php-extensions /usr/local/bin/

# [production] PHP extensions
RUN install-php-extensions \
    bcmath \
    calendar  \
    exif \
    ftp \
    gd \
    gettext \
    imagick \
    imap \
    intl \
    mysqli \
    mysqlnd \
    opcache \
    pcntl \
    pdo_mysql \
    sockets \
    xsl \
    zip

# [development] PHP extensions
RUN install-php-extensions \
    xdebug

# create a cache folder for different tools
RUN mkdir -p /var/www/.cache
RUN chown -R www-data:www-data /var/www/.cache

# install PHIVE
RUN mkdir -p /var/www/.phive
RUN chown -R www-data:www-data /var/www/.phive
ENV PHIVE_HOME=/var/www/.phive
ADD --chmod=0755 https://github.com/phar-io/phive/releases/download/0.16.0/phive-0.16.0.phar /usr/local/bin/phive
ENV PATH="$PATH:/var/www/html/tools"

# PHP config
RUN mv "$PHP_INI_DIR/php.ini-development" "$PHP_INI_DIR/php.ini"

# custom PHP config (config files are scanned in alphabetical order)
COPY ./php.ini /usr/local/etc/php/conf.d/z-001-php.ini

# XDebug config
COPY ./.dev/xdebug.ini /usr/local/etc/php/conf.d/z-002-xdebug.ini

# apache modules
RUN a2enmod ssl rewrite

# vhost
COPY ./.dev/vhost.conf /etc/apache2/sites-available/vhost.conf
RUN a2ensite vhost.conf

EXPOSE 80 443
