// Example usage of the Supabase Data Object Helper Extension
// This file demonstrates how to use the data objects created by the extension

import { DataObject, createDataObject } from '../src/dataObject';
import { DataObjectOptions, SupabaseConfig } from '../src/types';

// Example 1: Basic usage with a users table
async function basicUsageExample() {
    // Configuration (this would normally be stored securely by the extension)
    const supabaseConfig: SupabaseConfig = {
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key',
        projectName: 'My Project'
    };

    // Define data object options
    const userOptions: DataObjectOptions = {
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
    };

    // Create the data object
    const userDataObject = await createDataObject(supabaseConfig, userOptions);

    // Listen for data changes (reactive)
    userDataObject.onDataChanged((data) => {
        console.log('User data updated:', data);
        // Update your UI here
    });

    // Get current data
    const users = userDataObject.getData();
    console.log('Current users:', users);

    // Insert a new user (if canInsert is true)
    const newUser = {
        email: 'john@example.com',
        name: 'John Doe'
    };
    await userDataObject.insert(newUser);

    // Update a user (if canUpdate is true)
    await userDataObject.update(1, { name: 'John Smith' });

    // Refresh data manually
    await userDataObject.refresh();

    // Clean up when done
    userDataObject.dispose();
}

// Example 2: Advanced usage with complex filtering
async function advancedUsageExample() {
    const supabaseConfig: SupabaseConfig = {
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key'
    };

    // Orders with complex filtering
    const orderOptions: DataObjectOptions = {
        viewName: 'orders',
        fields: [
            { name: 'id', type: 'number' },
            { name: 'customer_id', type: 'number' },
            { name: 'total_amount', type: 'number' },
            { name: 'status', type: 'string' },
            { name: 'created_at', type: 'Date' }
        ],
        whereClauses: [
            { field: 'status', operator: 'equals', value: 'pending' },
            { field: 'total_amount', operator: 'greaterthan', value: 100 }
        ],
        sort: { field: 'total_amount', direction: 'desc' },
        recordLimit: 50,
        canInsert: true,
        canUpdate: true,
        canDelete: true
    };

    const orderDataObject = await createDataObject(supabaseConfig, orderOptions);

    // Set up reactive data handling
    orderDataObject.onDataChanged((orders) => {
        // Update dashboard
        updateOrdersDashboard(orders);
        
        // Calculate totals
        const totalPending = orders.reduce((sum, order) => sum + order.total_amount, 0);
        console.log('Total pending orders value:', totalPending);
    });

    // CRUD operations
    const newOrder = {
        customer_id: 123,
        total_amount: 250.00,
        status: 'pending'
    };
    
    await orderDataObject.insert(newOrder);
    await orderDataObject.update(1, { status: 'processing' });
    
    // Clean up
    orderDataObject.dispose();
}

// Example 3: Read-only data object for reporting
async function reportingExample() {
    const supabaseConfig: SupabaseConfig = {
        url: 'https://your-project.supabase.co',
        anonKey: 'your-anon-key'
    };

    const salesReportOptions: DataObjectOptions = {
        viewName: 'sales_summary_view', // This could be a database view
        sort: { field: 'sale_date', direction: 'desc' },
        recordLimit: 30, // Last 30 days
        canInsert: false,
        canUpdate: false,
        canDelete: false
    };

    const salesDataObject = await createDataObject(supabaseConfig, salesReportOptions);

    // Auto-refresh every 5 minutes for live reporting
    const refreshInterval = setInterval(async () => {
        await salesDataObject.refresh();
    }, 5 * 60 * 1000);

    salesDataObject.onDataChanged((salesData) => {
        generateSalesReport(salesData);
    });

    // Clean up interval when done
    // clearInterval(refreshInterval);
    // salesDataObject.dispose();
}

// Helper functions (these would be implemented in your application)
function updateOrdersDashboard(orders: any[]) {
    // Update your UI with the new orders data
    console.log('Updating dashboard with', orders.length, 'orders');
}

function generateSalesReport(salesData: any[]) {
    // Generate and display sales report
    console.log('Generating sales report with', salesData.length, 'records');
}

// Export examples for use
export {
    basicUsageExample,
    advancedUsageExample,
    reportingExample
};
