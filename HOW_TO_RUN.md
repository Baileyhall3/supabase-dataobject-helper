# How to Run the Supabase Data Object Helper Extension

## Method 1: Using F5 (Debug Mode)

1. **Open this project in VSCode**
2. **Make sure you're in the root directory** of the project (where package.json is located)
3. **Press F5** or go to **Run > Start Debugging**
4. **A new VSCode window will open** - this is the Extension Development Host
5. **In the new window**, look for the database icon in the Activity Bar (left sidebar)
6. **Click the database icon** to open the Supabase Data Objects panel

## Method 2: Using the Run and Debug Panel

1. **Open the Run and Debug panel** (Ctrl+Shift+D or Cmd+Shift+D)
2. **Select "Run Extension"** from the dropdown
3. **Click the green play button** or press F5
4. **A new VSCode window will open** - this is the Extension Development Host

## Method 3: Using Command Palette

1. **Press Ctrl+Shift+P** (or Cmd+Shift+P on Mac)
2. **Type "Debug: Start Debugging"**
3. **Select it and press Enter**
4. **A new VSCode window will open**

## What to Expect

When the Extension Development Host window opens:

1. **Look for the database icon** in the Activity Bar (left sidebar)
2. **Click it** to open the Supabase Data Objects panel
3. **You should see the configuration form** with fields for:
   - Supabase URL
   - Anonymous Key
   - Project Name (optional)

## Troubleshooting

### If F5 doesn't work:
- Make sure you have the project open in VSCode (not just individual files)
- Check that you're in the root directory where package.json is located
- Try running `npm run compile` first to make sure everything builds

### If the extension doesn't appear:
- Look for the database icon in the Activity Bar
- Try opening the Command Palette (Ctrl+Shift+P) and search for "Supabase"
- Check the Debug Console for any error messages

### If you see errors:
- Make sure all dependencies are installed: `npm install`
- Try rebuilding: `npm run compile`
- Check the Debug Console in the Extension Development Host for error messages

### Fixed Issues:
- ✅ **Icon property error**: Removed the icon requirement from package.json
- ✅ **Launch configuration**: Fixed the preLaunchTask to use "npm: compile"
- ✅ **Build tasks**: Added proper compile task configuration
- ✅ **TypeScript compilation errors**: Fixed tsconfig.json to include DOM types and skip lib checking
- ✅ **Supabase dependency types**: Added necessary type definitions and compiler options
- ✅ **Module resolution error**: Fixed moduleResolution to use "Node16" to match module setting

## Testing the Extension

Once you have the extension running:

1. **Configure Supabase**: Enter your Supabase URL and anonymous key
2. **Test Connection**: Click the "Test Connection" button
3. **Create Data Object**: Fill out the form and create a data object
4. **View Data**: Check the data preview section

## Alternative: Package and Install

If F5 still doesn't work, you can package the extension:

```bash
npm install -g vsce
vsce package
```

This will create a .vsix file that you can install manually in VSCode.
