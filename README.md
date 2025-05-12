# New Clean Tab

A Firefox extension that redirects new tabs to your homepage while attempting to clear the URL bar.

## What does this extension do?

1. When you open a new tab in Firefox, it redirects to your configured homepage
2. It attempts to clean the URL bar after redirection to allow immediate typing
3. It provides a seamless Chrome-like new tab experience in Firefox

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

## Testing with End-to-End Tests

This project includes a comprehensive testing system using Playwright that runs multiple iterations to verify the extension's behavior.

### Running the Tests

```bash
# Standard test (3 iterations)
npm test

# Extended test with more iterations
npm run test:loop

# Headless test (for CI environments)
npm run test:headless
```

The tests will:

1. Package the extension into a zip file
2. Launch Firefox with the extension installed
3. Open new tabs in a loop to test the extension
4. Check if the redirection works and if the URL is cleaned
5. Take screenshots of the results
6. Generate a test summary report

### Test Configuration

You can modify the test configuration in `playwright-test.js`:

```javascript
const CONFIG = {
	testIterations: 3, // Number of test iterations
	testTimeout: 2000, // How long to wait for each test (ms)
	observationTime: 3000, // Time to observe the final result (ms)
	// ... other settings
}
```

## Development Workflow

1. Make changes to the extension code
2. Run the tests: `npm test`
3. Check the test results and screenshots
4. Repeat until you achieve the desired behavior

## How URL Cleaning Works

The extension uses two approaches to clean the URL bar:

1. **Data URL Approach**: Replaces the page with a data URL containing the same content
2. **Focus Approach**: Attempts to focus the address bar and clear it

Due to browser security restrictions, these methods are best-effort and may not work in all cases.

## Project Structure

- `manifest.json`: Extension configuration
- `newcleantab.html`: HTML for the new tab page
- `newcleantab.js`: Main script that redirects to homepage
- `background.js`: Background script for URL cleaning
- `playwright-test.js`: End-to-end testing script
- `icon-generator.js`: Script to generate extension icons
- `package.json`: NPM configuration and scripts

## Available NPM Scripts

- `npm test`: Run the tests
- `npm run test:loop`: Run tests with more iterations
- `npm run test:headless`: Run tests in headless mode
- `npm run build`: Package the extension into a zip file
- `npm run icons`: Generate extension icons
- `npm run clean`: Clean temporary files
- `npm run setup`: Full setup (install deps, generate icons, build)

## Known Limitations

- Browser security policies limit the ability to manipulate the URL after redirection
- Some websites use Content Security Policy headers that prevent URL manipulation
- URL clearing is a best-effort approach and may not work on all sites

## Alternatives if URL Cleaning Fails

If automatic URL cleaning doesn't work due to browser security restrictions:

1. Create a custom new tab page with quick links to favorite sites
2. Use keyboard shortcuts (Alt+D or Ctrl+L) to focus the address bar manually
3. Consider using a different extension approach that doesn't require URL cleaning
