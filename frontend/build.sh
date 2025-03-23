#!/bin/bash
# Install dependencies
npm install

# Create a direct reference to the vite executable
VITE_PATH="./node_modules/.bin/vite"

# Check if vite exists
if [ -f "$VITE_PATH" ]; then
  echo "Vite found at $VITE_PATH"
  # Run build using the direct path
  $VITE_PATH build
else
  echo "Vite not found at $VITE_PATH"
  echo "Attempting fallback method..."
  # Try a fallback method
  npx --no-install vite build
fi