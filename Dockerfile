# Use the official Node.js 18 image as a base image
FROM node:18

# Switch to non-root user
USER node

# Update the PATH environment variable for global npm installations
ENV NPM_CONFIG_PREFIX=/home/node/.npm-global
ENV PATH=$PATH:/home/node/.npm-global/bin

# Set the working directory inside the container
WORKDIR /usr/src/app

# Grant permissions for the "node" user (This step is essential if you have a directory that the node user needs to write to)
RUN chown -R node:node /usr/src/app

# Copy the application's package.json and pnpm-lock.yaml to the container
COPY --chown=node:node package.json pnpm-lock.yaml ./

# Install pnpm and application dependencies
RUN npm install -g pnpm && \
    pnpm install

# Copy the rest of the application to the container
COPY --chown=node:node . .

# Expose port 3000 to be accessed outside the container
EXPOSE 3000

# Define the command to run the application using pnpm
CMD ["pnpm", "dev"]
