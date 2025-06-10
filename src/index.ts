// Main entry point for the Supabase Data Object Helper extension
// This file exports all the public API functions that can be imported by other projects

// Re-export all API functions
export {
    getDataObjectById,
    createDataObject,
    getAllDataObjects,
    removeDataObject,
    refreshDataObject
} from './api';

// Re-export types for convenience
export type {
    DataObjectOptions,
    DataObjectField,
    WhereClause,
    SortConfig,
    SupabaseConfig,
    DataObjectRecord
} from './types';

// Re-export the DataObject class
export { DataObject } from './dataObject';

// Default export for easier importing
export * from './api';
