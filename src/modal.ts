import { App, Modal, Notice } from 'obsidian';
import ScriptureInjector from './main';
import { BibleVerse } from './types/bible';

export class VerseSelectionModal extends Modal {
	plugin: ScriptureInjector;
	referenceInput!: HTMLInputElement;
	translationSelect!: HTMLSelectElement;
	fetchButton!: HTMLButtonElement;
	isLoading: boolean = false;

	constructor(plugin: ScriptureInjector) {
		super(plugin.app);
		this.plugin = plugin;
	}


	onOpen() {
		const { contentEl } = this;
		
		// Set modal title
		contentEl.createEl('h2', { text: 'Insert Bible Verse' });
		
		// Create reference input section
		const referenceContainer = contentEl.createDiv('reference-input-container');
		referenceContainer.createEl('h3', { text: 'Enter Bible Reference' });
		
		this.referenceInput = referenceContainer.createEl('input', {
			type: 'text',
			placeholder: 'e.g., John 3:16, Romans 8:28-39, Genesis 1:1-2:3'
		});
		
		// Create translation selection section
		const translationContainer = contentEl.createDiv('translation-container');
		translationContainer.createEl('h3', { text: 'Select Translation' });
		
		this.translationSelect = translationContainer.createEl('select');
		this.translationSelect.createEl('option', { value: 'ESV', text: 'English Standard Version (ESV)' });
		this.translationSelect.createEl('option', { value: 'NET', text: 'New English Translation (NET)' });
		
		this.translationSelect.value = this.plugin.settings.defaultTranslation;
		
		// Create fetch button
		const buttonContainer = contentEl.createDiv('button-container');
		this.fetchButton = buttonContainer.createEl('button', { 
			text: 'Fetch Verse',
			cls: 'mod-cta'
		});
		
		// Add event listeners
		this.referenceInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				this.fetchAndInsertVerse();
			}
		});
		
		this.fetchButton.addEventListener('click', () => {
			this.fetchAndInsertVerse();
		});
		
		// Focus on reference input
		this.referenceInput.focus();
		
		// Add some basic styling
		this.addModalStyles();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private async fetchAndInsertVerse() {
		const reference = this.referenceInput.value.trim();
		const translation = this.translationSelect.value as 'ESV' | 'NET';
		
		
		if (!reference) {
			new Notice('Please enter a Bible reference');
			return;
		}
		
		if (this.isLoading) {
			return;
		}
		
		this.isLoading = true;
		this.fetchButton.textContent = 'Fetching...';
		this.fetchButton.disabled = true;
		
		try {
			const verse = await this.plugin.fetchVerse(reference, translation);
			this.insertVerse(verse);
			this.close();
		} catch (error) {
			new Notice(`Error: ${error instanceof Error ? error.message : String(error)}`);
		} finally {
			this.isLoading = false;
			this.fetchButton.textContent = 'Fetch Verse';
			this.fetchButton.disabled = false;
		}
	}

	private insertVerse(verse: BibleVerse) {
		this.plugin.insertVerse(verse);
	}

	private addModalStyles() {
		const style = document.createElement('style');
		style.textContent = `
			.reference-input-container, .translation-container, .button-container {
				margin-bottom: 20px;
			}
			
			.reference-input-container input, .translation-container select {
				width: 100%;
				padding: 4px 6px;
				border: 1px solid var(--background-modifier-border);
				border-radius: 4px;
				background-color: var(--background-primary);
				color: var(--text-normal);
				font-size: 14px;
			}
			
			.reference-input-container input:focus, .translation-container select:focus {
				outline: none;
				border-color: var(--interactive-accent);
			}
			
			.button-container {
				text-align: center;
			}
			
			.button-container button {
				padding: 10px 20px;
				background-color: var(--interactive-accent);
				color: var(--text-on-accent);
				border: none;
				border-radius: 4px;
				cursor: pointer;
				font-size: 14px;
				font-weight: 500;
				transition: background-color 0.2s;
			}
			
			.button-container button:hover {
				background-color: var(--interactive-accent-hover);
			}
			
			.button-container button:disabled {
				background-color: var(--background-modifier-border);
				color: var(--text-muted);
				cursor: not-allowed;
			}
			
			h3 {
				margin-bottom: 10px;
				color: var(--text-normal);
				font-size: 16px;
				font-weight: 500;
			}
			
			h2 {
				margin-bottom: 20px;
				color: var(--text-normal);
				font-size: 20px;
				font-weight: 600;
				text-align: center;
			}
		`;
		document.head.appendChild(style);
	}
}