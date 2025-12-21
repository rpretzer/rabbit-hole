#!/usr/bin/env node
/**
 * Generate content manifest for CMS
 * 
 * This script scans the content directory and generates a manifest
 * that can be used by the site to load content dynamically.
 * 
 * Usage: node scripts/generate-manifest.js > content-manifest.json
 */

const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '..', 'content');
const types = ['artwork', 'poetry', 'essays', 'projects'];

const manifest = {};

types.forEach(type => {
  const typeDir = path.join(contentDir, type);
  if (!fs.existsSync(typeDir)) {
    manifest[type] = [];
    return;
  }

  const files = fs.readdirSync(typeDir)
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''))
    .sort();

  manifest[type] = files;
});

console.log(JSON.stringify(manifest, null, 2));

