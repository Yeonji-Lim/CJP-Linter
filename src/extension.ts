// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "cjp-linter" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('cjp-linter.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from cjp-linter!');
	});

	let cLinter = vscode.commands.registerCommand('cjp-linter.cLinter', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('C Linter from cjp-linter!');
	});

	let javaLinter = vscode.commands.registerCommand('cjp-linter.javaLinter', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('JAVA Linter from cjp-linter!');
	});

	let pythonLinter = vscode.commands.registerCommand('cjp-linter.pythonLinter', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Python Linter from cjp-linter!');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(cLinter);
	context.subscriptions.push(javaLinter);
	context.subscriptions.push(pythonLinter);

}

// this method is called when your extension is deactivated
export function deactivate() {}
