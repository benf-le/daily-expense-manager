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
ENV DATABASE_URL="file:./dev.db"
ENV NEXTAUTH_SECRET="super-secret-key-daily-expense-manager-2026"
ENV NEXTAUTH_URL="http://localhost:3000"

# Generate the Prisma Client
RUN npx prisma generate

# Push DB schema to create the SQLite file inside the container, and run seed script
RUN npx prisma db push
RUN npm run seed

# Build the Next.js application for production
RUN npm run build

# Expose the default Next.js port
EXPOSE 3000

# Command to start the Next.js production server
CMD ["npm", "run", "start"]
