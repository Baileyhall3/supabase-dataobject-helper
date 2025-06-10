import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as vscode from 'vscode';
import { DataObjectOptions, DataObjectRecord, SupportedOperator, WhereClause, SupabaseConfig } from './types';

export class DataObject {
    private supabase: SupabaseClient;
    private options: DataObjectOptions;
    private data: DataObjectRecord[] = [];
    private eventEmitter = new vscode.EventEmitter<DataObjectRecord[]>();
    public readonly onDataChanged = this.eventEmitter.event;

    constructor(supabaseConfig: SupabaseConfig, options: DataObjectOptions) {
        this.supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);
        this.options = options;
        this.loadData();
    }

    private async loadData(): Promise<void> {
        try {
            // Start with base query
            let query: any = this.supabase.from(this.options.viewName);

            // Apply select fields
            if (this.options.fields && this.options.fields.length > 0) {
                const fieldNames = this.options.fields.map(f => f.name).join(',');
                query = query.select(fieldNames);
            } else {
                query = query.select('*');
            }

            // Apply where clauses
            if (this.options.whereClauses) {
                for (const whereClause of this.options.whereClauses) {
                    switch (whereClause.operator) {
                        case 'equals':
                            query = query.eq(whereClause.field, whereClause.value);
                            break;
                        case 'notequals':
                            query = query.neq(whereClause.field, whereClause.value);
                            break;
                        case 'greaterthan':
                            query = query.gt(whereClause.field, whereClause.value);
                            break;
                        case 'lessthan':
                            query = query.lt(whereClause.field, whereClause.value);
                            break;
                    }
                }
            }

            // Apply sorting
            if (this.options.sort) {
                query = query.order(this.options.sort.field, { 
                    ascending: this.options.sort.direction === 'asc' 
                });
            }

            // Apply record limit
            if (this.options.recordLimit) {
                query = query.limit(this.options.recordLimit);
            }

            const { data, error } = await query;

            if (error) {
                vscode.window.showErrorMessage(`Error loading data: ${error.message}`);
                return;
            }

            this.data = data || [];
            this.eventEmitter.fire(this.data);
        } catch (error) {
            vscode.window.showErrorMessage(`Error loading data: ${error}`);
        }
    }

    public getData(): DataObjectRecord[] {
        return [...this.data];
    }

    public async refresh(): Promise<void> {
        await this.loadData();
    }

    public async insert(record: Partial<DataObjectRecord>): Promise<boolean> {
        if (!this.options.canInsert) {
            vscode.window.showWarningMessage('Insert operation is not allowed for this data object');
            return false;
        }

        try {
            const { data, error } = await this.supabase
                .from(this.options.viewName)
                .insert(record)
                .select();

            if (error) {
                vscode.window.showErrorMessage(`Error inserting record: ${error.message}`);
                return false;
            }

            // Refresh data to get the latest state
            await this.refresh();
            vscode.window.showInformationMessage('Record inserted successfully');
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Error inserting record: ${error}`);
            return false;
        }
    }

    public async update(id: any, updates: Partial<DataObjectRecord>): Promise<boolean> {
        if (!this.options.canUpdate) {
            vscode.window.showWarningMessage('Update operation is not allowed for this data object');
            return false;
        }

        try {
            const { error } = await this.supabase
                .from(this.options.viewName)
                .update(updates)
                .eq('id', id);

            if (error) {
                vscode.window.showErrorMessage(`Error updating record: ${error.message}`);
                return false;
            }

            // Refresh data to get the latest state
            await this.refresh();
            vscode.window.showInformationMessage('Record updated successfully');
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Error updating record: ${error}`);
            return false;
        }
    }

    public async delete(id: any): Promise<boolean> {
        if (!this.options.canDelete) {
            vscode.window.showWarningMessage('Delete operation is not allowed for this data object');
            return false;
        }

        try {
            const { error } = await this.supabase
                .from(this.options.viewName)
                .delete()
                .eq('id', id);

            if (error) {
                vscode.window.showErrorMessage(`Error deleting record: ${error.message}`);
                return false;
            }

            // Refresh data to get the latest state
            await this.refresh();
            vscode.window.showInformationMessage('Record deleted successfully');
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Error deleting record: ${error}`);
            return false;
        }
    }

    public dispose(): void {
        this.eventEmitter.dispose();
    }
}

export async function createDataObject(supabaseConfig: SupabaseConfig, options: DataObjectOptions): Promise<DataObject> {
    return new DataObject(supabaseConfig, options);
}
