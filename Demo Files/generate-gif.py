#!/usr/bin/env python3
"""
Generate an animated GIF from the Caribou Health demo using Playwright.
"""

import sys
sys.path.insert(0, '/Users/Caleigh/Library/Python/3.9/lib/python/site-packages')

from playwright.sync_api import sync_playwright
from PIL import Image
import os
import time

def capture_demo_gif():
    output_dir = "/Users/Caleigh/Desktop/Caribou/caribou-website/gif-frames"
    output_gif = "/Users/Caleigh/Desktop/Caribou/caribou-website/caribou-demo.gif"

    os.makedirs(output_dir, exist_ok=True)

    print("Starting browser...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Create a page with specific viewport for phone mockup
        page = browser.new_page(viewport={'width': 500, 'height': 800})

        print("Loading demo page...")
        page.goto('http://localhost:8085/demo-video.html')

        # Wait for page to load
        page.wait_for_load_state('networkidle')
        time.sleep(1)

        # Stop the slideshow
        page.evaluate('stopSlideshow()')

        frames = []

        # Capture each of the 6 slides
        for i in range(6):
            print(f"Capturing slide {i + 1}...")

            # Go to slide
            page.evaluate(f'showSlide({i})')
            time.sleep(0.5)  # Let animation settle

            # Take screenshot
            screenshot_path = os.path.join(output_dir, f'frame_{i + 1}.png')

            # Find the phone mockup element and screenshot it
            phone = page.locator('.phone-mockup')
            phone.screenshot(path=screenshot_path)

            # Load for GIF creation
            img = Image.open(screenshot_path)
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            frames.append(img)

            print(f"  Saved: {screenshot_path}")

        browser.close()

    print("\nCreating GIF...")

    # Create GIF with 3 second duration per frame
    frames[0].save(
        output_gif,
        save_all=True,
        append_images=frames[1:],
        duration=3000,  # 3 seconds per frame
        loop=0  # Infinite loop
    )

    print(f"\n✓ GIF created successfully!")
    print(f"  Location: {output_gif}")
    print(f"  Frames: {len(frames)}")
    print(f"  Duration: 3 seconds per frame ({len(frames) * 3} seconds total)")

    return output_gif

if __name__ == "__main__":
    capture_demo_gif()
