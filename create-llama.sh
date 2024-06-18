#!/bin/bash

echo -e "\nAdding sources from create-llama..."

# Go to the app directory
cd app

# Remove any existing copy
rm -rf components/chat/chat-session
rm -rf api/chat
rm -rf api/files
rm -rf observability
rm -rf ../config
rm -rf create_llama

# Run the node command with specified options
npx -y create-llama@0.1.10 \
    --framework nextjs \
    --template streaming \
    --engine context \
    --frontend \
    --ui shadcn \
    --observability none \
    --open-ai-key "Set your OpenAI key here" \
    --tools none \
    --post-install-action none \
    --no-llama-parse \
    --example-file \
    --vector-db none \
    --use-pnpm \
    -- create_llama >/dev/null

# copy components, apis, env
mkdir -p components/chat/chat-session
mkdir -p observability
cp -r create_llama/app/components/* components/chat/chat-session
cp -r create_llama/app/api/* api
cp -r create_llama/app/observability/* observability
cp create_llama/.env ../.env.development.local

# patch files
cp -r ../patch/* ./

# Clean up unnecessary files
rm -rf components/chat/chat-session/header.tsx
rm -rf components/chat/chat-session/chat-section.tsx
