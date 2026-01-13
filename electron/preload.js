const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  selectImages: () => ipcRenderer.invoke('select-images'),
  readImage: (path) => ipcRenderer.invoke('read-image', path),
  saveFile: (options) => ipcRenderer.invoke('save-file', options),
  fileExists: (path) => ipcRenderer.invoke('file-exists', path),
  showMessage: (options) => ipcRenderer.invoke('show-message', options)
});
