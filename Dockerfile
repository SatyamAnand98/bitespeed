FROM node:18.16.1-alpine
LABEL maintainer="Satyam Anand"

# Set environment variables
ARG PORT
ARG PGHOST
ARG PGPORT
ARG PGDATABASE
ARG PGUSER
ARG PGPASSWORD

# Set environment variables for the application
ENV PORT=${PORT}
ENV PGHOST=${PGHOST}
ENV PGPORT=${PGPORT}
ENV PGDATABASE=${PGDATABASE}
ENV PGUSER=${PGUSER}
ENV PGPASSWORD=${PGPASSWORD}

# Create app directory
WORKDIR /var/www/app/bitespeed

# Install app dependencies
COPY package.json ./
COPY tsconfig.json ./

RUN npm install

# Bundle app source
COPY . .

# Build the app
RUN npm run build

# Expose the port
EXPOSE ${PORT}

# Remove unnecessary files
RUN rm -rf src
RUN rm -rf app.ts

# Start the app
CMD [ "npm", "start" ]