export interface ElectronAPI {
  selectFolder: () => Promise<string | null>;
  selectImages: () => Promise<string[]>;
  readImage: (path: string) => Promise<{ buffer: string; path: string; name: string } | null>;
  saveFile: (options: { filePath: string; base64Data: string; format: string }) => Promise<{ success: boolean; path?: string; error?: string }>;
  fileExists: (path: string) => Promise<boolean>;
  showMessage: (options: { type: string; title: string; message: string }) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
