# Use the official Node.js image for building
FROM node:20-alpine as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code to the container
COPY . .

# Build the production-ready files
RUN npm run build

# Use a lightweight web server for serving static files
FROM nginx:alpine

# Copy the build files to the nginx container
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (default nginx port)
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]
