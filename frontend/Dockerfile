FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code to the container
COPY . .

# Expose the port that Vite uses by default (3000)
EXPOSE 5173

# Start the Vite dev server
CMD ["npm", "run", "dev"]