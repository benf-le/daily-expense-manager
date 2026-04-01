FROM node:22-alpine

# Install OpenSSL (required by Prisma engine) and libc6-compat
RUN apk add --no-cache openssl libc6-compat

# Set the working directory
WORKDIR /app

# Copy dependency files first to utilize Docker layer caching
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Set default environment variables for the build and runtime
ENV NODE_ENV=production

# Generate the Prisma Client
RUN npx prisma generate

# Build the Next.js application for production
RUN npm run build

# Expose the new frontend port
EXPOSE 6886

# Command to start the Next.js production server on port 6886
CMD ["npm", "run", "start"]
