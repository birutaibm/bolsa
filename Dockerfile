FROM node:16.8.0-alpine3.13

# Add global build dependencies
RUN apk add --no-cache bash
RUN npm install -g npm@7.16.0
RUN npm install -g babel

# Get source code and dependencies
WORKDIR /home/node
COPY package*.json bolsa/
WORKDIR /home/node/bolsa
COPY .env .env
COPY babel.config.js babel.config.js
COPY tsconfig.json tsconfig.json
RUN npm install
COPY src src

# Build the app
RUN npm run build

# Delete unneccessary files
RUN npm prune --production
RUN rm -rf src package-lock.json tsconfig.json babel.config.js

# Configure environment
EXPOSE 3333

# Start the app
CMD [ "npm", "run", "start" ]
