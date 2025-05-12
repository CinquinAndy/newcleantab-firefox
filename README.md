# New Clean Tab

A Firefox extension that redirects new tabs to your homepage.

## What does this extension do?

When you open a new tab in Firefox, it redirects to your configured homepage.

## Installation for Development

```bash
# Clone the repository
git clone https://github.com/yourusername/new-clean-tab.git
cd new-clean-tab

# Run the setup script (installs dependencies, generates icons, builds extension)
npm run setup
```

## Manual Installation in Firefox

1. Open Firefox
2. Navigate to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file from this project

## Project Structure

- `manifest.json`: Extension configuration
- `newcleantab.html`: HTML for the new tab page
- `newcleantab.js`: Main script that redirects to homepage
- `icon-generator.js`: Script to generate extension icons
- `package.json`: NPM configuration and scripts

## Available NPM Scripts

- `npm run build`: Package the extension into a zip file
- `npm run icons`: Generate extension icons
- `npm run clean`: Clean temporary files
- `npm run setup`: Full setup (install deps, generate icons, build)

## License

This project is licensed under the Mozilla Public License 2.0 - see the [LICENSE](LICENSE) file for details.
