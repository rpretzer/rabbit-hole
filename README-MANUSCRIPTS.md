# Manuscript Processing Guide

This guide explains how to process manuscript images and create PDFs for display on the site.

## Overview

The site supports two types of manuscript display:
1. **Single image** - Displayed as a regular image
2. **PDF** - Displayed with a page-turning book interface

## Converting Images to PDF

### Single Image to PDF

Convert a single manuscript image to PDF:

```bash
python3 scripts/process-manuscripts.py convert images/poetry/poem-id/manuscript.jpg
```

This will create `images/poetry/poem-id/manuscript.pdf` in the same directory.

To specify a different output path:

```bash
python3 scripts/process-manuscripts.py convert images/poetry/poem-id/manuscript.jpg -o images/poetry/poem-id/manuscript.pdf
```

### Multiple Images to Multi-Page PDF

Stitch multiple images into a single multi-page PDF:

```bash
python3 scripts/process-manuscripts.py stitch \
  images/poetry/poem-id/page1.jpg \
  images/poetry/poem-id/page2.jpg \
  images/poetry/poem-id/page3.jpg \
  -o images/poetry/poem-id/manuscript.pdf
```

Images will be added to the PDF in the order specified.

## Updating Poetry JSON Files

Once you have a PDF, update the poetry JSON file to point to it:

```json
{
  "id": "poem-id",
  "title": "Poem Title",
  "date": "2024",
  "manuscript": "images/poetry/poem-id/manuscript.pdf",
  ...
}
```

The system will automatically detect PDF files and use the page-turning viewer instead of a simple image display.

## PDF Viewer Features

- **Book-style viewing**: Multi-page PDFs display two pages side-by-side (like an open book)
- **Navigation**: Arrow buttons to turn pages
- **Keyboard controls**: 
  - Left/Up arrow: Previous pages
  - Right/Down arrow: Next pages
- **Page counter**: Shows current page / total pages
- **Responsive**: Adapts to mobile screens (single page view)

## Technical Details

- PDFs are rendered using PDF.js (Mozilla's PDF rendering library)
- Images are converted at 300 DPI for high quality
- Single-page PDFs display as a single page
- Multi-page PDFs display two pages at a time (book view)

