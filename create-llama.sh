#!/bin/bash

echo -e "\nCreating Llama App..."

# Go to the app directory
cd app

# Remove any existing chat-session directory
rm -rf create_llama
rm -rf components/chat/chat-session

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

# copy components
mkdir -p components/chat/chat-session
cp -r create_llama/app/components/* components/chat/chat-session

# Remove the create_llama directory
rm -rf create_llama