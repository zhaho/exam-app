FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json first for caching
COPY package*.json ./

# Run npm install to install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]
