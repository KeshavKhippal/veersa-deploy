FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy all source files
COPY . .

# Accept build-time API URL as a build argument
# Default to localhost for local Docker usage
ARG REACT_APP_API_URL=http://localhost:8000
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Build the production React bundle
# The REACT_APP_API_URL env var gets baked into the build here
RUN npm run build

# Install serve to host the static files
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
