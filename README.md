# Software_Containerization

# 1. Persistent DB Layer - not visible outside cluster

- we extend the official postgres image by adding an init sql script that creates the person table
- pushed to raduge/postgres-person-db

- to run the DB deployment, you have to:
a. run: sudo mkdir -p /opt/project/persistent_data
b. run: kubectl apply -f <postgres-*.yaml>
this has to be done in order: storage, config, secret, service, deployment
c. you can now connect to the db in the cluster:
psql -h 10.152.183.13 -U postgresadmin --password -p 5432 postgresdb
    with password: admin123

you can do a \dt and see that the person table is created

- other useful info:

POSTGRES_USER postgresadmin
POSTGRES_PASSWORD admin123
POSTGRES_DB postgresdb

# 2. REST API - not visible outside cluster

- I changed the app.py script a bit so that environment variables such as DB IP, PORT, passwords are retrieved automatically
- pushed this to a new image: raduge/rest-api
- changed deployment for rest-api so that POSTGRES env vars are propagated

Steps to run:
- kubectl apply: service first!, deployment (make sure that persistent layer is already up and running, otherwise env variables will not sync)

        10) Now, type in a terminal again the same command 'microk8s kubectl get svc', and look for the cluster-ip of rest-api-service. 

        11) You can now start doing CRUD requests via http://ip_of_the_cluster:port_of_the_cluster/.

TODO:
- improve code to handle errors etc/maybe refine stuff if needed

# 3. WEB APP -

Only needed if docker image is changed:
- need to install node, npm
- created a new project using: ng new project-front-end (don't need to do this)
- navigate to project directory and run using: ng serve

 TODO:
- maybe improve UI a bit? other than that, at the moment manual reload is needed after put/delete/post, maybe we can do it automatically
- maybe we should implement error handling and stuff like that?

- need to:
microk8s enable metallb
    and give an ip range: 10.50.100.5-10.50.100.25
microk8s enable ingress
microk8s enable dns
edit /etc/hosts to add app url to DNS (use kubectl get ingress and then put the ip address in /etc/hosts and then the app name, see line 3)

adu@kube-master-gui:/etc$ cat /etc/hosts
#127.0.0.1	localhost
127.0.1.1	kube-master-gui
127.0.0.1	group31app.com

The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters

after TLS secret creation (see lesson 4) by typing in a terminal: kubectl create secret tls my-tls-secret --cert=cert.pem --key=key.pem:
microk8s disable ingress
microk8s enable ingress:default-ssl-certificate=default/my-tls-secret

# 4. HELM Chart

- need to:
microk8s enable helm3

- run:
microk8s helm3 install <release_name> ./project-chart

release-name can be anything; please note that it fails if you haven't deleted everything already created (as in deployments, services, secrets, configmaps etc) because everything is done in the default namespace (you'll get an error and it'll tell you what you still need to delete if you miss something)

- get the status with:
microk8s helm3 status <release_name>
kubectl get all should return resources deployed (same as if you deploy them individually)

- stop it:
microk8s helm3 uninstall <release_name>
kubectl get all should return nothing

Done:
- persistent layer
- rest-api
- web-app
- TLS secret stuff (added alongside DB secret & enabled TLS in ingress)

TODO:
- network policy? idk if needed for helm
- package helm chart and add to repository


other TODOs:
- change TLS secret name maybe?
- namespace everything (this one might be needed) -> actually not needed according to docs