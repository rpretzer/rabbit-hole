#!/usr/bin/env python3
"""
Process manuscript images: convert to PDF, stitch multiple images into multi-page PDFs.

Usage:
  # Convert single image to PDF
  python3 scripts/process-manuscripts.py convert images/poetry/poem-id/manuscript.jpg

  # Stitch multiple images into one PDF
  python3 scripts/process-manuscripts.py stitch images/poetry/poem-id/page1.jpg images/poetry/poem-id/page2.jpg -o images/poetry/poem-id/manuscript.pdf
"""

import sys
import argparse
from pathlib import Path
from PIL import Image

def convert_image_to_pdf(input_path, output_path=None):
    """Convert a single image to PDF."""
    input_path = Path(input_path)
    
    if not input_path.exists():
        print(f"Error: Input file not found: {input_path}")
        return False
    
    if output_path is None:
        # Use same directory, change extension to .pdf
        output_path = input_path.parent / f"{input_path.stem}.pdf"
    else:
        output_path = Path(output_path)
    
    try:
        img = Image.open(input_path)
        
        # Convert RGBA to RGB if needed
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
            img = rgb_img
        
        # Save as PDF
        img.save(output_path, 'PDF', resolution=300.0, quality=95)
        print(f"✓ Converted {input_path.name} → {output_path.name}")
        return True
    except Exception as e:
        print(f"Error converting {input_path}: {e}")
        return False

def stitch_images_to_pdf(image_paths, output_path):
    """Stitch multiple images into a single multi-page PDF."""
    output_path = Path(output_path)
    images = []
    
    for img_path in image_paths:
        img_path = Path(img_path)
        if not img_path.exists():
            print(f"Warning: Image not found, skipping: {img_path}")
            continue
        
        try:
            img = Image.open(img_path)
            
            # Convert RGBA to RGB if needed
            if img.mode in ('RGBA', 'LA', 'P'):
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                rgb_img.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = rgb_img
            
            images.append(img)
            print(f"  Added page: {img_path.name}")
        except Exception as e:
            print(f"Error processing {img_path}: {e}")
            continue
    
    if not images:
        print("Error: No valid images to stitch")
        return False
    
    try:
        # Save all images as a single PDF
        images[0].save(
            output_path,
            'PDF',
            resolution=300.0,
            quality=95,
            save_all=True,
            append_images=images[1:] if len(images) > 1 else []
        )
        print(f"✓ Created multi-page PDF: {output_path.name} ({len(images)} pages)")
        return True
    except Exception as e:
        print(f"Error creating PDF: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Process manuscript images to PDFs')
    subparsers = parser.add_subparsers(dest='command', help='Command to execute')
    
    # Convert command
    convert_parser = subparsers.add_parser('convert', help='Convert single image to PDF')
    convert_parser.add_argument('input', help='Input image file')
    convert_parser.add_argument('-o', '--output', help='Output PDF file (optional)')
    
    # Stitch command
    stitch_parser = subparsers.add_parser('stitch', help='Stitch multiple images into PDF')
    stitch_parser.add_argument('images', nargs='+', help='Input image files (in order)')
    stitch_parser.add_argument('-o', '--output', required=True, help='Output PDF file')
    
    args = parser.parse_args()
    
    if args.command == 'convert':
        convert_image_to_pdf(args.input, args.output)
    elif args.command == 'stitch':
        stitch_images_to_pdf(args.images, args.output)
    else:
        parser.print_help()

if __name__ == "__main__":
    main()

