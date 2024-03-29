import * as vscode from 'vscode';




//const vscode = require('vscode');
const fs = require('fs/promises');

async function readFolderContents(folderPath) {
  try {
    const folderUri = vscode.Uri.file(folderPath);
    const entries = await vscode.workspace.fs.readDirectory(folderUri); // Corrected line
  
    const fileContents = {};
    for (const entry of entries) {
    const entryPath = vscode.Uri.joinPath(folderUri, entry.name);
    if (entry.type === vscode.FileType.Directory) {
      const subFolderContents = await readFolderContents(entryPath.fsPath);
      fileContents[entry.name] = subFolderContents;
    } else if (entry.type === vscode.FileType.File) {
      const content = await fs.readFile(entryPath.fsPath, 'utf8');
      fileContents[entry.name] = content;
    }
    }
    return fileContents;
  } catch (error) {
    vscode.window.showErrorMessage(`Error reading folder: ${error.message}`);
    return {};
  }
}

/**
 * Activates the extension when the custom command is triggered.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let folderContents = {}; // Variable to store file contents

  // Command to trigger folder selection and read contents
  const readFolderCommand = vscode.commands.registerCommand('dev---smith.readFolder', async () => {
    const folder = await vscode.window.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      title: 'Select Folder to Read'
    });

    if (folder && folder.length) {
      folderContents = await readFolderContents(folder[0].fsPath);

      // Save file contents to JSON and log to console
      try {
        const jsonData = JSON.stringify(folderContents, null, 2); // Format for readability
        const outputFilePath = folder[0].fsPath + '/folder_contents.json';
        await fs.writeFile(outputFilePath, jsonData, 'utf8');
        console.log('File contents saved to:', outputFilePath);
        console.log('File contents:\n', jsonData);
        vscode.window.showInformationMessage(`File contents written to ${outputFilePath}`);
      } catch (error) {
        vscode.window.showErrorMessage(`Error saving file: ${error.message}`);
      }

      vscode.window.showInformationMessage(`All files are read.`);
    }
  });

  // Command to open a webview
  // const openWebViewCommand = vscode.commands.registerCommand('dev---smith.openwebview', () => {
  //   const panel = vscode.window.createWebviewPanel(
  //     'helloWorld',
  //     'Hello World',
  //     vscode.ViewColumn.One,
  //     {}
  //   );

  //   panel.webview.html = getWebviewContent();
  // });

  // context.subscriptions.push(readFolderCommand);
  // context.subscriptions.push(openWebViewCommand);

  // Command to open a webview
  const openWebViewCommand = vscode.commands.registerCommand('dev---smith.openwebview', () => {
    const panel = vscode.window.createWebviewPanel(
      'helloWorld',
      'Hello World',
      vscode.ViewColumn.Two,
      {}
    );

    panel.webview.html = getWebviewContent(context);
  });

context.subscriptions.push(readFolderCommand);
context.subscriptions.push(openWebViewCommand);

}

function getWebviewContent() {
    const selection = vscode.window.activeTextEditor?.selection;

  // Check if there's an active text editor and a selection
  const selectedText = selection ? vscode.window.activeTextEditor.document.getText(selection) : '';

  return `

  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DEV://SMITH</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #222; /* Dark background color */
      color: white; /* Text color */
      font-family: Arial, sans-serif; /* Font */
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding-top: 20px; /* Added padding to top */
      height: 100vh;
    }
    h1 {
      text-align: center;
      margin-top: 0; /* Remove default margin */
    }
    textarea {
      width: 90%;
      height: 30vh;
      margin-bottom: 10px; /* Reduced margin between elements */
      padding: 10px;
      font-size: 16px;
      background-color: #333; /* Darker textarea background */
      color: white; /* Text color */
      border: none; /* Remove border */
    }
    .button-container {
      display: flex;
      justify-content: space-between;
      width: 90%;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      margin: 5px;
      background-color: #444; /* Darker button background */
      color: cyan;
      border: none; /* Remove border */
      cursor: pointer; /* Change cursor to pointer */
    }
    @media only screen and (max-width: 600px) {
      /* Adjust textarea height for smaller screens */
      textarea {
        height: 20vh;
      }
    }
  </style>
</head>
<body>
    <div class="container">
        <h1>DEV://SMITH</h1>
        <textarea id="inputContent">${selectedText}</textarea>
        <textarea id="aiOutput">AI Output</textarea>
        <div class="button-container">
            <button id="debugBtn">Debug</button>
            <button id="docBtn">Generate Documentation</button>
        </div>
    </div>


  <script>
        document.getElementById('debugBtn').addEventListener('click', function() {
          const inputContent = document.getElementById('inputContent').value;
          console.log(inputContent);

          // Send the selected text to the VS Code extension using postMessage
          vscode.postMessage({
            command: 'dev---smith.debugSelection',
            text: inputContent
          });
        });

        document.getElementById('docBtn').addEventListener('click', function() {
          alert('Generating documentation...');
        });
      </script>
</body>
</html>

  `;
}


// This line is only required if you want to access `getFolderContents` from other scripts
exports.activate = activate;
