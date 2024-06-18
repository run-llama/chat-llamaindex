#!/bin/bash

echo -e "\nAdding sources from create-llama..."

# Remove any existing copy
rm -rf app/api/chat
rm -rf app/api/files
rm -rf config
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

# copy components, apis, env
cp -r cl/app/api/* app/api
cp cl/.env .env.development.local

# patch files
cp -r patch/* ./app

# remove page.tsx and route.ts files from create-llama (otherwise they are included in the build)
# XXX: Is there a Vercel config to disable this?
find cl/ -type f \( -name "page.tsx" -o -name "route.ts" \) -exec rm -f {} \;
