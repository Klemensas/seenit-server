#!/bin/bash

set -o allexport
source .env
set +o allexport

pg_dumpall ${DB_CONNECTION} | gzip -9 > /var/db/dump_`date +%Y-%m-%d`.gz && gdrive upload -p ${DRIVE_API_KEY} --delete /var/db/dump_`date +%Y-%m-%d`.gz