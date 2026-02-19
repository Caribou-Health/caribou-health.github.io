#!/bin/bash
# Script to capture demo slides and create GIF
# Run this with the demo page open in Chrome

FRAMES_DIR="/Users/Caleigh/Desktop/Caribou/caribou-website/gif-frames"
OUTPUT_GIF="/Users/Caleigh/Desktop/Caribou/caribou-website/caribou-demo.gif"

# Create frames directory
mkdir -p "$FRAMES_DIR"

echo "Please ensure the demo page is visible in Chrome."
echo "This script will capture 6 frames at 3-second intervals."
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Capture 6 frames (one per slide)
for i in {1..6}; do
    echo "Capturing frame $i..."
    screencapture -x -R100,100,400,700 "$FRAMES_DIR/frame_$i.png"
    sleep 3
done

echo ""
echo "Frames captured! Creating GIF..."

# Create GIF using Python
python3 /Users/Caleigh/Desktop/Caribou/caribou-website/create-gif.py

echo "Done!"
