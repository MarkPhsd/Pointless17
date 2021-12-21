const { app, BrowserWindow, Menu,ipcMain , ipcRenderer: ipc } = require('electron');
const { CapacitorSplashScreen, configCapacitor } = require('@capacitor/electron');
const registry        = require('winreg');
const path            = require('path');
const { autoUpdater, NsisUpdater  } = require('electron-updater');
const log             = require('electron-log');
const os              = require("os");
const isDevMode       = require('electron-is-dev');

try {
  if (isDevMode) {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: false
    });
  }
} catch (err) {
  log.info(`Error electron-reloader: ${err} `);
}

// https://gist.github.com/iffy/0ff845e8e3f59dbe7eaf2bf24443f104

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');


if (os.platform().trim() == "win32" || os.arch().trim() == "x64") {
  const options = {
      provider: 'generic',
      url: 'https://cafecartel.com/pointless'
  }
  const autoUpdater = new NsisUpdater(options)
  log.info(options)
  autoUpdater.checkForUpdatesAndNotify()
}


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
  if (!isDevMode) { url = `file://${__dirname}/app/index.html`  }
  if (isDevMode)  { url = `http://localhost:4200/index.html` }

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

  if (os.arch().trim() == "x64") {
    regKey.values(function (err, items /* array of RegistryItem */) {
      var interval
      var hexString
        if (!items) {return}
        for (var i=0; i<items.length; i++) {
          const item = items[i];
          if (item) {
            if (item.name == 'timerInterval') {
              hexString = item.value;
              if (hexString) { interval = parseInt(hexString, 16); }
              // log.info(`Scale Timer Interval: ${interval} `);
            }
          }
        }
        if (mainWindow != null && interval != 0) {
          setInterval( readScale, interval);
        }
      }
    )
  }

  if (os.platform().trim() == "win32")  {
    regKey32.values(function (err, items /* array of RegistryItem */) {
        var interval
        var hexString
        if (!items) {return}
        for (var i=0; i<items.length; i++) {
          const item = items[i];
          if (item) {
            if (item.name == 'timerInterval') {
              hexString = item.value;
              if (hexString) { interval = parseInt(hexString, 16); }
            }
          }
        }
        if (mainWindow != null && interval != 0) {
          setInterval( readScale32, interval);
        }
      }
    )
  }


}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () =>  {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('close', () =>  {
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

var regKey32 = new registry({                                       // new operator is optional
  hive: registry.HKLM,                                        // open registry hive HKEY_CURRENT_USER
  // key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' // key containing autostart programs
  key: '\\SOFTWARE\\ScaleService'
})

regKey = new registry({                                       // new operator is optional
  hive: registry.HKLM,                                        // open registry hive HKEY_CURRENT_USER
  // key:  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' // key containing autostart programs
  key: '\\SOFTWARE\\WOW6432Node\\ScaleService'
})

app.on('ready', function ()  {
  if (!isDevMode) {
    log.info('checkForUpdatesAndNotify'  )
    autoUpdater.checkForUpdatesAndNotify();
  }
});

function readScale() {
  //testing nodes

  regKey.values(function (err, items /* array of RegistryItem */) {
    if (err) {
      log.error('reading registry' + err);
    }
    else
      try {
        if (mainWindow && mainWindow.webContents) {
          var scaleInfo = {status: '', type: '', weight: '', valueToDivide: '', mode: ''}
          for (var i=0; i<items.length; i++) {
            const item = items[i];
             if (item) {
              if (item.name == 'scaleType') {
                scaleInfo.type = item.value;
              }
              if (item.name == 'mode') {
                scaleInfo.mode = item.value;
              }
              if (item.name == 'sWeight') {
                scaleInfo.weight = item.value;
              }
              if (item.name == 'ValueToDivide') {
                scaleInfo.valueToDivide = item.value;
              }
              if (item.name == 'ValueToDivide') {
                scaleInfo.status = item.value;
              }
            }
          }
          if (scaleInfo) {
            mainWindow.webContents.send('scaleInfo',  scaleInfo)
          }
        }
      } catch (error) {
      }
  });
}

function readScale32() {
  //testing nodes
  regKey32.values(function (err, items /* array of RegistryItem */) {
      if (err) {
        log.error('reading registry' + err);
      }
        else
      try {
        if (mainWindow && mainWindow.webContents) {
          var scaleInfo = {status: '', type: '', weight: '', valueToDivide: '', mode: ''}
          for (var i=0; i<items.length; i++) {
            const item = items[i];
              if (item) {
              if (item.name == 'scaleType') {
                scaleInfo.type = item.value;
              }
              if (item.name == 'mode') {
                scaleInfo.mode = item.value;
              }
              if (item.name == 'sWeight') {
                scaleInfo.weight = item.value;
              }
              if (item.name == 'ValueToDivide') {
                scaleInfo.valueToDivide = item.value;
              }
              if (item.name == 'status') {
                scaleInfo.status = item.value;
              }
            }
          }
          if (scaleInfo) {
            mainWindow.webContents.send('scaleInfo',  scaleInfo)
          }
        }
      } catch (error) {
      }
  });
}


autoUpdater.on('update-downloaded', (ev, info) => {
  if (info) {
    log.info(info + 'autoUpdater update-downloaded '  )
  } else {
    log.info( ' no info - autoUpdater update-downloaded '  )
  }

  if (!isDevMode) {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 5 seconds.
    // You could call autoUpdater.quitAndInstall(); immediately
    //testing nodes
    setTimeout(function() {
      log.info('checking autoUpdater for Quit And Install' )
      autoUpdater.quitAndInstall();
    }, 5000)
  }
})

app.on('ready', function()  {
  if (!isDevMode) {
    log.info('checking autoUpdater for App.on' )
    autoUpdater.checkForUpdates();
  }
});

ipcMain.on('getVersion', (event, arg) => {
  event.reply('getVersion', app.getVersion())
})

ipcMain.on('synchronous-message', (event, arg) => {
  event.returnValue = 'pong'
})

//-------------------------------------------------------------------
// Open a window that displays the version
//
// THIS SECTION IS NOT REQUIRED
//
// This isn't required for auto-updates to work, but it's easier
// for the app to show a window than to have to click "About" to see
// that updates are working.
//-------------------------------------------------------------------
let win;

function sendStatusToWindow(text) {
  log.info(text);
  if (webContents) {
    win.webContents.send('message', text);
  }
}

function createDefaultWindow() {
  win = new BrowserWindow();
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  // win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  win.loadURL(`file://${__dirname}/app/version.html`);
  return win;
}

autoUpdater.on('checking-for-update', () => {
  log.info(info + 'autoUpdater checking-for-update '  )
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  log.info(info + 'autoUpdater update-available '  )
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  log.info(info + 'autoUpdater update-not available '  )
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  log.info(err + 'autoUpdater error'  )
  sendStatusToWindow('Error in auto-updater.');
})
autoUpdater.on('download-progress', (ev, progressObj) => {
  log.info(progressObj + 'autoUpdater download-progress'  )
  sendStatusToWindow('Download progress...');
})
autoUpdater.on('update-downloaded', (ev, info) => {
  log.info(info + 'autoUpdater update-downloaded'  )
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});


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

// autoUpdater.on('download-progress', (ev, progressObj) => {
// })


