import { Modal, Notice } from 'obsidian';
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
		contentEl.createEl('h2', { text: 'Insert bible verse' });
		
		// Create reference input section
		const referenceContainer = contentEl.createDiv('reference-input-container');
		referenceContainer.createEl('h3', { text: 'Enter bible reference' });
		
		this.referenceInput = referenceContainer.createEl('input', {
			type: 'text',
			placeholder: 'e.g., John 3:16, Romans 8:28-39, Genesis 1:1-2:3'
		});
		
		// Create translation selection section
		const translationContainer = contentEl.createDiv('translation-container');
		translationContainer.createEl('h3', { text: 'Select translation' });
		
		this.translationSelect = translationContainer.createEl('select');
		this.translationSelect.createEl('option', { value: 'ESV', text: 'English standard version' });
		this.translationSelect.createEl('option', { value: 'NET', text: 'New english translation' });
		
		this.translationSelect.value = this.plugin.settings.defaultTranslation;
		
		// Create fetch button
		const buttonContainer = contentEl.createDiv('button-container');
		this.fetchButton = buttonContainer.createEl('button', { 
			text: 'Fetch verse',
			cls: 'mod-cta'
		});
		
		// Add event listeners
		this.referenceInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') {
				void this.fetchAndInsertVerse();
			}
		});
		
		this.fetchButton.addEventListener('click', () => {
			void this.fetchAndInsertVerse();
		});
		
		// Focus on reference input
		this.referenceInput.focus();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	private async fetchAndInsertVerse() {
		const reference = this.referenceInput.value.trim();
		const translation = this.translationSelect.value as 'ESV' | 'NET';
		
		
		if (!reference) {
			new Notice('Please enter a bible reference');
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
			this.fetchButton.textContent = 'Fetch verse';
			this.fetchButton.disabled = false;
		}
	}

	private insertVerse(verse: BibleVerse) {
		this.plugin.insertVerse(verse);
	}

}