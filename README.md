# Software_Containerization

Database image:
- created by rebuilding the image described at https://github.com/aa8y/docker-dataset with only the world database
- pushed to raduge/postgres-world in docker hub
- simplest DB available, just a list of countries and some cities in them, should be enough i hope
- some docs here: https://dev.mysql.com/doc/world-setup/en/world-setup-installation.html

Steps to actually pre-populate:
- need to connect to running pod using kubectl and manually run the world.sql script under the /docker-entrypoint-initdb.d directory
- due to the persistent volume it seems stable even if i manually remove the deployment/service

Steps to run service/deployment:
- basically 'kubectl apply -f <any .yaml file in the directoy>' one by one


IGNORE ALL THAT

psql -h 10.152.183.106 -U postgresadmin -p 5432 postgresdb
pwd: admin123
