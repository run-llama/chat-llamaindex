# ---- Build Stage ----
FROM node:18-bookworm-slim AS build

# Install ca-certificates. Issue: #89
RUN apt-get update
RUN apt-get install -y ca-certificates

# Install Python, g++, and make for building native dependencies
# Issue: https://github.com/docker/getting-started/issues/124
RUN apt-get install -y python3 g++ make && \
    apt-get clean

# Set the working directory
WORKDIR /usr/src/app

# Copy the application's package.json and pnpm-lock.yaml to the container
COPY package.json pnpm-lock.yaml ./

# Install pnpm and application dependencies
RUN npm install -g pnpm && \
    pnpm install

# Copy the rest of the application to the container
COPY . .

# Build the application for production
RUN pnpm build

# ---- Production Stage ----
FROM node:18-bookworm-slim AS runtime

# Use a non-root user
USER node

# Set the working directory
WORKDIR /usr/src/app

# Copy the build artifacts from the build stage
COPY --from=build /usr/src/app/.next ./.next
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/node_modules ./node_modules

# Expose port 3000 to be accessed outside the container
EXPOSE 3000

# Start the application in production mode
CMD ["npx", "pnpm", "start"]
