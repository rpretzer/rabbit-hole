# Ryan Andrew Pretzer - Portfolio Website

A modern, responsive portfolio website showcasing mobile product strategy, design systems expertise, and enterprise experience.

## 🚀 Features

- **Modular Architecture**: Clean separation of concerns with ES6 modules
- **Performance Optimized**: Lazy loading, code splitting, and optimized assets
- **Responsive Design**: Mobile-first approach with fluid typography
- **Dark Mode**: System-aware theme switching with user preference persistence
- **Accessibility**: WCAG 2.1 AA compliant with semantic HTML and ARIA labels
- **SEO Optimized**: Structured data, meta tags, and semantic markup
- **Progressive Enhancement**: Works without JavaScript, enhanced with it

## 📁 Project Structure

```
├── content/                 # Content management
│   ├── data/               # JSON data files
│   ├── markdown/           # Markdown content
│   └── templates/          # HTML templates
├── scripts/                # JavaScript modules
│   ├── modules/            # Core functionality
│   │   ├── ContentManager.js
│   │   ├── NavigationManager.js
│   │   ├── ThemeManager.js
│   │   └── AnimationManager.js
│   ├── components/         # Reusable components
│   └── app.js             # Main entry point
├── styles/                 # CSS architecture
│   ├── base/              # Variables and resets
│   ├── components/        # Component styles
│   ├── layouts/           # Layout styles
│   └── main.css           # Main stylesheet
├── images/                 # Image assets
├── dist/                   # Build output (git ignored)
└── index.html             # Main HTML file
```

## 🛠️ Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📝 Content Management

### Adding New Projects

1. Edit `content/data/portfolio.json`:
   ```json
   {
     "slug": "project-slug",
     "title": "Project Title",
     "description": "Brief description",
     "image": "/images/portfolio/project-hero.jpg",
     "tags": ["Tag1", "Tag2"],
     "hasCaseStudy": true
   }
   ```

2. Create case study page at `portfolio/project-slug/index.html`

### Updating Services

Edit `content/data/services.json` to add or modify services offered.

### Writing Blog Posts

1. Create markdown file in `content/markdown/insights/`
2. Add metadata to `content/data/content.json`

## 🎨 Styling Guidelines

- Use CSS variables from `styles/base/variables.css`
- Follow BEM naming convention for components
- Mobile-first responsive design
- Use semantic color names (e.g., `--color-primary` not `--color-blue`)

## 🚀 Deployment

### GitHub Pages
```bash
npm run deploy
```

### Custom Domain
1. Build the project: `npm run build`
2. Upload contents of `dist/` to your server
3. Configure server to serve `index.html` for all routes

## 🔧 Configuration

### Environment Variables
Create `.env` file for local development:
```
API_ENDPOINT=https://your-api.com
ANALYTICS_ID=UA-XXXXXXXX
```

### Build Options
Modify `package.json` scripts for custom build processes.

## 📊 Performance Metrics

Target metrics:
- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Cumulative Layout Shift: < 0.1

## 🐛 Troubleshooting

### Common Issues

1. **Images not loading**
   - Check file paths in JSON data
   - Ensure images exist in `images/` directory
   - Verify build process includes image optimization

2. **JavaScript errors**
   - Check browser console for specific errors
   - Ensure all modules are properly imported
   - Verify marked.js is loaded before app.js

3. **Styling issues**
   - Clear browser cache
   - Check CSS variable definitions
   - Verify PostCSS build completed successfully

## 📚 Documentation

- [Architecture Decision Records](docs/adr/)
- [Component Documentation](docs/components/)
- [API Documentation](docs/api/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Contact

Ryan Andrew Pretzer
- Email: rpretzer@gmail.com
- LinkedIn: [linkedin.com/in/ryanpretzer](https://linkedin.com/in/ryanpretzer)
- GitHub: [@yourusername](https://github.com/yourusername)

---

Built with ❤️ using modern web technologies