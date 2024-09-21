# EasyFill

EasyFill is a powerful and user-friendly Chrome extension designed to streamline your typing experience by managing and expanding text snippets. With EasyFill, you can create, organize, and quickly insert frequently used text snippets across any website.

## Features

- **Snippet Management**: Create, edit, and delete text snippets with ease.
- **Category Organization**: Organize your snippets into categories for better management.
- **Quick Expansion**: Use customizable trigger symbols to quickly expand your snippets.
- **Search Functionality**: Easily find your snippets with the built-in search feature.
- **Import/Export**: Backup and restore your snippets and categories.
- **Auto-detect Mode**: Optionally enable auto-detection of snippet triggers.
- **Customizable Trigger Symbol**: Set your preferred trigger symbol for snippet expansion.

## Installation

1. Clone this repository or download the source code.
2. Open Google Chrome and navigate to `chrome://extensions`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the EasyFill icon in your Chrome toolbar to open the extension popup.
2. Use the "Add Snippet" tab to create new snippets:
   - Enter a command (trigger) for your snippet.
   - Type or paste the content of your snippet.
   - Select or create a category for the snippet.
3. In the "Snippets" tab, you can view, search, edit, or delete your existing snippets.
4. To use a snippet, type your trigger symbol followed by the snippet command in any text field on a webpage.

## Customization

- **Trigger Symbol**: Change your trigger symbol in the extension popup.
- **Auto-detect**: Toggle the auto-detect feature to automatically expand snippets as you type.

## Import/Export

- Use the Import/Export buttons at the bottom of the popup to backup or restore your snippets and categories.

## Development

This extension is built using React and TypeScript. To set up the development environment:

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

3. Build the extension:
   ```
   npm run build
   ```

## Acknowledgments

- This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components.
- Icons provided by [Lucide](https://lucide.dev/).
