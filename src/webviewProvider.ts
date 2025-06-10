import * as vscode from 'vscode';
import { DataObjectOptions, DataObjectField, WhereClause, SortConfig, SupabaseConfig } from './types';
import { ConfigManager } from './configManager';
import { DataObject } from './dataObject';
import { DataObjectManager, StoredDataObject } from './dataObjectManager';

export class DataObjectWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'supabaseDataObjectHelper.configView';

    private _view?: vscode.WebviewView;
    private configManager: ConfigManager;
    private dataObjectManager: DataObjectManager;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly context: vscode.ExtensionContext
    ) {
        this.configManager = new ConfigManager(context);
        this.dataObjectManager = DataObjectManager.getInstance(context);
        
        // Listen for data object changes
        this.dataObjectManager.onDataObjectsChanged((dataObjects) => {
            this.updateDataObjectsList(dataObjects);
        });
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'saveSupabaseConfig':
                    await this.handleSaveSupabaseConfig(data.config);
                    break;
                case 'loadSupabaseConfig':
                    await this.handleLoadSupabaseConfig();
                    break;
                case 'createDataObject':
                    await this.handleCreateDataObject(data.options);
                    break;
                case 'testConnection':
                    await this.handleTestConnection();
                    break;
                case 'clearConfig':
                    await this.handleClearConfig();
                    break;
            }
        });

        // Load existing config on startup
        this.handleLoadSupabaseConfig();
    }

    private async handleSaveSupabaseConfig(config: SupabaseConfig) {
        const success = await this.configManager.setSupabaseConfig(config);
        this._view?.webview.postMessage({
            type: 'supabaseConfigSaved',
            success
        });
    }

    private async handleLoadSupabaseConfig() {
        const config = await this.configManager.getSupabaseConfig();
        this._view?.webview.postMessage({
            type: 'supabaseConfigLoaded',
            config: config ? { ...config, anonKey: '***' } : null // Hide the actual key for security
        });
    }

    private async handleTestConnection() {
        const config = await this.configManager.getSupabaseConfig();
        if (!config) {
            vscode.window.showErrorMessage('No Supabase configuration found');
            return;
        }

        try {
            // Create a simple test data object to verify connection
            const testOptions: DataObjectOptions = {
                viewName: 'test_connection',
                recordLimit: 1
            };

            const testDataObject = new DataObject(config, testOptions);
            // The constructor will attempt to load data, which will test the connection
            
            vscode.window.showInformationMessage('Supabase connection test successful!');
            testDataObject.dispose();
        } catch (error) {
            vscode.window.showErrorMessage(`Connection test failed: ${error}`);
        }
    }

    private async handleClearConfig() {
        const success = await this.configManager.clearSupabaseConfig();
        if (success) {
            // Clear all data objects through the manager
            this.dataObjectManager.clearAllDataObjects();
            
            this._view?.webview.postMessage({
                type: 'configCleared'
            });
        }
    }

    private async handleCreateDataObject(options: DataObjectOptions & { name: string }) {
        if (!options.name) {
            vscode.window.showErrorMessage('Please provide a name for the data object.');
            return;
        }

        const dataObject = await this.dataObjectManager.createDataObject(options.name, options);
        if (dataObject) {
            // Set up data change listener
            dataObject.onDataChanged((data) => {
                this._view?.webview.postMessage({
                    type: 'dataObjectDataChanged',
                    name: options.name,
                    data,
                    options
                });
            });
        }
    }

    private updateDataObjectsList(dataObjects: StoredDataObject[]) {
        this._view?.webview.postMessage({
            type: 'dataObjectsListUpdated',
            dataObjects: dataObjects.map(obj => ({
                id: obj.id,
                name: obj.name,
                viewName: obj.options.viewName,
                createdAt: obj.createdAt
            }))
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Supabase Data Object Helper</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
        }
        
        .section {
            margin-bottom: 30px;
            padding: 15px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 5px;
        }
        
        .section h3 {
            margin-top: 0;
            color: var(--vscode-textLink-foreground);
        }
        
        .form-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        
        input, select, textarea {
            width: 100%;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 3px;
            box-sizing: border-box;
        }
        
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 15px;
            border-radius: 3px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        
        button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        
        .field-row {
            display: flex;
            gap: 10px;
            align-items: end;
            margin-bottom: 10px;
        }
        
        .field-row input, .field-row select {
            flex: 1;
        }
        
        .field-row button {
            margin: 0;
            padding: 8px 12px;
        }
        
        .checkbox-group {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .checkbox-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .checkbox-item input[type="checkbox"] {
            width: auto;
        }
        
        .data-preview {
            max-height: 300px;
            overflow-y: auto;
            border: 1px solid var(--vscode-panel-border);
            padding: 10px;
            background-color: var(--vscode-editor-background);
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }
        
        .status {
            padding: 10px;
            border-radius: 3px;
            margin-bottom: 15px;
        }
        
        .status.success {
            background-color: var(--vscode-testing-iconPassed);
            color: white;
        }
        
        .status.error {
            background-color: var(--vscode-testing-iconFailed);
            color: white;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="section">
        <h3>Supabase Configuration</h3>
        <div class="form-group">
            <label for="supabaseUrl">Supabase URL:</label>
            <input type="text" id="supabaseUrl" placeholder="https://your-project.supabase.co">
        </div>
        <div class="form-group">
            <label for="supabaseAnonKey">Anonymous Key:</label>
            <input type="password" id="supabaseAnonKey" placeholder="Your anon key">
        </div>
        <div class="form-group">
            <label for="projectName">Project Name (Optional):</label>
            <input type="text" id="projectName" placeholder="My Project">
        </div>
        <button onclick="saveSupabaseConfig()">Save Configuration</button>
        <button class="secondary" onclick="testConnection()">Test Connection</button>
        <button class="secondary" onclick="clearConfig()">Clear Configuration</button>
    </div>

    <div class="section">
        <h3>Create Data Object</h3>
        <div class="form-group">
            <label for="dataObjectName">Data Object Name (ID):</label>
            <input type="text" id="dataObjectName" placeholder="myUsers" required>
            <small style="color: var(--vscode-descriptionForeground);">This will be used as the ID to access the data object from your code</small>
        </div>
        <div class="form-group">
            <label for="viewName">Table/View Name:</label>
            <input type="text" id="viewName" placeholder="users">
        </div>
        
        <div class="form-group">
            <label>Fields (Optional - leave empty to select all):</label>
            <div id="fieldsContainer">
                <div class="field-row">
                    <input type="text" placeholder="Field name" class="field-name">
                    <select class="field-type">
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="Date">Date</option>
                        <option value="bit">Boolean</option>
                    </select>
                    <button onclick="removeField(this)">Remove</button>
                </div>
            </div>
            <button class="secondary" onclick="addField()">Add Field</button>
        </div>
        
        <div class="form-group">
            <label>Where Clauses (Optional):</label>
            <div id="whereContainer">
                <div class="field-row">
                    <input type="text" placeholder="Field name" class="where-field">
                    <select class="where-operator">
                        <option value="equals">Equals</option>
                        <option value="notequals">Not Equals</option>
                        <option value="greaterthan">Greater Than</option>
                        <option value="lessthan">Less Than</option>
                    </select>
                    <input type="text" placeholder="Value" class="where-value">
                    <button onclick="removeWhere(this)">Remove</button>
                </div>
            </div>
            <button class="secondary" onclick="addWhere()">Add Where Clause</button>
        </div>
        
        <div class="form-group">
            <label for="sortField">Sort Field (Optional):</label>
            <input type="text" id="sortField" placeholder="created_at">
        </div>
        
        <div class="form-group">
            <label for="sortDirection">Sort Direction:</label>
            <select id="sortDirection">
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="recordLimit">Record Limit (Optional):</label>
            <input type="number" id="recordLimit" placeholder="100">
        </div>
        
        <div class="form-group">
            <label>CRUD Operations:</label>
            <div class="checkbox-group">
                <div class="checkbox-item">
                    <input type="checkbox" id="canInsert">
                    <label for="canInsert">Can Insert</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="canUpdate">
                    <label for="canUpdate">Can Update</label>
                </div>
                <div class="checkbox-item">
                    <input type="checkbox" id="canDelete">
                    <label for="canDelete">Can Delete</label>
                </div>
            </div>
        </div>
        
        <button onclick="createDataObject()">Create Data Object</button>
    </div>

    <div class="section">
        <h3>Data Objects</h3>
        <div id="dataObjectsList">
            <p>No data objects created yet.</p>
        </div>
    </div>

    <div class="section">
        <h3>Data Preview</h3>
        <div id="dataPreview" class="data-preview">
            No data objects created yet.
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function saveSupabaseConfig() {
            const config = {
                url: document.getElementById('supabaseUrl').value,
                anonKey: document.getElementById('supabaseAnonKey').value,
                projectName: document.getElementById('projectName').value || undefined
            };
            
            if (!config.url || !config.anonKey) {
                alert('Please provide both URL and Anonymous Key');
                return;
            }
            
            vscode.postMessage({
                type: 'saveSupabaseConfig',
                config: config
            });
        }
        
        function testConnection() {
            vscode.postMessage({ type: 'testConnection' });
        }
        
        function clearConfig() {
            if (confirm('Are you sure you want to clear the Supabase configuration?')) {
                vscode.postMessage({ type: 'clearConfig' });
            }
        }
        
        function addField() {
            const container = document.getElementById('fieldsContainer');
            const fieldRow = document.createElement('div');
            fieldRow.className = 'field-row';
            fieldRow.innerHTML = \`
                <input type="text" placeholder="Field name" class="field-name">
                <select class="field-type">
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="Date">Date</option>
                    <option value="bit">Boolean</option>
                </select>
                <button onclick="removeField(this)">Remove</button>
            \`;
            container.appendChild(fieldRow);
        }
        
        function removeField(button) {
            button.parentElement.remove();
        }
        
        function addWhere() {
            const container = document.getElementById('whereContainer');
            const whereRow = document.createElement('div');
            whereRow.className = 'field-row';
            whereRow.innerHTML = \`
                <input type="text" placeholder="Field name" class="where-field">
                <select class="where-operator">
                    <option value="equals">Equals</option>
                    <option value="notequals">Not Equals</option>
                    <option value="greaterthan">Greater Than</option>
                    <option value="lessthan">Less Than</option>
                </select>
                <input type="text" placeholder="Value" class="where-value">
                <button onclick="removeWhere(this)">Remove</button>
            \`;
            container.appendChild(whereRow);
        }
        
        function removeWhere(button) {
            button.parentElement.remove();
        }
        
        function createDataObject() {
            const dataObjectName = document.getElementById('dataObjectName').value;
            const viewName = document.getElementById('viewName').value;
            
            if (!dataObjectName) {
                alert('Please provide a data object name (ID)');
                return;
            }
            
            if (!viewName) {
                alert('Please provide a table/view name');
                return;
            }
            
            // Collect fields
            const fieldRows = document.querySelectorAll('#fieldsContainer .field-row');
            const fields = [];
            fieldRows.forEach(row => {
                const name = row.querySelector('.field-name').value;
                const type = row.querySelector('.field-type').value;
                if (name) {
                    fields.push({ name, type });
                }
            });
            
            // Collect where clauses
            const whereRows = document.querySelectorAll('#whereContainer .field-row');
            const whereClauses = [];
            whereRows.forEach(row => {
                const field = row.querySelector('.where-field').value;
                const operator = row.querySelector('.where-operator').value;
                const value = row.querySelector('.where-value').value;
                if (field && value) {
                    whereClauses.push({ field, operator, value });
                }
            });
            
            // Build sort config
            const sortField = document.getElementById('sortField').value;
            const sort = sortField ? {
                field: sortField,
                direction: document.getElementById('sortDirection').value
            } : undefined;
            
            const options = {
                name: dataObjectName,
                viewName,
                fields: fields.length > 0 ? fields : undefined,
                whereClauses: whereClauses.length > 0 ? whereClauses : undefined,
                sort,
                recordLimit: document.getElementById('recordLimit').value ? parseInt(document.getElementById('recordLimit').value) : undefined,
                canInsert: document.getElementById('canInsert').checked,
                canUpdate: document.getElementById('canUpdate').checked,
                canDelete: document.getElementById('canDelete').checked
            };
            
            vscode.postMessage({
                type: 'createDataObject',
                options: options
            });
        }
        
        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'supabaseConfigLoaded':
                    if (message.config) {
                        document.getElementById('supabaseUrl').value = message.config.url || '';
                        document.getElementById('projectName').value = message.config.projectName || '';
                        // Don't populate the anon key for security
                    }
                    break;
                case 'configCleared':
                    document.getElementById('supabaseUrl').value = '';
                    document.getElementById('supabaseAnonKey').value = '';
                    document.getElementById('projectName').value = '';
                    document.getElementById('dataPreview').innerHTML = 'No data objects created yet.';
                    document.getElementById('dataObjectsList').innerHTML = '<p>No data objects created yet.</p>';
                    break;
                case 'dataObjectDataChanged':
                    updateDataPreview(message.name, message.data, message.options);
                    break;
                case 'dataObjectsListUpdated':
                    updateDataObjectsList(message.dataObjects);
                    break;
            }
        });
        
        function updateDataPreview(key, data, options) {
            const preview = document.getElementById('dataPreview');
            const dataHtml = \`
                <h4>\${options.viewName} (\${data.length} records)</h4>
                <pre>\${JSON.stringify(data, null, 2)}</pre>
            \`;
            preview.innerHTML = dataHtml;
        }
        
        function updateDataObjectsList(dataObjects) {
            const listContainer = document.getElementById('dataObjectsList');
            
            if (dataObjects.length === 0) {
                listContainer.innerHTML = '<p>No data objects created yet.</p>';
                return;
            }
            
            const listHtml = dataObjects.map(obj => \`
                <div style="padding: 10px; margin-bottom: 10px; border: 1px solid var(--vscode-panel-border); border-radius: 3px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>\${obj.name}</strong> 
                            <span style="color: var(--vscode-descriptionForeground);">(\${obj.viewName})</span>
                        </div>
                        <div style="font-size: 0.9em; color: var(--vscode-descriptionForeground);">
                            Created: \${new Date(obj.createdAt).toLocaleString()}
                        </div>
                    </div>
                    <div style="margin-top: 5px; font-size: 0.9em; color: var(--vscode-descriptionForeground);">
                        Access with: <code>getDataObjectById('\${obj.id}')</code>
                    </div>
                </div>
            \`).join('');
            
            listContainer.innerHTML = listHtml;
        }
        
        // Load config on startup
        vscode.postMessage({ type: 'loadSupabaseConfig' });
    </script>
</body>
</html>`;
    }

    public dispose() {
        // The DataObjectManager will handle disposing of data objects
        // No need to dispose them here since we're using the manager
    }
}
