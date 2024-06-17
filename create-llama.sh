#!/bin/bash

echo -e "\nCreating Llama App..."

# Go to the app directory
cd app

# Remove any existing copy
rm -rf components/chat/chat-session
rm -rf api/chat
rm -rf api/files
rm -rf observability
rm -rf ../config

# Run the node command with specified options
npx -y create-llama@0.1.10 \
    --framework nextjs \
    --template streaming \
    --engine context \
    --frontend \
    --ui shadcn \
    --observability none \
    --open-ai-key none \
    --tools none \
    --post-install-action none \
    --no-llama-parse \
    --no-files \
    --vector-db none \
    --use-pnpm \
    -- create_llama

# copy components and apis
mkdir -p components/chat/chat-session
mkdir -p observability
mkdir -p ../config
cp -r create_llama/app/components/* components/chat/chat-session
cp -r create_llama/app/api/* api
cp -r create_llama/app/observability/* observability

# patch files
cp -r ../patch/* ./

# copy configs, env
cp -r create_llama/config/* ../config
rm -rf ../.env.development.local
cp create_llama/.env ../.env.development.local

# Clean up unnecessary files
rm -rf create_llama
rm -rf components/chat/chat-session/header.tsx
rm -rf components/chat/chat-session/chat-section.tsx