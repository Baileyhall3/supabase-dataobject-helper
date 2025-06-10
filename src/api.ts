// Public API for accessing data objects from anywhere in the extension
// This file provides the main functions that users can import and use in their code

import { DataObjectManager } from './dataObjectManager';
import { DataObject } from './dataObject';
import { DataObjectOptions } from './types';

/**
 * Get a data object by its ID/name
 * @param id The ID/name of the data object to retrieve
 * @returns The DataObject instance or null if not found
 * 
 * @example
 * ```typescript
 * import { getDataObjectById } from 'supabase-dataobject-helper';
 * 
 * const userDataObject = getDataObjectById('myUsers');
 * if (userDataObject) {
 *   const users = userDataObject.getData();
 *   console.log(users);
 * }
 * ```
 */
export function getDataObjectById(id: string): DataObject | null {
    try {
        const manager = DataObjectManager.getInstance();
        return manager.getDataObjectById(id);
    } catch (error) {
        console.error('DataObjectManager not initialized:', error);
        return null;
    }
}

/**
 * Create a new data object with the given name and options
 * @param name The name/ID for the data object
 * @param options The configuration options for the data object
 * @returns Promise that resolves to the DataObject instance or null if creation failed
 * 
 * @example
 * ```typescript
 * import { createDataObject } from 'supabase-dataobject-helper';
 * 
 * const userDataObject = await createDataObject('myUsers', {
 *   viewName: 'users',
 *   canInsert: true,
 *   canUpdate: true,
 *   canDelete: false
 * });
 * 
 * if (userDataObject) {
 *   const users = userDataObject.getData();
 *   console.log(users);
 * }
 * ```
 */
export async function createDataObject(name: string, options: DataObjectOptions): Promise<DataObject | null> {
    try {
        const manager = DataObjectManager.getInstance();
        return await manager.createDataObject(name, options);
    } catch (error) {
        console.error('DataObjectManager not initialized:', error);
        return null;
    }
}

/**
 * Get all currently created data objects
 * @returns Array of stored data object information
 * 
 * @example
 * ```typescript
 * import { getAllDataObjects } from 'supabase-dataobject-helper';
 * 
 * const allDataObjects = getAllDataObjects();
 * console.log('Available data objects:', allDataObjects.map(obj => obj.name));
 * ```
 */
export function getAllDataObjects() {
    try {
        const manager = DataObjectManager.getInstance();
        return manager.getAllDataObjects();
    } catch (error) {
        console.error('DataObjectManager not initialized:', error);
        return [];
    }
}

/**
 * Remove a data object by its ID/name
 * @param id The ID/name of the data object to remove
 * @returns True if the data object was removed, false otherwise
 * 
 * @example
 * ```typescript
 * import { removeDataObject } from 'supabase-dataobject-helper';
 * 
 * const success = removeDataObject('myUsers');
 * if (success) {
 *   console.log('Data object removed successfully');
 * }
 * ```
 */
export function removeDataObject(id: string): boolean {
    try {
        const manager = DataObjectManager.getInstance();
        return manager.removeDataObject(id);
    } catch (error) {
        console.error('DataObjectManager not initialized:', error);
        return false;
    }
}

/**
 * Refresh a data object by reloading its data from Supabase
 * @param id The ID/name of the data object to refresh
 * @returns Promise that resolves to true if refresh was successful, false otherwise
 * 
 * @example
 * ```typescript
 * import { refreshDataObject } from 'supabase-dataobject-helper';
 * 
 * const success = await refreshDataObject('myUsers');
 * if (success) {
 *   console.log('Data object refreshed successfully');
 * }
 * ```
 */
export async function refreshDataObject(id: string): Promise<boolean> {
    try {
        const manager = DataObjectManager.getInstance();
        return await manager.refreshDataObject(id);
    } catch (error) {
        console.error('DataObjectManager not initialized:', error);
        return false;
    }
}

// Re-export types for convenience
export type { DataObjectOptions, DataObjectField, WhereClause, SortConfig, SupabaseConfig, DataObjectRecord } from './types';
export { DataObject } from './dataObject';
