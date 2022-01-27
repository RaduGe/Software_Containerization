# Software_Containerization - REST-API 

The image for this Rest API made in Flask can be found at: https://hub.docker.com/r/bogdanandrei97/rest-api


Set-up:

1)Enter in flask-api -> rest-api
2)Open app.py in an editor by choice
3)At line 10 in app.py, modify the 'SQLALCHEMY_DATABASE_URI' variable accordingly to your database uri.
  The format for database uri is: 'database+driver://user:password@database-ip-address:port/database'.
  To find the ClusterIP in which the database is type in a terminal: microk8s kubectl get svc.(REMEMBER: to use the first port of the cluster)
4)Modify the "Person" class to whatever you have.
  To avoid any problems, it is reccomended that the class fields names to be same with the columns names of that table:
  For example: The TABLE Person has one column named person_id, also, the CLASS Person inside app.py has a field named person_id.
5)To start building your image open a terminal and type in the following order:
           a) microk8s status - see if you have registry enabled, if not enabled it via microk8s enable registry
           b) microk8s start
           c) sudo docker build .
           d) sudo docker images (search for the newest image created, without tag, and copy it's Image ID)
           e) sudo docker tag PREVIOUS_COPIED_IMAGE_ID desired_name:version
           f) sudo docker tag desired_name:version docker_hub_id/desired_name:version
           g) sudo docker login
           h) sudo docker push docker_hub_id/container_name:version
6) Go back to flask-api directory
7) Open rest_api_deployment.yaml file, and at line 19, change the container image version with the desired one
8) Apply the deployment .yaml file via 'microk8s kubectl apply -f rest_api_deployment.yaml'
9) Apply the service .yaml file via 'microk8s kubectl apply -f rest_api_service.yaml'
10) Now, type in a terminal again the same command 'microk8s kubectl get svc', and look for the cluster-ip of rest-api-service.
11) You can now start doing CRUD requests via http://ip_of_the_cluster:port_of_the_cluster/.
