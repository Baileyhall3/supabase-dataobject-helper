import * as vscode from 'vscode';
import { SupabaseConfig } from './types';

export class ConfigManager {
    private static readonly SUPABASE_URL_KEY = 'supabase.url';
    private static readonly SUPABASE_ANON_KEY = 'supabase.anonKey';
    private static readonly SUPABASE_PROJECT_NAME_KEY = 'supabase.projectName';

    constructor(private context: vscode.ExtensionContext) {}

    public async getSupabaseConfig(): Promise<SupabaseConfig | null> {
        try {
            const url = await this.context.secrets.get(ConfigManager.SUPABASE_URL_KEY);
            const anonKey = await this.context.secrets.get(ConfigManager.SUPABASE_ANON_KEY);
            const projectName = await this.context.secrets.get(ConfigManager.SUPABASE_PROJECT_NAME_KEY);

            if (!url || !anonKey) {
                return null;
            }

            return {
                url,
                anonKey,
                projectName: projectName || undefined
            };
        } catch (error) {
            vscode.window.showErrorMessage(`Error retrieving Supabase configuration: ${error}`);
            return null;
        }
    }

    public async setSupabaseConfig(config: SupabaseConfig): Promise<boolean> {
        try {
            await this.context.secrets.store(ConfigManager.SUPABASE_URL_KEY, config.url);
            await this.context.secrets.store(ConfigManager.SUPABASE_ANON_KEY, config.anonKey);
            
            if (config.projectName) {
                await this.context.secrets.store(ConfigManager.SUPABASE_PROJECT_NAME_KEY, config.projectName);
            }

            vscode.window.showInformationMessage('Supabase configuration saved securely');
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Error saving Supabase configuration: ${error}`);
            return false;
        }
    }

    public async clearSupabaseConfig(): Promise<boolean> {
        try {
            await this.context.secrets.delete(ConfigManager.SUPABASE_URL_KEY);
            await this.context.secrets.delete(ConfigManager.SUPABASE_ANON_KEY);
            await this.context.secrets.delete(ConfigManager.SUPABASE_PROJECT_NAME_KEY);

            vscode.window.showInformationMessage('Supabase configuration cleared');
            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Error clearing Supabase configuration: ${error}`);
            return false;
        }
    }

    public async hasSupabaseConfig(): Promise<boolean> {
        const config = await this.getSupabaseConfig();
        return config !== null;
    }
}
