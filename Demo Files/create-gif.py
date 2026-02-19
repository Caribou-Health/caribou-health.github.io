#!/usr/bin/env python3
"""
Script to create a GIF from individual frame images.
Place your frame images (frame_1.png, frame_2.png, etc.) in the same directory.
"""

from PIL import Image
import os
import glob

def create_gif_from_frames(frame_dir, output_path, duration=3000):
    """
    Create a GIF from frame images.

    Args:
        frame_dir: Directory containing frame images (frame_*.png)
        output_path: Path for output GIF
        duration: Duration per frame in milliseconds
    """
    # Find all frame images
    frame_pattern = os.path.join(frame_dir, "frame_*.png")
    frame_files = sorted(glob.glob(frame_pattern))

    if not frame_files:
        print(f"No frame files found matching {frame_pattern}")
        return False

    print(f"Found {len(frame_files)} frames:")
    for f in frame_files:
        print(f"  - {os.path.basename(f)}")

    # Load images
    frames = []
    for frame_file in frame_files:
        img = Image.open(frame_file)
        # Convert to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        frames.append(img)

    # Save as GIF
    frames[0].save(
        output_path,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,  # 0 = infinite loop
        optimize=True
    )

    print(f"\nGIF created successfully: {output_path}")
    print(f"  - Frames: {len(frames)}")
    print(f"  - Duration: {duration}ms per frame")
    print(f"  - Total duration: {len(frames) * duration / 1000}s")

    return True

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    frames_dir = os.path.join(script_dir, "gif-frames")
    output_gif = os.path.join(script_dir, "caribou-demo.gif")

    if not os.path.exists(frames_dir):
        os.makedirs(frames_dir)
        print(f"Created frames directory: {frames_dir}")
        print("\nPlease add frame images (frame_1.png, frame_2.png, etc.) to this directory.")
    else:
        create_gif_from_frames(frames_dir, output_gif, duration=3000)
