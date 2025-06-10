# Supabase Data Object Helper

A VSCode extension that simplifies creating and managing reactive data objects from Supabase for use in your projects. This extension provides a user-friendly interface to configure Supabase connections and create data objects with CRUD operations, filtering, sorting, and real-time reactivity.

## Features

- **Secure Configuration**: Store Supabase credentials securely using VSCode's secret storage
- **Visual UI**: Easy-to-use webview interface for configuring data objects
- **Reactive Data Objects**: Automatically update when data changes
- **CRUD Operations**: Support for Create, Read, Update, and Delete operations
- **Advanced Filtering**: Support for where clauses with multiple operators
- **Sorting & Limiting**: Configure sorting and record limits
- **Type Safety**: Full TypeScript support with proper type definitions

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Press `F5` to run the extension in a new Extension Development Host window

## Usage

### 1. Configure Supabase Connection

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Run "Supabase: Open Supabase Data Object Helper"
3. Enter your Supabase URL and Anonymous Key
4. Optionally provide a project name
5. Click "Save Configuration"
6. Test your connection using the "Test Connection" button

### 2. Create Data Objects

Using the UI:
1. In the Supabase Data Object Helper panel, fill out the "Create Data Object" form:
   - **Table/View Name**: The name of your Supabase table or view
   - **Fields**: Specify which fields to select (optional - leave empty for all fields)
   - **Where Clauses**: Add filtering conditions
   - **Sort Configuration**: Specify sorting field and direction
   - **Record Limit**: Limit the number of records returned
   - **CRUD Operations**: Enable/disable Insert, Update, Delete operations

2. Click "Create Data Object"

### 3. Using Data Objects in Code

```typescript
import { createDataObject } from 'supabase-dataobject-helper';
import { DataObjectOptions, SupabaseConfig } from 'supabase-dataobject-helper/types';

// Configuration (stored securely by the extension)
const config: SupabaseConfig = {
    url: 'https://your-project.supabase.co',
    anonKey: 'your-anon-key'
};

// Define your data object
const userOptions: DataObjectOptions = {
    viewName: 'users',
    fields: [
        { name: 'id', type: 'number' },
        { name: 'email', type: 'string' },
        { name: 'name', type: 'string' }
    ],
    whereClauses: [
        { field: 'active', operator: 'equals', value: true }
    ],
    sort: { field: 'created_at', direction: 'desc' },
    recordLimit: 100,
    canInsert: true,
    canUpdate: true,
    canDelete: false
};

// Create and use the data object
const userDataObject = await createDataObject(config, userOptions);

// Listen for data changes (reactive)
userDataObject.onDataChanged((data) => {
    console.log('User data updated:', data);
    // Update your UI here
});

// Get current data
const users = userDataObject.getData();

// CRUD operations
await userDataObject.insert({ email: 'john@example.com', name: 'John Doe' });
await userDataObject.update(1, { name: 'John Smith' });
await userDataObject.delete(1);

// Manual refresh
await userDataObject.refresh();

// Clean up when done
userDataObject.dispose();
```

## Available Commands

- `Supabase: Open Supabase Data Object Helper` - Opens the configuration panel
- `Supabase: Create Data Object` - Quick command to create a data object
- `Supabase: Test Supabase Connection` - Test your Supabase connection
- `Supabase: Clear Supabase Configuration` - Clear stored configuration

## Data Types

### Supported Field Types
- `string` - Text data
- `number` - Numeric data
- `Date` - Date/timestamp data
- `bit` - Boolean data

### Supported Operators
- `equals` - Exact match
- `notequals` - Not equal to
- `greaterthan` - Greater than
- `lessthan` - Less than

## Configuration

The extension stores your Supabase configuration securely using VSCode's secret storage API. Your credentials are never stored in plain text or in your project files.

### Required Configuration
- **Supabase URL**: Your project's Supabase URL (e.g., `https://your-project.supabase.co`)
- **Anonymous Key**: Your project's anonymous/public key

### Optional Configuration
- **Project Name**: A friendly name for your project

## Security

- All Supabase credentials are stored using VSCode's secure secret storage
- Credentials are never exposed in your code or project files
- The extension follows VSCode security best practices

## Examples

See the `examples/usage-example.ts` file for comprehensive usage examples including:
- Basic data object creation and usage
- Advanced filtering and sorting
- CRUD operations
- Reactive data handling
- Read-only reporting scenarios

## Development

### Building the Extension

```bash
npm run compile
```

### Running Tests

```bash
npm test
```

### Packaging

```bash
npm run package
```

## Requirements

- VSCode 1.100.0 or higher
- Node.js 20.x or higher
- A Supabase project with appropriate table permissions

## Extension Settings

This extension contributes the following settings:

- The extension uses VSCode's secret storage for configuration, so no settings are exposed in the settings.json file

## Known Issues

- Connection testing requires at least one table to exist in your Supabase database
- Real-time subscriptions are not yet implemented (data updates on manual refresh or CRUD operations)

## Release Notes

### 0.0.1

Initial release of Supabase Data Object Helper:
- Secure Supabase configuration storage
- Visual data object creation interface
- Reactive data objects with CRUD operations
- TypeScript support
- Command palette integration

### 1.0.1

Exposure of JS functions to get data objects from data objects store
- List of added data objects shown in extension side panel
- Access data objects from anywhere in app using `getDataObjectById('yourDataObjectName')`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have feature requests, please file an issue on the GitHub repository.
