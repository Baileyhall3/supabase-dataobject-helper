// NEW USAGE EXAMPLE - Using the Supabase Data Object Helper Extension API
// This demonstrates how to use the extension's global API functions

import * as vscode from 'vscode';

// Get the extension API
const supabaseExtension = vscode.extensions.getExtension('BHDesign.supabase-dataobject-helper');
const supabaseAPI = supabaseExtension?.exports;

// Alternative: You can also access the functions directly if the extension provides them globally
// import { DataObjectOptions } from 'supabase-dataobject-helper/types';

// Example 1: Creating a data object using the extension API
async function createUserDataObject() {
    if (!supabaseAPI) {
        console.error('Supabase extension not found or not activated');
        return;
    }

    // Create a data object with a specific name/ID
    const userDataObject = await supabaseAPI.createDataObject('myUsers', {
        viewName: 'users',
        fields: [
            { name: 'id', type: 'number' },
            { name: 'email', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'created_at', type: 'Date' }
        ],
        whereClauses: [
            { field: 'active', operator: 'equals', value: true }
        ],
        sort: { field: 'created_at', direction: 'desc' },
        recordLimit: 100,
        canInsert: true,
        canUpdate: true,
        canDelete: false
    });

    if (userDataObject) {
        console.log('User data object created successfully!');
        
        // Listen for data changes
        userDataObject.onDataChanged((data) => {
            console.log('User data updated:', data);
        });

        // Get current data
        const users = userDataObject.getData();
        console.log('Current users:', users);

        // Perform CRUD operations
        await userDataObject.insert({
            email: 'john@example.com',
            name: 'John Doe'
        });
    }
}

// Example 2: Accessing an existing data object from anywhere in your code
function accessExistingDataObject() {
    // Get a data object that was created through the UI or elsewhere
    const userDataObject = getDataObjectById('myUsers');
    
    if (userDataObject) {
        // Use the data object
        const users = userDataObject.getData();
        console.log('Found users:', users);
        
        // You can perform operations on it
        userDataObject.refresh();
    } else {
        console.log('Data object "myUsers" not found');
    }
}

// Example 3: Working with multiple data objects
async function multipleDataObjectsExample() {
    // Create multiple data objects for different purposes
    
    // Users data object
    await createDataObject('users', {
        viewName: 'users',
        canInsert: true,
        canUpdate: true,
        canDelete: false
    });

    // Orders data object with filtering
    await createDataObject('pendingOrders', {
        viewName: 'orders',
        whereClauses: [
            { field: 'status', operator: 'equals', value: 'pending' }
        ],
        sort: { field: 'created_at', direction: 'desc' },
        canInsert: true,
        canUpdate: true,
        canDelete: false
    });

    // Products data object (read-only)
    await createDataObject('products', {
        viewName: 'products',
        sort: { field: 'name', direction: 'asc' },
        canInsert: false,
        canUpdate: false,
        canDelete: false
    });

    // List all created data objects
    const allDataObjects = getAllDataObjects();
    console.log('Available data objects:', allDataObjects.map(obj => obj.name));
}

// Example 4: Using data objects in different parts of your application
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
        if (dataObject) {
            return await dataObject.insert(userData);
        }
        return false;
    }

    async updateUser(id: number, updates: any) {
        const dataObject = this.getUserDataObject();
        if (dataObject) {
            return await dataObject.update(id, updates);
        }
        return false;
    }

    async refreshUsers() {
        return await refreshDataObject('users');
    }
}

// Example 5: Dashboard component using reactive data
class DashboardComponent {
    constructor() {
        this.setupDataListeners();
    }

    private setupDataListeners() {
        // Listen to users data
        const userDataObject = getDataObjectById('users');
        if (userDataObject) {
            userDataObject.onDataChanged((users) => {
                this.updateUserStats(users);
            });
        }

        // Listen to orders data
        const ordersDataObject = getDataObjectById('pendingOrders');
        if (ordersDataObject) {
            ordersDataObject.onDataChanged((orders) => {
                this.updateOrderStats(orders);
            });
        }
    }

    private updateUserStats(users: any[]) {
        console.log(`Dashboard: ${users.length} active users`);
        // Update UI with user statistics
    }

    private updateOrderStats(orders: any[]) {
        const totalValue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        console.log(`Dashboard: ${orders.length} pending orders worth $${totalValue}`);
        // Update UI with order statistics
    }
}

// Example 6: Cleanup and management
function cleanupExample() {
    // Get all data objects
    const allDataObjects = getAllDataObjects();
    console.log('Current data objects:', allDataObjects);

    // Remove a specific data object
    const removed = removeDataObject('oldDataObject');
    if (removed) {
        console.log('Data object removed successfully');
    }

    // Refresh all data objects
    allDataObjects.forEach(async (obj) => {
        await refreshDataObject(obj.id);
    });
}

// Example 7: Error handling
async function errorHandlingExample() {
    try {
        // Attempt to create a data object
        const dataObject = await createDataObject('testObject', {
            viewName: 'non_existent_table',
            canInsert: false,
            canUpdate: false,
            canDelete: false
        });

        if (!dataObject) {
            console.log('Failed to create data object - check Supabase configuration');
            return;
        }

        // Use the data object
        const data = dataObject.getData();
        console.log('Data loaded:', data);

    } catch (error) {
        console.error('Error in data object operations:', error);
    }
}

// Export examples for use
export {
    createUserDataObject,
    accessExistingDataObject,
    multipleDataObjectsExample,
    UserService,
    DashboardComponent,
    cleanupExample,
    errorHandlingExample
};

// Usage instructions:
/*
1. Install the Supabase Data Object Helper extension
2. Configure your Supabase connection in the extension panel
3. Create data objects either through the UI or programmatically
4. Use getDataObjectById() to access data objects from anywhere in your code
5. The data objects are reactive - listen to onDataChanged events for real-time updates
6. Use the CRUD methods (insert, update, delete) as needed
7. Clean up data objects when no longer needed using removeDataObject()
*/
