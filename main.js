const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let adminWindow;

// Hàm lấy đường dẫn data file
function getDataFilePath() {
  const userDataPath = app.getPath('userData');

  // Tạo thư mục userData nếu chưa tồn tại
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  return path.join(userDataPath, 'data.json');
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createAdminWindow() {
  if (adminWindow) {
    adminWindow.focus();
    return;
  }

  globalShortcut.unregister('`');

  adminWindow = new BrowserWindow({
    width: 900,
    height: 700,
    parent: mainWindow,
    modal: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    autoHideMenuBar: true
  });

  adminWindow.loadFile('admin.html');

  adminWindow.on('closed', () => {
    adminWindow = null;
    globalShortcut.register('`', () => {
      createAdminWindow();
    });
  });
}

app.whenReady().then(() => {
  // Đăng ký IPC handlers
  ipcMain.handle('get-data-path', () => {
    return getDataFilePath();
  });

  createMainWindow();

  globalShortcut.register('`', () => {
    createAdminWindow();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.on('refresh-main', () => {
  if (mainWindow) {
    mainWindow.webContents.send('data-updated');
  }
});

ipcMain.on('admin-authenticated', () => {
  if (adminWindow) {
    adminWindow.webContents.send('show-admin-panel');
  }
});
