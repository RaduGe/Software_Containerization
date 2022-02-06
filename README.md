# Group 31

Our application consists of a postgres database connected to a REST api served via Flask and accessed via an nginx + Angular front-end.
The app is hosted on GCP via a static ip at: `https://34.96.121.196` (presentation video includes a walk-through).
Note: the app is not exactly smart, so when deleting/adding/updating users please wait a couple of seconds before refreshing the page manually to see that changes are actually committed to the DB. We didn't really focus on that kind of requirements.

1. Components related to the persistent layer:
- /postgres-image-creation (original alpine image small extension)
- postgres-config.yaml (ConfigMap)
- postgres-deployment-gcp.yaml (Deployment for GCP due to issue with NFS; basically only mountPath changes)
- postgres-deployment.yaml (Deployment for local Unix VM with different mountPath)
- postgres-secret.yaml (Secret)
- postgres-service.yaml (Service)
- postgres-storage-gcp.yaml (Volumes for GCP)
- postgres-storage.yaml (Volumes for unix VM)
2. Components related to REST-API:
- /rest-api (docker container code and flask app itself)
- rest-api-deployment.yaml (Deployment)
- rest-api-service.yaml (Service)
3. Components related to web front-end:
- /front-end/project-front-end (Docker image code and angular app itself)
- webapp-deployment.yaml (Deployment)
- webapp-ingress-gcp.yaml (Ingress for GCP because we don't have a domain)
- webapp-ingress.yaml (Ingress for Unix VM - assumes that /etc/hosts is modified with domain name)
- webapp-service.yaml (Serice)
- webapp.crt and webapp.key (TLS requirements)
4. Transport Level Security components
- under /rest-api we have the key/cert files used on unix VM
- the secret was created manually, locally using the command line (so no yaml file)
- however, TLS is enabled on GCP (see URL above) using also command-line TLS secret (no yaml) - so we can prove it works
5. Helm Chart Components
- /project-chart
6. Network policies
- network-policy.yaml
- we basically deny all ingress/egress connections; on top of that we allow the web app to be accessed in any way; on top of that we allow the web-app only to access the REST api and the REST_API to access the DB backend
7. outcomeSecurity - RBAC
- user-admin-pods-global.yaml
- user-pod-admin.yaml
- user-pod-reader.yaml
- user-read-pods-global.yaml
- note: this was only done on local Unix VM, so not on GCP
8. Google Cloud Platform
- app is hosted and up-and-running at url above:
![alt text](GCP_proof_1.jpg)


## Persistent Layer - not visible outside cluster

- we extend the official postgres image by adding an init sql script that creates the person table
- pushed to raduge/postgres-person-db
- to run the DB deployment on a local unix machine, the following steps have to be done:
1. ` sudo mkdir -p /opt/project/persistent_data `
2. `kubectl apply -f <postgres-*.yaml> ` (this has to be done in order: storage, config, secret, service, deployment)
3. connect to the db in the cluster:
`psql -h <svc ip> -U postgresadmin --password -p 5432 postgresdb`
with password: admin123

## REST API - not visible outside cluster

- environment variables such as DB IP, PORT, passwords are retrieved automatically
- pushed to: raduge/rest-api
- steps to run:
1. kubectl apply: service first, deployment (make sure that persistent layer is already up and running, otherwise env variables will not sync)
2. get svc and do requests to `http://rest_api_svc_ip:rest_api_svc_port/`
- note: in GCP, one needs to sh into a running pod to be able to curl 
- ensuring that the application scales horizontally is done using HPA:
`kubectl autoscale deployment persistent-layer-deployment --min=1 --max=4 --cpu-percent=80`
`kubectl autoscale deployment rest-api-deployment --min=1 --max=4 --cpu-percent=80`
`kubectl autoscale deployment web-app-deployment --min=1 --max=4 --cpu-percent=80`
`kubectl get hpa`

## Web Front-End application

Only needed if docker image is changed:
- need to install node, npm
- created a new project using: ng new project-front-end (don't need to do this)
- navigate to project directory and run using: ng serve

- need to:
1. `microk8s enable metallb and give an ip range: 10.50.100.5-10.50.100.25`
2. `microk8s enable ingress`
3. `microk8s enable dns`
4. edit /etc/hosts to add app url to DNS (use kubectl get ingress and then put the ip address in /etc/hosts and then the app name, see line 3 below):

```
radu@kube-master-gui:/etc$ cat /etc/hosts
#127.0.0.1	localhost
127.0.1.1	kube-master-gui
127.0.0.1	group31app.com

The following lines are desirable for IPv6 capable hosts
::1     ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
```

- after TLS secret creation:
1. `microk8s disable ingress`
2. `microk8s enable ingress:default-ssl-certificate=default/my-tls-secret`

- in GCP we created a static IP address:
`gcloud compute addresses create web-static-ip --global`
`gcloud compute addresses describe web-static-ip`
- in GCP we need to reduce key size due to what it seems are GCP limitations `openssl req -new -newkey rsa:2048 -x509 -sha256 -days 365 -nodes -out webapp.crt -keyout webapp.key kubectl create secret tls webapp-tls --cert=webapp.crt --key=webapp.key`

## RBAC

- add new user to token file in the form token,username,id 
- we're adding two users called "user" and "admin2"
```
do 
- 'nano /var/snap/microk8s/current/credentials/known_tokens.csv'
- append line 'J5zfqcEvxxnhVy9kign6P5ddH3TJS41H+dFBOqXvcHzXAK90OULquTn56PYR,user,userid'
- append line 'PwnAUUm39b24Q2/R5KN+nJUF7oMBqg9snIMdQmAZK0WF5p2Y0F65uBbmLMdg,admin2,admin2'
```
- restart microk8s by doing `microk8s stop` and `microk8s start`
- enable rbac with `microk8s enable rbac`
- user will have permission to do GET, HEAD for pods
- admin2 will have permission to do POST, GET, HEAD, PUT, PATCH, DELETE for pods
- both bindings are ClusterRole-ClusterRoleBinding, so they can be used in any namespace
```
- 'kubectl apply -f user-pod-reader.yaml'
- 'kubectl apply -f user-pod-admin.yaml'
- 'kubectl apply -f user-read-pods-global.yaml'
- 'kubectl apply -f user-admin-pods-global.yaml'
```
- quick test
 ```   
- 'kubectl auth can-i get pod --as user' #yes    
- 'kubectl auth can-i delete pod --as user' #no    
- 'kubectl auth can-i get pod --as admin2' #yes    
- 'kubectl auth can-i delete pod --as admin2' #yes
```

- real test ("web-app-deployment-5bdf89bbf7-2tv9w" is the pod name in this specific case but it changes every time, so check 'kubectl get pod')

case: user GET pod
- 'curl -X GET https://127.0.0.1:16443/api/v1/namespaces/default/pods/web-app-deployment-5bdf89bbf7-2tv9w --header "Authorization Bearer J5zfqcEvxxnhVy9kign6P5ddH3TJS41H+dFBOqXvcHzXAK90OULquTn56PYR" --insecure'

case: user DELETE pod
- 'curl -X DELETE https://127.0.0.1:16443/api/v1/namespaces/default/pods/web-app-deployment-5bdf89bbf7-2tv9w --header "Authorization Bearer J5zfqcEvxxnhVy9kign6P5ddH3TJS41H+dFBOqXvcHzXAK90OULquTn56PYR" --insecure'

case: admin2 GET pod
- 'curl -X GET https://127.0.0.1:16443/api/v1/namespaces/default/pods/web-app-deployment-5bdf89bbf7-2tv9w --header "Authorization Bearer PwnAUUm39b24Q2/R5KN+nJUF7oMBqg9snIMdQmAZK0WF5p2Y0F65uBbmLMdg" --insecure'

case: admin2 DELETE pod
- 'curl -X DELETE https://127.0.0.1:16443/api/v1/namespaces/default/pods/web-app-deployment-5bdf89bbf7-2tv9w --header "Authorization Bearer PwnAUUm39b24Q2/R5KN+nJUF7oMBqg9snIMdQmAZK0WF5p2Y0F65uBbmLMdg" --insecure'

## HELM Chart

- need to: `microk8s enable helm3`
- run: `microk8s helm3 install <release_name> ./project-chart`
- get the status with: `microk8s helm3 status <release_name>`
- stop it: `microk8s helm3 uninstall <release_name>`
kubectl get all should return nothing