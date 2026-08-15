FROM php:8.2-fpm

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    git \
    curl \
    unzip \
    zip \
    nodejs \
    npm \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    && docker-php-ext-configure gd \
       --with-freetype \
       --with-jpeg \
    && docker-php-ext-install \
       pdo_mysql \
       mbstring \
       exif \
       pcntl \
       bcmath \
       gd \
       zip

RUN echo "upload_max_filesize=100G" >> /usr/local/etc/php/conf.d/uploads.ini
RUN echo "post_max_size=100G" >> /usr/local/etc/php/conf.d/uploads.ini
RUN echo "max_execution_time=36000" >> /usr/local/etc/php/conf.d/uploads.ini
RUN echo "max_input_time=36000" >> /usr/local/etc/php/conf.d/uploads.ini
RUN echo "memory_limit=1024M" >> /usr/local/etc/php/conf.d/uploads.ini

RUN pecl install redis \
    && docker-php-ext-enable redis

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . .

RUN if [ -f .env.example ] && [ ! -f .env ]; then cp .env.example .env; fi

RUN composer install --no-dev --optimize-autoloader

RUN npm install
RUN npm run build

CMD ["php-fpm"]
