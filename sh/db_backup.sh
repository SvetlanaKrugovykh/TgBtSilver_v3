cd ~/.db_backup
export PGPASSWORD='your_password'
pg_dump -U postgres -d payments -h localhost -p 5432 > paym_$(date +\%Y-\%m-\%d).sql

# CREATE DATABASE payments
# WITH ENCODING='UTF8'
# LC_COLLATE='uk_UA.utf8'
# LC_CTYPE='uk_UA.utf8'
# TEMPLATE=template0;

# CREATE DATABASE payments
# WITH ENCODING='UTF8'
# LC_COLLATE='en_US.utf8'
# LC_CTYPE='en_US.utf8'
# TEMPLATE=template0;

