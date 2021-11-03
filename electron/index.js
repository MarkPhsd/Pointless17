const { app, BrowserWindow, Menu, ipcRenderer: ipc } = require('electron');
const isDevMode       = require('electron-is-dev');
const { CapacitorSplashScreen, configCapacitor } = require('@capacitor/electron');
const { autoUpdater } = require('electron-updater');
const Registry        = require('winreg');
const path            = require('path');
const log             = require('electron-log');

//added
// const electronReload = require('electron-reloader')
// require('electron-reload')(__dirname, {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
//   hardResetMethod: 'exit'
// });

try {
  if (isDevMode) {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: false
    });
  }
} catch (err) {
  console.log('Error', err);
  log.info(`Error electron-reloader: ${err} `);
}

// https://gist.github.com/iffy/0ff845e8e3f59dbe7eaf2bf24443f104

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');
// Place holders for our windows so they don't get garbage collected.
let mainWindow  = null ;
// Placeholder for SplashScreen ref
let splashScreen = null;
//Change this if you do not wish to have a splash screen
let useSplashScreen = true;

// Create simple menu for easy devtools access, and for demo
const menuTemplateDev = [
  {
    label: 'Options',
    submenu: [
      {
        label: 'Open Dev Tools',
        click() {
          mainWindow.openDevTools();
        },
      },
    ],
  },
];

async function createWindow () {
  let url = ''
  if (!isDevMode) {
    url = `file://${__dirname}/app/index.html`
    // url = `http://localhost:4200/index.html`
  }

  if (isDevMode) { url = `http://192.168.0.16:4200/index.html`;  }

  try {
    mainWindow = new BrowserWindow({
      height: 920,
      width: 1600,
      show: false,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        nodeIntegrationInWorker: true,
        backgroundThrottling: false,
        contextIsolation: false,
        // preload: path.join(__dirname, 'node_modules', '@capacitor', 'electron', 'dist', 'electron-bridge.js')
        preload: path.join(url, 'node_modules', '@capacitor', 'electron', 'dist', 'electron-bridge.js')
      }
    });
  } catch (error) {
    log.info(`Error occured from mainwindow. ${error}`);
  }

  configCapacitor(mainWindow);

  if (isDevMode) {
    // Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
    // If we are developers we might as well open the devtools by default.
    mainWindow.webContents.openDevTools();
  }

  if(!isDevMode) {
    splashScreen = new CapacitorSplashScreen(mainWindow);
    splashScreen.init();
  } else {
    log.info(`Pointless loading Window From devmode : ${isDevMode} url ${url}`);
    mainWindow.loadURL(url);
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.show();
    });
  }

  if (mainWindow != null) {
    setInterval( readScale, 250);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

regKey = new Registry({                                       // new operator is optional
  hive: Registry.HKLM,                                        // open registry hive HKEY_CURRENT_USER
  // key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' // key containing autostart programs
  key: '\\SOFTWARE\\WOW6432Node\\ScaleService'
})

app.on('ready', function()  {
  if (!isDevMode) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

function readScale() {
  regKey.values(function (err, items /* array of RegistryItem */) {
    if (err) {
      log.error('reading registry' + err);
    }
    else
      try {
        if (mainWindow && mainWindow.webContents) {
          for (var i=0; i<items.length; i++) {
            const item = items[i];
              // log.error('reading registry' + items[i]  );
            if (item) {
              if (item.name == 'scaleType') {
                // log.info('ScaleType' + item.value);
                mainWindow.webContents.send('scaleType',  item.value)
                // log.error('reading registry ' + 'scaleType ',  item.value);
              }
              if (item.name == 'sWeight') {
                // log.info('ScaleWeight', item.value);
                mainWindow.webContents.send('scaleWeight',  item.value)
                // log.error('reading registry ' + 'scaleWeight ',  item.value);
              }
              //ValueToDivide
              if (item.name == 'ValueToDivide') {
                mainWindow.webContents.send('scaleValueToDivide',  item.value)
                // log.error('reading registry ' + 'scaleValueToDivide ',  item.value);
              }
              if (item.name == 'mode') {
                mainWindow.webContents.send('scaleMode',  item.value)
              }
            }
          }
        }
      } catch (error) {
        //we don't care.
      }
  });
}

autoUpdater.on('update-downloaded', (ev, info) => {
  if (!isDevMode) {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 5 seconds.
    // You could call autoUpdater.quitAndInstall(); immediately
    setTimeout(function() {
      autoUpdater.quitAndInstall();
    }, 5000)
  }
})

app.on('ready', function()  {
  if (!isDevMode) {
    autoUpdater.checkForUpdates();
  }
});

//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
// let win;

// function sendStatusToWindow(text) {
//   log.info(text);
//   win.webContents.send('message', text);
// }
// function createDefaultWindow() {
//   win = new BrowserWindow();
//   win.webContents.openDevTools();
//   win.on('closed', () => {
//     win = null;
//   });
//   // win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
//   win.loadURL(`file://${__dirname}/app/version.html`);
//   return win;
// }
// autoUpdater.on('checking-for-update', () => {
//   sendStatusToWindow('Checking for update...');
// })
// autoUpdater.on('update-available', (ev, info) => {
//   sendStatusToWindow('Update available.');
// })
// autoUpdater.on('update-not-available', (ev, info) => {
//   sendStatusToWindow('Update not available.');
// })
// autoUpdater.on('error', (ev, err) => {
//   sendStatusToWindow('Error in auto-updater.');
// })
// autoUpdater.on('download-progress', (ev, progressObj) => {
//   sendStatusToWindow('Download progress...');
// })
// autoUpdater.on('update-downloaded', (ev, info) => {
//   sendStatusToWindow('Update downloaded; will install in 5 seconds');
// });

// app.on('ready', function() {
//   // Create the Menu
//   // const menu = Menu.buildFromTemplate(template);
//   // Menu.setApplicationMenu(menu);
//   createDefaultWindow();
// });
// app.on('window-all-closed', () => {
//   app.quit();
// });

//-------------------------------------------------------------------
// Auto updates
//
// For details about these events, see the Wiki:
// https://github.com/electron-userland/electron-builder/wiki/Auto-Update#events
//
// The app doesn't need to listen to any events except `update-downloaded`
//
// Uncomment any of the below events to listen for them.  Also,
// look in the previous section to see them being used.
//-------------------------------------------------------------------
// autoUpdater.on('checking-for-update', () => {
// })
// autoUpdater.on('update-available', (ev, info) => {
// })
// autoUpdater.on('update-not-available', (ev, info) => {
// })
// autoUpdater.on('error', (ev, err) => {
// })
// autoUpdater.on('download-progress', (ev, progressObj) => {
// })

