#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status
# uploads demo datasources to LlamaCloud

pnpm run generate documents
pnpm run generate watchos
pnpm run generate redhat
pnpm run generate basic_law_germany
