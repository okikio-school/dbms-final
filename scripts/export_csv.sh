#!/bin/bash
read -sp "Connection URL: " PGCONNECTION_URL

# List of all tables you want to export
TABLES=(
  assets
  comments
  contentversions
  follows
  members
  permissions
  postassets
  postreads
  posts
  rolepermissions
  roles
  slugs
  tags
  tagstoposts
  userroles
  users
   # ... add as many tables as you have
)

mkdir -p ./exports

for TABLE in "${TABLES[@]}"; do
  psql "$PGCONNECTION_URL" -c "\COPY $TABLE TO './exports/${TABLE}.csv' DELIMITER ',' CSV HEADER;"
done
