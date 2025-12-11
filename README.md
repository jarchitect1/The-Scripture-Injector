# The Scripture Injector

An Obsidian plugin that helps pastors seamlessly integrate Bible verses into their notes with support for multiple translations.

## Features

- **Quick Verse Insertion**: Insert any Bible verse directly from the command palette (Ctrl/Cmd+P)
- **Multiple Translations**: Support for English Standard Version (ESV) and New English Translation (NET)
- **Beautiful Formatting**: Verses are inserted as formatted quote callouts with Bible icons
- **Flexible Reference Formats**: Supports various Bible reference formats (e.g., "John 3:16", "Romans 8:28-39")
- **Customizable Settings**: Configure default translation, API keys, and formatting options

## Installation

1. Download the latest release from the [Releases](https://github.com/your-username/the-scripture-injector/releases) page
2. Extract the contents to your Obsidian plugins folder (`<vault>/.obsidian/plugins/the-scripture-injector/`)
3. Enable the plugin in Obsidian Settings → Community Plugins
4. Configure your API keys in the plugin settings

## Setup

### ESV API Key (Optional)

The ESV translation requires an API key from [Crossway](https://api.esv.org/):

1. Visit [https://api.esv.org/](https://api.esv.org/)
2. Sign up for a free account
3. Generate an API key
4. Add the key to the plugin settings

### NET Bible API

The NET Bible API is free and doesn't require an API key.

## Usage

### Basic Usage

1. Open the command palette (Ctrl/Cmd+P)
2. Type "Insert Bible Verse" and select the command
3. Enter a Bible reference (e.g., "John 3:16", "Romans 8:28-39")
4. Select your preferred translation
5. Click "Fetch Verse"

### Supported Reference Formats

- Single verse: `John 3:16`
- Verse range: `Romans 8:28-39`
- Entire chapter: `Psalm 23`
- Chapter range: `Genesis 1:1-2:3`
- Book abbreviations: `1 Cor 13:4-8`, `Gen 1:1`

### Example Output

The plugin inserts verses in a beautiful quote callout format:

```markdown
[!quote]- 📖 John 3:16 (ESV)
For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.
```

## Settings

Configure the plugin in **Settings → The Scripture Injector**:

- **Default Translation**: Choose between ESV and NET
- **ESV API Key**: Enter your ESV API key (required for ESV translation)
- **Show Translation Name**: Include the translation abbreviation in formatted verses
- **Show Reference**: Include the Bible reference in formatted verses

## API Information

### English Standard Version (ESV)

- **API**: [ESV API](https://api.esv.org/)
- **Authentication**: Required (API key)
- **Rate Limit**: 5,000 requests per day (free tier)
- **Terms**: [ESV API Terms of Use](https://api.esv.org/docs/terms)

### New English Translation (NET)

- **API**: [NET Bible API](https://labs.bible.org/api_web_service)
- **Authentication**: None required
- **Rate Limit**: No official limit (please use responsibly)
- **Terms**: [NET Bible Terms](https://netbible.org/terms-of-use)

## Troubleshooting

### Common Issues

**"ESV API key is required"**
- Add your ESV API key in the plugin settings
- Ensure the key is entered correctly without extra spaces

**"Invalid Bible reference"**
- Check the reference format
- Ensure the book name is spelled correctly
- Verify chapter and verse numbers exist

**"Failed to fetch verse"**
- Check your internet connection
- Verify API key is valid (for ESV)
- Try the NET translation as an alternative

### Error Messages

- **Network Error**: Check your internet connection
- **API Rate Limit**: Wait a few minutes before trying again
- **Invalid Reference**: Verify the Bible reference format

## Development

### Building from Source

1. Clone the repository
2. Install dependencies: `npm install`
3. Build the plugin: `npm run build`
4. Copy the files to your Obsidian plugins folder

### Project Structure

```
src/
├── main.ts              # Main plugin class
├── modal.ts             # Verse selection modal
├── settings.ts           # Plugin settings
├── types/
│   └── bible.ts         # TypeScript type definitions
├── api/
│   ├── bible-api.ts     # Base API interface
│   ├── esv-api.ts       # ESV API implementation
│   └── net-api.ts       # NET Bible API implementation
├── parser/
│   └── reference-parser.ts # Bible reference parsing
└── formatter/
    └── verse-formatter.ts # Verse formatting for Obsidian
```

## Contributing

Contributions are welcome! Please feel free to submit issues and enhancement requests.

## License

This plugin is licensed under the MIT License.

## Changelog

### Version 1.0.1
- Fixed ESV API reference duplication issue
- Improved text cleaning for ESV API responses
- Enhanced verse formatting to remove duplicate references

### Version 1.0.0
- Initial release
- Support for ESV and NET Bible translations
- Command palette integration
- Customizable formatting options
- Comprehensive reference parsing

## Support

If you encounter any issues or have suggestions, please:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing [GitHub Issues](https://github.com/your-username/the-scripture-injector/issues)
3. Create a new issue with details about your problem

## Acknowledgments

- [Crossway](https://www.crossway.org/) for the ESV API
- [NET Bible](https://netbible.org/) for the NET Bible API
- The Obsidian community for plugin development resources