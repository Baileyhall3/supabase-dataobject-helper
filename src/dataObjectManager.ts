import * as vscode from 'vscode';
import { DataObject } from './dataObject';
import { DataObjectOptions, SupabaseConfig } from './types';
import { ConfigManager } from './configManager';

export interface NamedDataObjectOptions extends DataObjectOptions {
    name: string; // This will be the ID for accessing the data object
}

export interface StoredDataObject {
    id: string;
    name: string;
    options: DataObjectOptions;
    dataObject: DataObject;
    createdAt: Date;
}

export class DataObjectManager {
    private static instance: DataObjectManager;
    private dataObjects: Map<string, StoredDataObject> = new Map();
    private configManager: ConfigManager;
    private eventEmitter = new vscode.EventEmitter<StoredDataObject[]>();
    public readonly onDataObjectsChanged = this.eventEmitter.event;

    private constructor(context: vscode.ExtensionContext) {
        this.configManager = new ConfigManager(context);
    }

    public static getInstance(context?: vscode.ExtensionContext): DataObjectManager {
        if (!DataObjectManager.instance) {
            if (!context) {
                throw new Error('DataObjectManager must be initialized with context first');
            }
            DataObjectManager.instance = new DataObjectManager(context);
        }
        return DataObjectManager.instance;
    }

    public async createDataObject(name: string, options: DataObjectOptions): Promise<DataObject | null> {
        const config = await this.configManager.getSupabaseConfig();
        if (!config) {
            vscode.window.showErrorMessage('No Supabase configuration found. Please configure Supabase first.');
            return null;
        }

        // Check if name already exists
        if (this.dataObjects.has(name)) {
            vscode.window.showErrorMessage(`Data object with name '${name}' already exists. Please choose a different name.`);
            return null;
        }

        try {
            const dataObject = new DataObject(config, options);
            const storedDataObject: StoredDataObject = {
                id: name,
                name,
                options,
                dataObject,
                createdAt: new Date()
            };

            this.dataObjects.set(name, storedDataObject);
            this.eventEmitter.fire(Array.from(this.dataObjects.values()));

            vscode.window.showInformationMessage(`Data object '${name}' created successfully!`);
            return dataObject;
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating data object '${name}': ${error}`);
            return null;
        }
    }

    public getDataObjectById(id: string): DataObject | null {
        const storedDataObject = this.dataObjects.get(id);
        return storedDataObject ? storedDataObject.dataObject : null;
    }

    public getAllDataObjects(): StoredDataObject[] {
        return Array.from(this.dataObjects.values());
    }

    public removeDataObject(id: string): boolean {
        const storedDataObject = this.dataObjects.get(id);
        if (storedDataObject) {
            storedDataObject.dataObject.dispose();
            this.dataObjects.delete(id);
            this.eventEmitter.fire(Array.from(this.dataObjects.values()));
            vscode.window.showInformationMessage(`Data object '${id}' removed successfully!`);
            return true;
        }
        return false;
    }

    public async refreshDataObject(id: string): Promise<boolean> {
        const storedDataObject = this.dataObjects.get(id);
        if (storedDataObject) {
            try {
                await storedDataObject.dataObject.refresh();
                return true;
            } catch (error) {
                vscode.window.showErrorMessage(`Error refreshing data object '${id}': ${error}`);
                return false;
            }
        }
        return false;
    }

    public clearAllDataObjects(): void {
        this.dataObjects.forEach(storedDataObject => {
            storedDataObject.dataObject.dispose();
        });
        this.dataObjects.clear();
        this.eventEmitter.fire([]);
    }

    public dispose(): void {
        this.clearAllDataObjects();
        this.eventEmitter.dispose();
    }
}

// Global functions that can be used anywhere in the extension
export function getDataObjectById(id: string): DataObject | null {
    try {
        const manager = DataObjectManager.getInstance();
        return manager.getDataObjectById(id);
    } catch (error) {
        console.error('DataObjectManager not initialized:', error);
        return null;
    }
}

export async function createDataObject(name: string, options: DataObjectOptions): Promise<DataObject | null> {
    try {
        const manager = DataObjectManager.getInstance();
        return await manager.createDataObject(name, options);
    } catch (error) {
        console.error('DataObjectManager not initialized:', error);
        return null;
    }
}
