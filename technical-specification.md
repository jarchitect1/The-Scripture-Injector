# The Scripture Injector - Technical Specification

## 1. Plugin Configuration

### manifest.json
```json
{
  "id": "the-scripture-injector",
  "name": "The Scripture Injector",
  "version": "1.0.0",
  "minAppVersion": "0.15.0",
  "description": "Seamlessly integrate Bible verses into your notes with support for multiple translations.",
  "author": "Your Name",
  "authorUrl": "https://your-website.com",
  "fundingUrl": "https://your-funding-page.com",
  "isDesktopOnly": false
}
```

### Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^16.11.6",
    "@typescript-eslint/eslint-plugin": "5.29.0",
    "@typescript-eslint/parser": "5.29.0",
    "builtin-modules": "3.3.0",
    "esbuild": "0.17.3",
    "obsidian": "latest",
    "tslib": "2.4.0",
    "typescript": "4.7.4"
  }
}
```

## 2. Type Definitions

### Bible Reference Types
```typescript
interface BibleReference {
  book: string;
  chapter: number;
  verses: number[] | { start: number; end: number }[];
  translation: string;
}

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

interface BibleAPIResponse {
  verses: BibleVerse[];
  canonical: string;
  passage: string;
}
```

### Plugin Settings Types
```typescript
interface ScriptureInjectorSettings {
  defaultTranslation: 'ESV' | 'NET';
  esvApiKey: string;
  formatTemplate: string;
  showTranslationName: boolean;
  showReference: boolean;
}
```

## 3. API Service Implementation

### ESV API Service
```typescript
class ESVAPIService {
  private apiKey: string;
  private baseUrl = 'https://api.esv.org/v3/rest/';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async fetchVerse(reference: string): Promise<BibleVerse> {
    const url = `${this.baseUrl}passageText/?q=${encodeURIComponent(reference)}&include-headings=false&include-verse-numbers=false`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Token ${this.apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`ESV API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      reference: data.canonical,
      text: data.passages[0],
      translation: 'ESV'
    };
  }
}
```

### NET Bible API Service
```typescript
class NETBibleAPIService {
  private baseUrl = 'https://labs.bible.org/api/?passage=';

  async fetchVerse(reference: string): Promise<BibleVerse> {
    const url = `${this.baseUrl}${encodeURIComponent(reference)}&type=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NET Bible API error: ${response.statusText}`);
    }

    const data = await response.json();
    const verses = data.map((verse: any) => verse.text).join(' ');
    
    return {
      reference,
      text: verses,
      translation: 'NET'
    };
  }
}
```

## 4. Reference Parser

```typescript
class BibleReferenceParser {
  private bookNames: Map<string, string> = new Map();
  private bookAbbreviations: Map<string, string> = new Map();

  constructor() {
    this.initializeBookMappings();
  }

  parse(reference: string): BibleReference {
    // Parse patterns like:
    // "John 3:16"
    // "Romans 8:28-39"
    // "Genesis 1:1-2:3"
    // "1 Cor 13:4-8"
    
    const regex = /^(\d?\s?\w+)\s+(\d+):(\d+)(?:-(\d+))?(?:-(\d+):(\d+))?$/;
    const match = reference.match(regex);
    
    if (!match) {
      throw new Error(`Invalid Bible reference format: ${reference}`);
    }

    const book = this.normalizeBookName(match[1]);
    const chapter = parseInt(match[2]);
    const startVerse = parseInt(match[3]);
    const endVerse = match[4] ? parseInt(match[4]) : startVerse;
    
    // Handle chapter ranges (e.g., Genesis 1:1-2:3)
    if (match[5] && match[6]) {
      const endChapter = parseInt(match[5]);
      const endVerseInChapter = parseInt(match[6]);
      
      return {
        book,
        chapter,
        verses: [{ start: startVerse, end: endVerse }],
        translation: '' // Will be set later
      };
    }

    return {
      book,
      chapter,
      verses: [{ start: startVerse, end: endVerse }],
      translation: '' // Will be set later
    };
  }

  private normalizeBookName(name: string): string {
    // Normalize book names and abbreviations to full names
    const normalized = name.trim().toLowerCase();
    return this.bookAbbreviations.get(normalized) || 
           this.bookNames.get(normalized) || 
           name;
  }

  private initializeBookMappings(): void {
    // Initialize book name mappings
    this.bookNames.set('genesis', 'Genesis');
    this.bookNames.set('exodus', 'Exodus');
    // ... all other books
    
    this.bookAbbreviations.set('gen', 'Genesis');
    this.bookAbbreviations.set('exod', 'Exodus');
    // ... all other abbreviations
  }
}
```

## 5. Verse Formatter

```typescript
class VerseFormatter {
  formatVerseForObsidian(verse: BibleVerse, settings: ScriptureInjectorSettings): string {
    const reference = verse.reference;
    const translation = verse.translation;
    const text = verse.text.trim();
    
    // Create quote callout with Bible icon
    let formatted = `[!quote]- 📖 ${reference}`;
    
    if (settings.showTranslationName) {
      formatted += ` (${translation})`;
    }
    
    formatted += `\n${text}`;
    
    return formatted;
  }
}
```

## 6. Modal UI Component

```typescript
class VerseSelectionModal extends SuggestModal<BibleVerse> {
  private plugin: ScriptureInjector;
  private currentInput: string = '';
  private selectedTranslation: string;

  constructor(plugin: ScriptureInjector) {
    super(plugin.app);
    this.plugin = plugin;
    this.selectedTranslation = plugin.settings.defaultTranslation;
  }

  getSuggestions(query: string): BibleVerse[] {
    // This would typically fetch suggestions from API
    // For now, return empty array - user must enter full reference
    return [];
  }

  renderSuggestion(verse: BibleVerse, el: HTMLElement) {
    el.createEl('div', { text: verse.reference });
  }

  onChooseSuggestion(verse: BibleVerse, evt: MouseEvent | KeyboardEvent) {
    this.insertVerse(verse);
  }

  async insertVerse(verse: BibleVerse) {
    const formatter = new VerseFormatter();
    const formattedVerse = formatter.formatVerseForObsidian(verse, this.plugin.settings);
    
    const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
    if (activeView) {
      const editor = activeView.editor;
      const cursor = editor.getCursor();
      editor.replaceRange(formattedVerse, cursor);
      this.close();
    }
  }

  onOpen() {
    const { contentEl } = this;
    
    // Create input for Bible reference
    const referenceContainer = contentEl.createDiv('reference-input-container');
    referenceContainer.createEl('h3', { text: 'Enter Bible Reference' });
    
    const referenceInput = referenceContainer.createEl('input', {
      type: 'text',
      placeholder: 'e.g., John 3:16, Romans 8:28-39'
    });
    
    // Create translation selector
    const translationContainer = contentEl.createDiv('translation-container');
    translationContainer.createEl('h4', { text: 'Select Translation' });
    
    const translationSelect = translationContainer.createEl('select');
    translationSelect.createEl('option', { value: 'ESV', text: 'English Standard Version (ESV)' });
    translationSelect.createEl('option', { value: 'NET', text: 'New English Translation (NET)' });
    
    translationSelect.value = this.selectedTranslation;
    translationSelect.addEventListener('change', (e) => {
      this.selectedTranslation = (e.target as HTMLSelectElement).value;
    });
    
    // Create fetch button
    const fetchButton = contentEl.createEl('button', { text: 'Fetch Verse' });
    fetchButton.addEventListener('click', async () => {
      const reference = referenceInput.value.trim();
      if (!reference) return;
      
      try {
        const verse = await this.plugin.fetchVerse(reference, this.selectedTranslation);
        this.insertVerse(verse);
      } catch (error) {
        new Notice(`Error fetching verse: ${error.message}`);
      }
    });
    
    // Focus on input
    referenceInput.focus();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
```

## 7. Main Plugin Class

```typescript
export default class ScriptureInjector extends Plugin {
  settings: ScriptureInjectorSettings;
  esvAPIService: ESVAPIService;
  netAPIService: NETBibleAPIService;
  referenceParser: BibleReferenceParser;

  async onload() {
    await this.loadSettings();
    
    // Initialize services
    this.esvAPIService = new ESVAPIService(this.settings.esvApiKey);
    this.netAPIService = new NETBibleAPIService();
    this.referenceParser = new BibleReferenceParser();
    
    // Add command
    this.addCommand({
      id: 'insert-bible-verse',
      name: 'Insert Bible Verse',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        new VerseSelectionModal(this).open();
      }
    });
    
    // Add settings tab
    this.addSettingTab(new ScriptureInjectorSettingTab(this.app, this));
  }

  onunload() {
    // Cleanup if needed
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async fetchVerse(reference: string, translation: string): Promise<BibleVerse> {
    try {
      const parsedReference = this.referenceParser.parse(reference);
      parsedReference.translation = translation;
      
      if (translation === 'ESV') {
        return await this.esvAPIService.fetchVerse(reference);
      } else if (translation === 'NET') {
        return await this.netAPIService.fetchVerse(reference);
      } else {
        throw new Error(`Unsupported translation: ${translation}`);
      }
    } catch (error) {
      throw new Error(`Failed to fetch verse: ${error.message}`);
    }
  }
}
```

## 8. Settings Tab

```typescript
class ScriptureInjectorSettingTab extends PluginSettingTab {
  plugin: ScriptureInjector;

  constructor(app: App, plugin: ScriptureInjector) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    containerEl.createEl('h2', { text: 'The Scripture Injector Settings' });
    
    new Setting(containerEl)
      .setName('Default Translation')
      .setDesc('Select your preferred Bible translation')
      .addDropdown(dropdown => dropdown
        .addOption('ESV', 'English Standard Version')
        .addOption('NET', 'New English Translation')
        .setValue(this.plugin.settings.defaultTranslation)
        .onChange(async (value: 'ESV' | 'NET') => {
          this.plugin.settings.defaultTranslation = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('ESV API Key')
      .setDesc('API key for ESV Bible API (required for ESV translation)')
      .addText(text => text
        .setPlaceholder('Enter your ESV API key')
        .setValue(this.plugin.settings.esvApiKey)
        .onChange(async (value) => {
          this.plugin.settings.esvApiKey = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Show Translation Name')
      .setDesc('Include translation name in formatted verses')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showTranslationName)
        .onChange(async (value) => {
          this.plugin.settings.showTranslationName = value;
          await this.plugin.saveSettings();
        }));
    
    new Setting(containerEl)
      .setName('Show Reference')
      .setDesc('Include Bible reference in formatted verses')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.showReference)
        .onChange(async (value) => {
          this.plugin.settings.showReference = value;
          await this.plugin.saveSettings();
        }));
  }
}
```

## 9. Build Configuration

### esbuild.config.mjs
```javascript
import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

const banner =
`/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = (process.argv[2] === 'production');

const context = await esbuild.context({
	banner: {
		js: banner,
	},
	entryPoints: ['src/main.ts'],
	bundle: true,
	external: [
		'obsidian',
		'electron',
		'@codemirror/autocomplete',
		'@codemirror/collab',
		'@codemirror/commands',
		'@codemirror/language',
		'@codemirror/lint',
		'@codemirror/search',
		'@codemirror/state',
		'@codemirror/view',
		'@lezer/common',
		'@lezer/highlight',
		'@lezer/lr',
		...builtins],
	format: 'cjs',
	target: 'es2018',
	logLevel: "info",
	sourcemap: prod ? false : 'inline',
	treeShaking: true,
	outfile: 'main.js',
});

if (prod) {
	await context.rebuild();
	process.exit(0);
} else {
	await context.watch();
}
```

This technical specification provides a comprehensive blueprint for implementing "The Scripture Injector" plugin with all the core functionality we discussed.