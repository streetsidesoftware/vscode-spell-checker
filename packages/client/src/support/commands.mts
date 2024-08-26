import { commands, Uri, window } from 'vscode';

import { getExtensionContext } from '../di.mjs';
import { openExternalUrl } from '../util/openUrl.mjs';
import { openNegativeFeedbackIssue } from './openIssue.mjs';

export async function about(): Promise<void> {
    const uriReadme = Uri.joinPath(getExtensionContext().extensionUri, 'resources/pages/About the Spell Checker.md');
    return commands.executeCommand('markdown.showPreview', null, [uriReadme], { lock: true });
}

export function supportRequest(): Promise<void> {
    return openMarkdown('resources/pages/Spell Checker Support Request.md');
}

export function reportIssue(): Promise<void> {
    return openMarkdown('resources/pages/Spell Checker Report Issue.md');
}

export function sponsor(): Promise<boolean> {
    return openExternalUrl('https://streetsidesoftware.com/sponsor/');
}

export async function rateTheSpellChecker(): Promise<void> {
    const ratings = ['⭐️⭐️⭐️⭐️', '⭐️⭐️⭐️', '⭐️⭐️', '⭐️'];
    const choice = await window.showInformationMessage('How would you rate the Spell Checker?', ...ratings);
    if (!choice) {
        // register that it was dismissed and reschedule.
        return;
    }
    const idx = ratings.indexOf(choice);
    const rating = 4 - idx;
    if (rating === 1) {
        const result = await window.showInformationMessage(
            'Thank you for your feedback. Would you provide more detail on how the Spell Checker can be improved by opening an issue on GitHub?',
            'Open Issue',
            'Not Now',
        );
        if (result === 'Open Issue') {
            return openNegativeFeedbackIssue();
        }
        return;
    }
    if (rating === 2) {
        await window.showInformationMessage('Thank you for your feedback.', 'Close');
        return;
    }
    const resultGTD = await window.showInformationMessage(
        'Does the Spell Checker help you avoid spelling mistakes and get things done?',
        'Yes',
        'No',
    );

    switch (resultGTD) {
        case 'Yes': {
            const result = await window.showInformationMessage(
                'Thank you for your feedback. The Spell Checker needs your support to continue to improve. Would you consider sponsoring the Spell Checker?',
                'Open Sponsor Page',
                'Ask me Later',
                'No',
            );
            switch (result) {
                case 'Open Sponsor Page':
                    await sponsor();
                    return;
                case 'Ask me Later':
                    // register that it was dismissed and reschedule.
                    await window.showInformationMessage('Thank you. We will ask again in about a month.', 'Close');
                    return;
                case 'No': {
                    const result = await window.showInformationMessage('Are you already a sponsor?', 'Yes', 'No');
                    if (result === 'Yes') {
                        // register response and do not ask again.
                        await window.showInformationMessage('Thank you for your support!', 'Close');
                        return;
                    }
                    await window.showInformationMessage(
                        'Thank you for your feedback. Would you provide more detail on how the Spell Checker can be improved by opening an issue on GitHub?',
                        'Open Issue',
                        'Not Now',
                    );
                    return;
                }
            }
            return;
        }
        case 'No': {
            const result = await window.showInformationMessage(
                'Thank you for your feedback. Would you provide more detail on how the Spell Checker can be improved by opening an issue on GitHub?',
                'Open Issue',
                'Not Now',
            );
            if (result === 'Open Issue') {
                return openNegativeFeedbackIssue();
            }
            return;
        }
    }
    await window.showInformationMessage('Thank you for your feedback.', 'Close');
}

export function releaseNotes(): Promise<void> {
    return openMarkdown('resources/pages/Spell Checker Release Notes.md');
}

async function openMarkdown(uri: Uri | string): Promise<void> {
    if (typeof uri === 'string') {
        uri = Uri.joinPath(getExtensionContext().extensionUri, uri);
    }
    return commands.executeCommand('markdown.showPreview', null, [uri], { lock: true });
}
