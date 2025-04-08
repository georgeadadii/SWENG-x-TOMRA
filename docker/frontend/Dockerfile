# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY frontend/ .

RUN npm run build

# Expose port
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]