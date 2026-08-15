#!/bin/bash
set -euo pipefail
export PATH=/usr/local/mysql/bin:/usr/local/opt/mysql/bin:$PATH

NEW_PASS='Priya@1229'

echo "==> Stopping all MySQL processes..."
brew services stop mysql 2>/dev/null || true
pkill -9 mysqld 2>/dev/null || true
pkill -9 mysqld_safe 2>/dev/null || true
sleep 2
rm -f /tmp/mysql.sock /tmp/mysql.sock.lock /tmp/mysqlx.sock /tmp/mysqlx.sock.lock
rm -f /usr/local/mysql/data/*.pid /usr/local/var/mysql/*.pid 2>/dev/null || true

echo "==> Starting official MySQL in recovery mode..."
sudo -u _mysql /usr/local/mysql/bin/mysqld \
  --basedir=/usr/local/mysql \
  --datadir=/usr/local/mysql/data \
  --plugin-dir=/usr/local/mysql/lib/plugin \
  --user=_mysql \
  --skip-grant-tables \
  --skip-networking \
  >/tmp/mysql-reset.log 2>&1 &

for i in $(seq 1 30); do
  if [ -S /tmp/mysql.sock ]; then
    echo "==> Socket ready"
    break
  fi
  sleep 1
done

if [ ! -S /tmp/mysql.sock ]; then
  echo "ERROR: MySQL socket not created. Log:"
  cat /tmp/mysql-reset.log
  exit 1
fi

echo "==> Setting root password..."
mysql --protocol=SOCKET --socket=/tmp/mysql.sock -u root <<SQL
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${NEW_PASS}';
CREATE DATABASE IF NOT EXISTS app_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
FLUSH PRIVILEGES;
SQL

echo "==> Restarting MySQL normally..."
mysqladmin --protocol=SOCKET --socket=/tmp/mysql.sock -u root shutdown || true
sleep 2
pkill -9 mysqld 2>/dev/null || true
sleep 2

/usr/local/mysql/support-files/mysql.server start
sleep 4

echo "==> Verifying..."
mysql -u root -p"${NEW_PASS}" -h 127.0.0.1 -e "SELECT 'password_ok' AS status; SHOW DATABASES LIKE 'app_db';"
echo "==> Done. root password is: ${NEW_PASS}"
