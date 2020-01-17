# Specify a base image
FROM node:alpine

# Sets the working directory within
# the container (./ will now reference this dir)
WORKDIR /usr/app

# Install some dependencies
COPY ./package.json ./
RUN npm install

# Putting this down here makes it so
# npm install only happens if the pkg json
# changes
COPY ./ ./

# Default command
CMD [ "npm","start" ]