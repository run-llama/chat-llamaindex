#!/bin/bash

echo -e "\nAdding sources from create-llama..."

# Remove current create-llama folder
rm -rf app/api/chat/config
rm -rf app/api/files
rm -rf cl

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
    -- cl >/dev/null

# copy routes from create-llama to app
# Note: if changes on these routes are needed, copy them to the project's app folder
cp -r cl/app/api/files app/api/files
cp -r cl/app/api/chat/config app/api/chat/config

# copy example .env file
cp cl/.env .env.development.local
