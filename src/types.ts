export type DataObjectFieldType = 'string' | 'bit' | 'Date' | 'number';

export type SupportedOperator = 'equals' | 'notequals' | 'greaterthan' | 'lessthan';

export interface DataObjectField {
    name: string;
    type: DataObjectFieldType;
}

export interface SortConfig {
    field: string;
    direction: 'asc' | 'desc';
}

export interface WhereClause {
    field: string;
    operator: SupportedOperator;
    value: any;
}

export interface DataObjectOptions {
    viewName: string;
    fields?: DataObjectField[];
    whereClauses?: WhereClause[];
    sort?: SortConfig;
    recordLimit?: number;
    canInsert?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
}

export interface SupabaseConfig {
    url: string;
    anonKey: string;
    projectName?: string;
}

export interface DataObjectRecord {
    [key: string]: any;
}
