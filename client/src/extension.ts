/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';
import * as vscode from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: ExtensionContext) {
	// 서버 모듈
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
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'plaintext' }],
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

	// 명령 추가
	const disposable = vscode.commands.registerCommand('cjp-linter.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
