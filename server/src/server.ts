/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver/node';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// import * as vscode from 'vscode';

// 서버를 위한 연결 생성 : Node의 IPC 모듈 사용
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// 문서 매니저 생성
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

// 초기화
connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that this server supports code completion.
			completionProvider: {
				resolveProvider: true
			}
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}
	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
let globalSettings: ExampleSettings = defaultSettings;

// 진단을 진행할 패턴 목록
const patternList: RegExp[] = [
	/\b[A-Z]{2,}\b/g
];

function exportTestFunc(): void {
	console.log("test success!!");
}

function isExistPattern(pattern: RegExp): boolean {
	for(const item in patternList) {
		if (item == pattern.toString()) return true;
	}
	return false;
}

function addPattern(pattern: RegExp): void {
	if(isExistPattern(pattern)) return;
	patternList.push(pattern);
}

// 열려있는 모든 문서의 설정 캐시
const documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

// 구성 변경에 대한 알림 핸들러 연결
connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// 문서 설정 초기화
		documentSettings.clear();
	} else {
		globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);
	}

	// 서버사이드에서 configuration 변경을 확인하고 설정이 변경되었다면 열려있는 문서를 다시 validate
	documents.all().forEach(validateTextDocument);
});

// 문서 설정 가져오기
function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'cjpLinter'
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// 문서가 닫히면 해당 문서는 문서 설정에서 삭제
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// 텍스트 문서가 처음 열리거나 그 내용이 수정될 때 호출됨
documents.onDidChangeContent(async change => {
	const textDocument = change.document;
	validateTextDocument(textDocument);
});

// let diagnosticCollection: vscode.DiagnosticCollection;

// 문서를 주어진 패턴으로 진단
async function validateTextDocument(textDocument: TextDocument): Promise<void> {
	// In this simple example we get the settings for every validate run.
	const settings = await getDocumentSettings(textDocument.uri);

	// The validator creates diagnostics
	const text = textDocument.getText();

	// diagnosticCollection = vscode.language.createDiagnosticCollection('java');


	let m: RegExpExecArray | null;

	let problems = 0;
	const diagnostics: Diagnostic[] = [];

	for(const pattern of patternList) {
		while ((m = pattern.exec(text)) && problems < settings.maxNumberOfProblems) {
			problems++;
			// severity - 심각성 정도, range - 해당 문제 범위, message - 출력 문구
			const diagnostic: Diagnostic = {
				severity: DiagnosticSeverity.Warning,
				range: {
					start: textDocument.positionAt(m.index),
					end: textDocument.positionAt(m.index + m[0].length)
				},
				message: `${m[0]}는 pattern ${pattern}에 맞지 않습니다.`,
				source: 'ex'
			};
			if (hasDiagnosticRelatedInformationCapability) {
				diagnostic.relatedInformation = [
					{
						location: {
							uri: textDocument.uri,
							range: Object.assign({}, diagnostic.range)
						},
						message: 'Spelling matters'
					},
					{
						location: {
							uri: textDocument.uri,
							range: Object.assign({}, diagnostic.range)
						},
						message: 'Particularly for names'
					}
				];
			}
			// 진단 목록에 삽입
			diagnostics.push(diagnostic);
		}
	}

	
	// 진단들을 연결로 다시 보냄
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// 파일 변경 감지
connection.onDidChangeWatchedFiles(_change => {
	connection.console.log('We received an file change event');
});

// completion item들의 초기 리스트 제공
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.

		// 문서에 있는 코드 컴플릿을 요청한 위치를 가지고 있는 TextDocumentPositionParams
		// 이를 무시하고 항상 동일한 Completion list를 제공한다.
		return [
			{
				label: 'TypeScript',
				kind: CompletionItemKind.Text,
				data: 1
			},
			{
				label: 'JavaScript',
				kind: CompletionItemKind.Text,
				data: 2
			}
		];
	}
);

// completion list에서 선택된 아이템에 대한 부가적인 정보를 제공한다.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data === 1) {
			item.detail = 'TypeScript details';
			item.documentation = 'TypeScript documentation';
		} else if (item.data === 2) {
			item.detail = 'JavaScript details';
			item.documentation = 'JavaScript documentation';
		}
		return item;
	}
);

// document manager : 문서의 열기, 수정, 닫기 이벤트 listen
documents.listen(connection);

connection.listen();

module.exports.test = exportTestFunc;
module.exports.appendPattern = addPattern;