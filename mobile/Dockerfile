FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port for Expo web
EXPOSE 8081

# Start Expo in web mode
CMD ["npm", "run", "web"]
