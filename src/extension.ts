// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DataObjectWebviewProvider } from './webviewProvider';
import { ConfigManager } from './configManager';
import { createDataObject } from './dataObject';
import { DataObjectOptions } from './types';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Supabase Data Object Helper extension is now active!');

	// Create the webview provider
	const webviewProvider = new DataObjectWebviewProvider(context.extensionUri, context);

	// Register the webview provider
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			DataObjectWebviewProvider.viewType,
			webviewProvider
		)
	);

	// Register commands
	const configManager = new ConfigManager(context);

	// Command to open the configuration panel
	const openConfigCommand = vscode.commands.registerCommand('supabase-dataobject-helper.openConfig', () => {
		vscode.commands.executeCommand('workbench.view.extension.supabase-dataobject-helper');
	});

	// Command to create a data object programmatically (for advanced users)
	const createDataObjectCommand = vscode.commands.registerCommand('supabase-dataobject-helper.createDataObject', async () => {
		const config = await configManager.getSupabaseConfig();
		if (!config) {
			vscode.window.showErrorMessage('No Supabase configuration found. Please configure Supabase first.');
			return;
		}

		// Get table name from user
		const viewName = await vscode.window.showInputBox({
			prompt: 'Enter table/view name',
			placeHolder: 'users'
		});

		if (!viewName) {
			return;
		}

		// Create basic data object options
		const options: DataObjectOptions = {
			viewName,
			canInsert: true,
			canUpdate: true,
			canDelete: true
		};

		try {
			const dataObject = await createDataObject(config, options);
			vscode.window.showInformationMessage(`Data object '${viewName}' created successfully!`);
			
			// Show some sample data
			const data = dataObject.getData();
			if (data.length > 0) {
				const sample = data.slice(0, 3);
				vscode.window.showInformationMessage(`Sample data: ${JSON.stringify(sample, null, 2)}`);
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error creating data object: ${error}`);
		}
	});

	// Command to test Supabase connection
	const testConnectionCommand = vscode.commands.registerCommand('supabase-dataobject-helper.testConnection', async () => {
		const config = await configManager.getSupabaseConfig();
		if (!config) {
			vscode.window.showErrorMessage('No Supabase configuration found. Please configure Supabase first.');
			return;
		}

		try {
			// Create a simple test to verify connection
			const testOptions: DataObjectOptions = {
				viewName: 'test_connection',
				recordLimit: 1
			};

			const testDataObject = await createDataObject(config, testOptions);
			vscode.window.showInformationMessage('Supabase connection test successful!');
			testDataObject.dispose();
		} catch (error) {
			vscode.window.showErrorMessage(`Connection test failed: ${error}`);
		}
	});

	// Command to clear configuration
	const clearConfigCommand = vscode.commands.registerCommand('supabase-dataobject-helper.clearConfig', async () => {
		const result = await vscode.window.showWarningMessage(
			'Are you sure you want to clear the Supabase configuration?',
			'Yes',
			'No'
		);

		if (result === 'Yes') {
			await configManager.clearSupabaseConfig();
		}
	});

	// Add all commands to subscriptions
	context.subscriptions.push(
		openConfigCommand,
		createDataObjectCommand,
		testConnectionCommand,
		clearConfigCommand,
		webviewProvider
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
