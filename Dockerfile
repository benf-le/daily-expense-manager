FROM node:20-alpine

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

# The .env file will be copied as part of the 'COPY . .' step above.
# Next.js and Prisma naturally look for .env in the app root.
# Make sure your .env has all necessary variables like DATABASE_URL, NEXTAUTH_SECRET, etc.

# Generate the Prisma Client
RUN npx prisma generate

# Note: Running 'npx prisma db push' or 'npm run seed' during Docker build 
# is not recommended when using an external database (remote PostgreSQL).
# These should be run at deployment or runtime.
# RUN npx prisma db push
# RUN npm run seed

# Build the Next.js application for production
RUN npm run build

# Expose the default Next.js port
EXPOSE 3000

# Command to start the Next.js production server
CMD ["npm", "run", "start"]
