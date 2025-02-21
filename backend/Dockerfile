FROM node:20-alpine

WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json first
COPY package*.json ./

# Run npm install only for production dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port the app runs on
EXPOSE 8888

# Command to run the application
CMD ["node", "app.js"]
