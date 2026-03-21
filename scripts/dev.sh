#!/bin/bash
set -e

echo "→ Starting DynamoDB Local..."
docker compose up -d

echo "→ Waiting for DynamoDB Local to be ready..."
sleep 2

echo "→ Creating table and GSI..."
npx tsx infra/scripts/setup-local.ts

echo "→ Starting Next.js dev server..."
npm run dev
