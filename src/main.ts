import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

const notification = document.getElementById('notification');
const message       = document.getElementById('message');
const restartButton = document.getElementById('restart-button');

function closeNotification() {
  notification.classList.add('hidden');
}

function restartApp() {
  // electronService.ipcRenderer.send('restart_app');
}
