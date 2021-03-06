/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

// 주석으로 가려진 코드는 linter-vscode 도입을 위한 코드

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

// import { debounce } from "lodash";
// import { LinterOffense } from "vscode-linter-api";
// import { CodeActionProvider } from "./CodeActionProvider";
// import { run, fix, fixInline, ignore } from "./linters/run";
// import { getEditor } from "./helpers/getEditor";

let client: LanguageClient;
let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: ExtensionContext) {

	// const runLinters = debounce(run, 200);
	// const runFix = debounce(fix, 200);
	// const runIgnore = debounce(ignore, 200);
	// const { subscriptions } = context;
	// const offenses: LinterOffense[] = [];
	// const diagnostics = vscode.languages.createDiagnosticCollection("linter");
	// const codeActionProvider = new CodeActionProvider(diagnostics, offenses);

	// // Diagnostics code ----------------------------------------------------------
	// if (vscode.window.activeTextEditor) {
	// 	runLinters(vscode.window.activeTextEditor.document, diagnostics, offenses);
	// }

	// subscriptions.push(
	// 	vscode.window.onDidChangeActiveTextEditor((editor) => {
	// 		if (editor) {
	// 			runLinters(editor.document, diagnostics, offenses);
	// 		}
	// 	}),
	// );

	// subscriptions.push(
	// 	vscode.workspace.onDidChangeTextDocument(({ document }) => {
	// 		runLinters(document, diagnostics, offenses);
	// 	}),
	// );

	// // CodeAction code -----------------------------------------------------------
	// subscriptions.push(
	// 	vscode.languages.registerCodeActionsProvider("*", codeActionProvider),
	// );

	// subscriptions.push(
	// 	vscode.commands.registerCommand(
	// 		"linter.fix",
	// 		(offense: LinterOffense, type: string) => {
	// 			const editor = getEditor(offense.uri);

	// 			if (editor) {
	// 				runFix(offense, editor, type);
	// 			}
	// 		},
	// 	),
	// );

	// subscriptions.push(
	// 	vscode.commands.registerCommand(
	// 		"linter.fixInline",
	// 		(offense: LinterOffense) => {
	// 			const editor = getEditor(offense.uri);

	// 			if (editor) {
	// 				fixInline(offense, editor);
	// 			}
	// 		},
	// 	),
	// );

	// subscriptions.push(
	// 	vscode.commands.registerCommand("linter.openUrl", (url: string) => {
	// 		vscode.env.openExternal(vscode.Uri.parse(url));
	// 	}),
	// );

	// subscriptions.push(
	// 	vscode.commands.registerCommand(
	// 		"linter.ignoreOffense",
	// 		(offense: LinterOffense, type: string) => {
	// 			runIgnore(offense, type);
	// 		},
	// 	),
	// );

	// 언어 서버 모듈
	const serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);

	// 서버의 디버그 옵션 지정
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// 디버깅 모드에서 실행되면 디버그 서버 옵션이 쓰이고 아니면 다음 옵션이 사용됨
	const serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Language Client를 제어할 옵션
	const clientOptions: LanguageClientOptions = {

		documentSelector: [{ scheme: 'file', language: 'java' }],
		synchronize: {
			// 워크스페이스에 있는 .clientirc 파일들을 변경하며 서버에게 파일이 변경되었음을 알림
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// LanguageClient를 만들기
	client = new LanguageClient(
		'cjpLinter',
		'C/C++, JAVA, Python Linter',
		serverOptions,
		clientOptions
	);

	// 클라이언트 시작, 서버도 이때 실행됨
	client.start();

	// // eslint-disable-next-line @typescript-eslint/no-var-requires
	// const server = require('../../server/src/server.ts');

	// 명령 추가
	const appendNewPattern = vscode.commands.registerCommand('cjp-linter.appendNewPattern', () => {
		vscode.window.showInformationMessage('Append New Pattern from cjp-linter');
		// server.appendPattern(/\s{2,}/g);
	});

	context.subscriptions.push(appendNewPattern);

}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
