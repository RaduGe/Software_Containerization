# Stage 1: Build an image that can build the Angular application
FROM node as build-container
# Specify the working directory inside the container
WORKDIR /app
# Copy the package*.json file inside the container so it can tell npm whatpackages to install
COPY package*.json /app/
# Run the installation of all the packages required in package*.json
RUN npm install
# Copy the source code of the application into the /app folder of thecontainer
COPY . /app
# Specify that we want a production build (smaller)
ARG configuration=production
# Run the actual build and put the output in the folder /app/dist/out in thecontainer
RUN npm run build -- --outputPath=./dist/out --configuration $configuration
# Stage 2, create a container with nginx
# that serves the files created in the previous build
FROM nginx
# We copy the files that were created in the previous build to the folder where nginx expects them
COPY --from=build-container /app/dist/out/ /usr/share/nginx/html
# We copy the nginx configuration frile form the host to the nginx installation
COPY /nginx-custom.conf /etc/nginx/conf.d/default.conf
