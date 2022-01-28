FROM postgres:13.1-alpine
ENV POSTGRES_USER postgresadmin
ENV POSTGRES_PASSWORD admin123
ENV POSTGRES_DB postgresdb
ADD table_creation.sql /docker-entrypoint-initdb.d/
