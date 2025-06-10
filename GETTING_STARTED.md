# Getting Started with Supabase Data Object Helper

This guide will help you get started with the Supabase Data Object Helper VSCode extension.

## Quick Start

### 1. Install and Run the Extension

1. Open this project in VSCode
2. Press `F5` to run the extension in a new Extension Development Host window
3. In the new window, you'll see the Supabase Data Objects panel in the Activity Bar (database icon)

### 2. Configure Your Supabase Connection

1. Click on the Supabase Data Objects icon in the Activity Bar
2. In the Configuration panel, enter:
   - **Supabase URL**: Your project URL (e.g., `https://your-project.supabase.co`)
   - **Anonymous Key**: Your project's anon/public key from the Supabase dashboard
   - **Project Name**: (Optional) A friendly name for your project
3. Click "Save Configuration"
4. Click "Test Connection" to verify everything works

### 3. Create Your First Data Object

1. In the "Create Data Object" section, enter:
   - **Table/View Name**: Name of your Supabase table (e.g., `users`, `posts`, `orders`)
   - **Fields**: (Optional) Specify which columns to select, or leave empty for all
   - **Where Clauses**: (Optional) Add filtering conditions
   - **Sort Configuration**: (Optional) Specify how to sort the data
   - **Record Limit**: (Optional) Limit the number of records
   - **CRUD Operations**: Check the boxes for operations you want to allow

2. Click "Create Data Object"
3. You'll see a preview of your data in the "Data Preview" section

## Example: Creating a Users Data Object

Let's create a data object for a `users` table:

1. **Table/View Name**: `users`
2. **Fields**: Add these fields:
   - Field: `id`, Type: `number`
   - Field: `email`, Type: `string`
   - Field: `name`, Type: `string`
   - Field: `created_at`, Type: `Date`
3. **Where Clauses**: Add a filter:
   - Field: `active`, Operator: `equals`, Value: `true`
4. **Sort Field**: `created_at`
5. **Sort Direction**: `desc`
6. **Record Limit**: `100`
7. **CRUD Operations**: Check `Can Insert` and `Can Update`

Click "Create Data Object" and you'll see your users data appear in the preview!

## Using Data Objects in Your Code

Once you've created a data object through the UI, you can use it in your application code:

```typescript
// The extension provides these imports
import { createDataObject } from './src/dataObject';
import { DataObjectOptions, SupabaseConfig } from './src/types';

// Your data object will be reactive and provide CRUD operations
const userDataObject = await createDataObject(config, options);

// Listen for changes
userDataObject.onDataChanged((users) => {
    console.log('Users updated:', users);
    // Update your UI here
});

// Perform CRUD operations
await userDataObject.insert({ email: 'new@example.com', name: 'New User' });
await userDataObject.update(1, { name: 'Updated Name' });
await userDataObject.refresh(); // Manual refresh
```

## Available Commands

You can also use these commands from the Command Palette (`Ctrl+Shift+P`):

- **Supabase: Open Supabase Data Object Helper** - Opens the configuration panel
- **Supabase: Create Data Object** - Quick command to create a data object
- **Supabase: Test Supabase Connection** - Test your connection
- **Supabase: Clear Supabase Configuration** - Clear stored credentials

## Tips and Best Practices

### Security
- Your Supabase credentials are stored securely using VSCode's secret storage
- Never hardcode credentials in your source code
- Use Row Level Security (RLS) in Supabase for additional protection

### Performance
- Use `recordLimit` to avoid loading too much data at once
- Add appropriate `whereClauses` to filter data at the database level
- Consider using database views for complex queries

### Data Types
- Use the correct field types for better type safety:
  - `string` for text data
  - `number` for integers and decimals
  - `Date` for timestamps
  - `bit` for boolean values

### CRUD Operations
- Only enable CRUD operations you actually need
- `canInsert`: Allows creating new records
- `canUpdate`: Allows modifying existing records
- `canDelete`: Allows removing records

## Troubleshooting

### Connection Issues
- Verify your Supabase URL is correct
- Check that your anonymous key is valid
- Ensure your Supabase project is active
- Make sure the table/view exists and you have permissions

### Data Not Appearing
- Check that the table name is spelled correctly
- Verify you have read permissions on the table
- Try removing where clauses to see if they're too restrictive
- Check the browser console for error messages

### TypeScript Errors
- Make sure you're importing types correctly
- Verify your field types match your database schema
- Check that your tsconfig.json includes the src directory

## Next Steps

1. **Explore the Examples**: Check out `examples/usage-example.ts` for comprehensive usage patterns
2. **Integrate with Your App**: Use the data objects in your React, Vue, or other frontend applications
3. **Add Real-time Features**: Consider implementing Supabase real-time subscriptions for live updates
4. **Extend Functionality**: Add more operators, field types, or CRUD operations as needed

## Need Help?

- Check the README.md for detailed documentation
- Look at the example files for usage patterns
- File issues on the GitHub repository for bugs or feature requests

Happy coding with Supabase Data Objects! 🚀
