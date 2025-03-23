#!/bin/bash
echo "Installing dependencies..."
npm install

echo "Installing Vite explicitly..."
npm install -g vite@latest

echo "Starting build process..."
npx --yes vite build