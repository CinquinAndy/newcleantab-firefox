// End-to-end testing for New Clean Tab with Playwright
const { firefox } = require('playwright')
const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')

// Configuration - Edit these values as needed
const CONFIG = {
	extensionDir: __dirname,
	extensionZip: path.join(__dirname, 'new-clean-tab.zip'),
	testHomepage: 'https://example.com',
	testIterations: 3, // Number of times to repeat the test
	testTimeout: 2000, // Time to wait for a test iteration (ms)
	observationTime: 3000, // Time to observe the result (ms)
	loopDelay: 1000, // Delay between iterations (ms)
	takeScreenshots: true,
	cleanTempFiles: true,
}

// Create extension zip
function createExtensionZip() {
	console.log('\n📦 Packaging extension...')
	const zip = new AdmZip()

	// Add essential files
	const files = [
		'manifest.json',
		'newcleantab.html',
		'newcleantab.js',
		'background.js',
	]

	files.forEach(file => {
		const filePath = path.join(CONFIG.extensionDir, file)
		if (fs.existsSync(filePath)) {
			zip.addLocalFile(filePath)
			console.log(`  ✓ Added ${file}`)
		} else {
			console.warn(`  ✗ Missing file: ${file}`)
		}
	})

	// Check for icons
	;['icon48.png', 'icon96.png'].forEach(iconFile => {
		const iconPath = path.join(CONFIG.extensionDir, iconFile)
		if (fs.existsSync(iconPath)) {
			zip.addLocalFile(iconPath)
			console.log(`  ✓ Added ${iconFile}`)
		} else {
			console.warn(`  ✗ Missing icon: ${iconFile}. Run: npm run icons`)
		}
	})

	// Save zip
	zip.writeZip(CONFIG.extensionZip)
	console.log(`  ✓ Extension packaged to ${CONFIG.extensionZip}`)

	return CONFIG.extensionZip
}

// Test the extension in a loop
async function runTestLoop() {
	console.log('\n�� Starting e2e tests with Playwright...')
	console.log(`  • Will run ${CONFIG.testIterations} test iterations`)
	console.log(`  • Target homepage: ${CONFIG.testHomepage}`)

	// Create extension zip
	const extensionPath = createExtensionZip()

	// Extract to temp directory
	const tempExtDir = path.join(__dirname, 'temp-extension')
	if (fs.existsSync(tempExtDir)) {
		fs.rmSync(tempExtDir, { recursive: true, force: true })
	}
	fs.mkdirSync(tempExtDir, { recursive: true })

	const zip = new AdmZip(extensionPath)
	zip.extractAllTo(tempExtDir, true)
	console.log('  ✓ Extension extracted to temp directory')

	// Launch Firefox with the extension
	console.log('\n🦊 Launching Firefox...')
	const browser = await firefox.launchPersistentContext(
		'.playwright-firefox-profile',
		{
			headless: false,
			viewport: { width: 1280, height: 720 },
			args: [`--load-extension=${tempExtDir}`],
			firefoxUserPrefs: {
				'browser.startup.homepage': CONFIG.testHomepage,
				'browser.newtabpage.enabled': false,
				'browser.startup.page': 1,
				'devtools.console.stdout.content': true,
				'devtools.browsertoolbox.fission': true,
			},
		}
	)

	// Test results summary
	const results = {
		total: CONFIG.testIterations,
		redirected: 0,
		urlCleaned: 0,
		failures: 0,
	}

	try {
		// Open console in first page to see logs
		const initialPage = await browser.newPage()
		await initialPage.goto('about:blank')
		console.log('  ✓ Browser launched with extension')

		// Run tests in a loop
		console.log('\n🔄 Running tests in a loop...')
		for (let i = 0; i < CONFIG.testIterations; i++) {
			console.log(`\n▶️ Test iteration ${i + 1}/${CONFIG.testIterations}:`)

			// Open a new tab
			console.log('  • Opening new tab...')
			const page = await browser.newPage()

			// Wait for redirect
			console.log(`  • Waiting ${CONFIG.testTimeout}ms for redirect...`)
			await page.waitForTimeout(CONFIG.testTimeout)

			// Check current URL
			const currentUrl = page.url()
			console.log(`  • Current URL: ${currentUrl}`)

			// Evaluate result
			if (
				currentUrl === 'about:blank' ||
				currentUrl === 'about:newtab' ||
				currentUrl.startsWith('data:')
			) {
				console.log('  ✅ URL cleaned successfully!')
				results.urlCleaned++
				results.redirected++
			} else if (currentUrl === CONFIG.testHomepage) {
				console.log('  ✅ Redirected to homepage')
				console.log('  ⚠️ URL not cleaned')
				results.redirected++
			} else {
				console.log('  ❌ Unexpected behavior. URL not redirected or cleaned.')
				results.failures++
			}

			// Take screenshot
			if (CONFIG.takeScreenshots) {
				await page.screenshot({
					path: `test-result-${i + 1}.png`,
					fullPage: true,
				})
				console.log(`  📸 Screenshot saved to test-result-${i + 1}.png`)
			}

			// Allow manual observation
			if (i === CONFIG.testIterations - 1) {
				console.log(
					`  ⏳ Waiting ${
						CONFIG.observationTime / 1000
					}s for final observation...`
				)
				await page.waitForTimeout(CONFIG.observationTime)
			}

			// Close tab unless it's the last iteration
			if (i < CONFIG.testIterations - 1) {
				await page.close()
				console.log('  • Tab closed, waiting for next iteration...')
				await new Promise(resolve => setTimeout(resolve, CONFIG.loopDelay))
			}
		}

		// Print results summary
		console.log('\n📊 Test Results Summary:')
		console.log(`  • Total iterations: ${results.total}`)
		console.log(
			`  • Successful redirects: ${results.redirected} (${Math.round(
				(results.redirected / results.total) * 100
			)}%)`
		)
		console.log(
			`  • URL cleaning success: ${results.urlCleaned} (${Math.round(
				(results.urlCleaned / results.total) * 100
			)}%)`
		)
		console.log(`  • Failures: ${results.failures}`)

		console.log('\n🏁 Testing complete!')
	} catch (error) {
		console.error('\n❌ Test error:', error)
	} finally {
		// Close browser
		await browser.close()
		console.log('\n🧹 Browser closed')

		// Clean up temporary files
		if (CONFIG.cleanTempFiles) {
			if (fs.existsSync(tempExtDir)) {
				fs.rmSync(tempExtDir, { recursive: true, force: true })
			}
			console.log('  ✓ Temporary files cleaned up')
		}
	}
}

// Run the test loop
runTestLoop().catch(err => {
	console.error('Fatal error:', err)
	process.exit(1)
})
