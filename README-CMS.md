# Content Management System

This site uses a lightweight file-based CMS for managing content and digital assets.

## Structure

```
content/
  artwork/        # Artwork series metadata (JSON)
  poetry/         # Poetry metadata (JSON)
  essays/         # Essay metadata (JSON)
  projects/       # Project metadata (JSON)

images/
  artwork/        # Artwork images organized by series
    series-name/
      thumbnail.jpg
      image1.jpg
      image2.jpg
```

## Web Admin Interface

Visit `/admin.html` to access the web-based admin interface. The admin UI allows you to:

- **View all content** by type (artwork, poetry, essays, projects)
- **Create new items** with a guided form
- **Edit existing items** (loads current JSON data)
- **Download JSON files** for saving to your content directory
- **Generate manifest** file automatically

### Using the Admin UI

1. Navigate to `/admin.html`
2. Select a content type from the sidebar
3. Click "New Item" to create, or click "Edit" on an existing item
4. Fill out the form (required fields are marked with *)
5. Click "Create & Download JSON" to download the JSON file
6. Save the downloaded file to the appropriate `content/[type]/` directory
7. Add images to `images/artwork/[series-name]/` if needed
8. Regenerate the manifest using the "Generate Manifest" button

**Note:** Since this is a static site, the admin UI downloads JSON files for you to manually save. In the future, this could be enhanced with a backend API or GitHub integration.

## Adding Content Manually

### Artwork

1. Create a JSON file in `content/artwork/` (e.g., `my-series.json`)
2. Add images to `images/artwork/my-series/`
3. Reference images in the JSON file

Example `content/artwork/my-series.json`:
```json
{
  "id": "my-series",
  "title": "My Artwork Series",
  "date": "2024",
  "series": "Series Name",
  "description": "Description of the artwork series.",
  "thumbnail": "images/artwork/my-series/thumbnail.jpg",
  "images": [
    {
      "src": "images/artwork/my-series/image1.jpg",
      "alt": "Alt text",
      "caption": "Caption text"
    }
  ],
  "tags": ["tag1", "tag2"],
  "published": true
}
```

### Poetry

Create a JSON file in `content/poetry/`:

```json
{
  "id": "poem-slug",
  "title": "Poem Title",
  "date": "2024",
  "excerpt": "First few lines...",
  "fullText": "Full poem text\nwith line breaks",
  "tags": ["tag1", "tag2"],
  "published": true
}
```

### Essays

Create a JSON file in `content/essays/`:

```json
{
  "id": "essay-slug",
  "title": "Essay Title",
  "date": "2024",
  "excerpt": "Excerpt text...",
  "tags": ["tag1", "tag2"],
  "published": true
}
```

### Projects

Create a JSON file in `content/projects/`:

```json
{
  "id": "project-slug",
  "title": "Project Title",
  "date": "2024",
  "description": "Project description.",
  "url": "https://github.com/username/repo",
  "tags": ["tag1", "tag2"],
  "published": true
}
```

## Publishing

Set `"published": false` to hide content from the site, or simply don't include the file in the manifest.

## Manifest Generation

The site can automatically discover content files, or you can generate a manifest:

```bash
node scripts/generate-manifest.js > content-manifest.json
```

The JavaScript will automatically use `content-manifest.json` if it exists, otherwise it falls back to a default manifest. You can commit the manifest file or generate it as part of your build process.

## Image Optimization

For best performance:
- Thumbnails should be ~800px wide (web-optimized)
- Full images can be larger but should be optimized
- Use appropriate formats (JPG for photos, PNG for graphics with transparency, WebP for modern browsers)

## Future Enhancements

- Auto-discovery of content files (no manifest needed)
- Image optimization pipeline
- Markdown support for essays
- Backend API for direct file writes
- GitHub integration for automatic commits
- Lightbox/gallery viewer for artwork series
