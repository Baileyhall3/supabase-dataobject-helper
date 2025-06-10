# New Features - Global Data Object Access

This document describes the new features added to the Supabase Data Object Helper extension that allow you to access data objects from anywhere in your code.

## Overview

The extension now provides a global API that allows you to:
- Create named data objects that can be accessed from anywhere in your code
- Use `getDataObjectById()` to retrieve data objects by their ID/name
- Manage data objects through a centralized manager
- View all created data objects in the extension panel

## Key Features

### 1. Named Data Objects
When creating a data object, you now provide a **name** (ID) that serves as a unique identifier:

```typescript
// Create a data object with the name "myUsers"
const userDataObject = await createDataObject('myUsers', {
    viewName: 'users',
    canInsert: true,
    canUpdate: true,
    canDelete: false
});
```

### 2. Global Access Functions
Access your data objects from anywhere in your code:

```typescript
import { getDataObjectById } from 'supabase-dataobject-helper';

// Get the data object by its ID/name
const userDataObject = getDataObjectById('myUsers');
if (userDataObject) {
    const users = userDataObject.getData();
    console.log(users);
}
```

### 3. Extension Panel Integration
The extension panel now includes:
- **Data Objects section**: Shows all created data objects
- **Name field**: When creating data objects, specify the name/ID
- **Access instructions**: Shows how to access each data object in code

### 4. Centralized Management
All data objects are managed through a singleton `DataObjectManager`:
- Prevents duplicate names
- Handles cleanup and disposal
- Provides reactive updates to the UI

## API Reference

### Core Functions

#### `getDataObjectById(id: string): DataObject | null`
Retrieves a data object by its ID/name.

#### `createDataObject(name: string, options: DataObjectOptions): Promise<DataObject | null>`
Creates a new named data object.

#### `getAllDataObjects(): StoredDataObject[]`
Returns information about all created data objects.

#### `removeDataObject(id: string): boolean`
Removes a data object by its ID/name.

#### `refreshDataObject(id: string): Promise<boolean>`
Refreshes a data object's data from Supabase.

### Usage Patterns

#### Service Classes
```typescript
class UserService {
    private getUserDataObject() {
        return getDataObjectById('users');
    }

    async getAllUsers() {
        const dataObject = this.getUserDataObject();
        return dataObject ? dataObject.getData() : [];
    }

    async createUser(userData: any) {
        const dataObject = this.getUserDataObject();
        return dataObject ? await dataObject.insert(userData) : false;
    }
}
```

#### Reactive Components
```typescript
class DashboardComponent {
    constructor() {
        const userDataObject = getDataObjectById('users');
        if (userDataObject) {
            userDataObject.onDataChanged((users) => {
                this.updateUI(users);
            });
        }
    }
}
```

## Migration from Old Usage

### Before (Old Usage)
```typescript
import { createDataObject } from './src/dataObject';
import { DataObjectOptions, SupabaseConfig } from './src/types';

const userDataObject = await createDataObject(config, options);
```

### After (New Usage)
```typescript
import { getDataObjectById, createDataObject } from 'supabase-dataobject-helper';

// Create once (through UI or code)
await createDataObject('myUsers', options);

// Access anywhere
const userDataObject = getDataObjectById('myUsers');
```

## Benefits

1. **Reusability**: Create once, access anywhere in your application
2. **No Configuration Duplication**: Supabase config is managed by the extension
3. **UI Integration**: Visual management through the extension panel
4. **Type Safety**: Full TypeScript support with proper types
5. **Reactive**: Automatic UI updates when data changes
6. **Centralized**: All data objects managed in one place

## Examples

See `examples/new-usage-example.ts` for comprehensive examples of:
- Creating named data objects
- Accessing existing data objects
- Using multiple data objects
- Service class patterns
- Dashboard components
- Error handling
- Cleanup and management

## UI Changes

The extension panel now includes:

1. **Data Object Name Field**: Required field when creating data objects
2. **Data Objects Section**: Lists all created data objects with:
   - Name and table/view
   - Creation timestamp
   - Access code snippet
3. **Enhanced Management**: Clear visual feedback and organization

This new approach makes the extension much more practical for real-world applications where you need to access the same data objects from multiple parts of your codebase.
