import { App, Plugin, PluginSettingTab, Setting, MarkdownView, Notice } from 'obsidian';
import { ScriptureInjectorSettings, BibleVerse } from './types/bible';
import { ESVAPIService } from './api/esv-api';
import { NETBibleAPIService } from './api/net-api';
import { BibleReferenceParser } from './parser/reference-parser';
import { VerseFormatter } from './formatter/verse-formatter';
import { VerseSelectionModal } from './modal';

const DEFAULT_SETTINGS: ScriptureInjectorSettings = {
	defaultTranslation: 'NET',
	esvApiKey: '',
	showTranslationName: true,
	showReference: true,
	verseCollapse: false
}

export default class ScriptureInjector extends Plugin {
	settings!: ScriptureInjectorSettings;
	esvAPIService!: ESVAPIService;
	netAPIService!: NETBibleAPIService;
	referenceParser!: BibleReferenceParser;
	verseFormatter!: VerseFormatter;

	async onload() {
		await this.loadSettings();
		
		// Initialize services
		this.referenceParser = new BibleReferenceParser();
		this.verseFormatter = new VerseFormatter();
		
		// Initialize API services
		if (this.settings.esvApiKey) {
			this.esvAPIService = new ESVAPIService(this.settings.esvApiKey);
		}
		this.netAPIService = new NETBibleAPIService();

		// Add the main command for inserting Bible verses
		this.addCommand({
			id: 'insert-bible-verse',
			name: 'Insert bible verse',
			editorCallback: (editor, view) => {
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
		
		// Reinitialize ESV API service if API key changed
		if (this.settings.esvApiKey) {
			this.esvAPIService = new ESVAPIService(this.settings.esvApiKey);
		}
	}

	async fetchVerse(reference: string, translation: string): Promise<BibleVerse> {
		try {
			// Parse and validate the reference
			const parsedReference = this.referenceParser.parse(reference);
			
			const validation = this.referenceParser.validateReference(parsedReference);
			
			if (!validation.valid) {
				throw new Error(`Invalid reference: ${validation.errors.join(', ')}`);
			}
			
			// Fetch verse from appropriate API
			if (translation === 'ESV') {
				if (!this.esvAPIService) {
					throw new Error('ESV API key is required. Please add it in settings.');
				}
				return await this.esvAPIService.fetchVerse(reference);
			} else if (translation === 'NET') {
				return await this.netAPIService.fetchVerse(reference);
			} else {
				throw new Error(`Unsupported translation: ${translation}`);
			}
		} catch (error) {
			throw new Error(`Failed to fetch verse: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	insertVerse(verse: BibleVerse) {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			const editor = activeView.editor;
			const cursor = editor.getCursor();
			const formattedVerse = this.verseFormatter.formatVerseForObsidian(verse, this.settings);
			editor.replaceRange(formattedVerse, cursor);
			new Notice(`Inserted: ${verse.reference}`);
		} else {
			new Notice('No active markdown editor found');
		}
	}
}

class ScriptureInjectorSettingTab extends PluginSettingTab {
	plugin: ScriptureInjector;

	constructor(app: App, plugin: ScriptureInjector) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('The scripture injector settings')
			.setHeading();

		new Setting(containerEl)
			.setName('Default translation')
			.setDesc('Select your preferred bible translation')
			.addDropdown(dropdown => dropdown
				.addOption('ESV', 'English Standard Version')
				.addOption('NET', 'New English Translation')
				.setValue(this.plugin.settings.defaultTranslation)
				.onChange(async (value: string) => {
					this.plugin.settings.defaultTranslation = value as 'ESV' | 'NET';
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('ESV API key')
			.setDesc('API key for ESV bible API (required for ESV translation)')
			.addText(text => text
				.setPlaceholder('Enter your ESV API key')
				.setValue(this.plugin.settings.esvApiKey)
				.onChange(async (value) => {
					this.plugin.settings.esvApiKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show translation name')
			.setDesc('Include translation name in formatted verses')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTranslationName)
				.onChange(async (value) => {
					this.plugin.settings.showTranslationName = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Show reference')
			.setDesc('Include bible reference in formatted verses')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showReference)
				.onChange(async (value) => {
					this.plugin.settings.showReference = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Verse collapse')
			.setDesc('Display verses in collapsible format')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.verseCollapse)
				.onChange(async (value) => {
					this.plugin.settings.verseCollapse = value;
					await this.plugin.saveSettings();
				}));
	}
}