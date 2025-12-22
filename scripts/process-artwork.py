#!/usr/bin/env python3
"""
Process artwork images: generate thumbnails, optimize, and create metadata.
"""

import json
import os
from pathlib import Path
from PIL import Image
import hashlib

BASE_DIR = Path(__file__).parent.parent
ARTWORK_DIR = BASE_DIR / "images" / "artwork"
CONTENT_DIR = BASE_DIR / "content" / "artwork"

def optimize_image(input_path, output_path, max_width=1920, quality=85):
    """Optimize image, resizing if needed."""
    try:
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if needed (for JPEG)
        if output_path.suffix.lower() == '.jpg' and img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb_img
        
        # Resize if larger than max_width
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save optimized
        save_kwargs = {'optimize': True}
        if output_path.suffix.lower() == '.jpg':
            save_kwargs['quality'] = quality
        elif output_path.suffix.lower() == '.png':
            save_kwargs['compress_level'] = 9
        
        img.save(output_path, **save_kwargs)
        return True
    except Exception as e:
        print(f"Error optimizing {input_path}: {e}")
        return False

def create_thumbnail(input_path, output_path, width=800, quality=85):
    """Create thumbnail from image."""
    try:
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if needed
        if output_path.suffix.lower() == '.jpg' and img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb_img
        
        # Calculate new height maintaining aspect ratio
        ratio = width / img.width
        new_height = int(img.height * ratio)
        
        # Resize
        img = img.resize((width, new_height), Image.Resampling.LANCZOS)
        
        # Save
        save_kwargs = {'optimize': True}
        if output_path.suffix.lower() == '.jpg':
            save_kwargs['quality'] = quality
        
        img.save(output_path, **save_kwargs)
        return True
    except Exception as e:
        print(f"Error creating thumbnail {output_path}: {e}")
        return False

def get_image_info(image_path):
    """Get basic info about an image."""
    try:
        img = Image.open(image_path)
        return {
            'width': img.width,
            'height': img.height,
            'mode': img.mode,
            'format': img.format,
            'size': os.path.getsize(image_path)
        }
    except Exception as e:
        print(f"Error reading {image_path}: {e}")
        return None

def process_series(series_id):
    """Process all images in a series."""
    series_dir = ARTWORK_DIR / series_id
    
    if not series_dir.exists():
        print(f"Series directory not found: {series_dir}")
        return
    
    # Get all PNG images
    images = sorted(series_dir.glob("*.png"))
    
    if not images:
        print(f"No images found in {series_dir}")
        return
    
    print(f"\nProcessing {series_id}: {len(images)} images")
    
    # Use first image as thumbnail source
    thumbnail_source = images[0]
    thumbnail_path = series_dir / "thumbnail.jpg"
    
    print(f"Creating thumbnail from {thumbnail_source.name}...")
    create_thumbnail(thumbnail_source, thumbnail_path, width=800)
    
    # Process all images (optimize and optionally convert to JPG for better compression)
    processed_images = []
    for i, img_path in enumerate(images, 1):
        # Keep as PNG or convert to optimized JPG?
        # For artwork, we'll keep PNGs but optimize them
        # For display, create optimized versions
        print(f"  Processing {i}/{len(images)}: {img_path.name}")
        
        # Just get info for now - original PNGs stay as reference
        info = get_image_info(img_path)
        if info:
            processed_images.append({
                'src': f"images/artwork/{series_id}/{img_path.name}",
                'alt': f"{series_id.replace('-', ' ').title()} - Image {i}",
                'caption': ''
            })
    
    return {
        'thumbnail': f"images/artwork/{series_id}/thumbnail.jpg",
        'images': processed_images,
        'count': len(processed_images)
    }

if __name__ == "__main__":
    # Process each series
    series_dirs = [d for d in ARTWORK_DIR.iterdir() if d.is_dir()]
    
    for series_dir in sorted(series_dirs):
        series_id = series_dir.name
        result = process_series(series_id)
        if result:
            print(f"\n✓ Processed {series_id}: {result['count']} images, thumbnail created")

