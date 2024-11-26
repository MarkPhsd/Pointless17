
import { APP_INITIALIZER, enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { UserIdleModule } from 'angular-user-idle';
import { RouteReuseStrategy } from '@angular/router';
// import { AuthenticationService } from './app/_services';
// import { SitesService } from './app/_services/reporting/sites.service';
// import { SystemManagerService } from './app/_services/system/system-manager.service';
import { AppConfigService } from './app/_services/system/app-config.service';
import { AppMaterialModule } from './app/app-material.module';
import { CoreModule } from './app/core.module';
import { SharedPipesModule } from './app/shared-pipes/shared-pipes.module';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';

// Enable production mode
enableProdMode();

// Initialize app configuration
export function initializeApp(appConfigService: AppConfigService) {
  return (): Promise<any> => appConfigService.loadConfig();
}

// Bootstrap application
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      AppRoutingModule,
      BrowserAnimationsModule,
      ReactiveFormsModule,
      FormsModule,
      IonicModule.forRoot(),
      CoreModule,
      SharedPipesModule,
      AppMaterialModule,
      CommonModule,
      UserIdleModule.forRoot({ idle: 10, timeout: 100, ping: 120 })
    ),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    CurrencyPipe,
    { provide: APP_INITIALIZER, useFactory: initializeApp, deps: [AppConfigService], multi: true },
  ],
}).catch(err => console.error(err));
// AuthenticationService,
// SitesService,
// SystemManagerService

// import { enableProdMode } from '@angular/core';
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
// import { AppModule } from './app/app.module';
// import { environment } from './environments/environment';
// // import 'hammerjs';
// if (environment.production) {
//   enableProdMode();
// }

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.error(err));

// const notification = document.getElementById('notification');
// const message       = document.getElementById('message');
// const restartButton = document.getElementById('restart-button');

// function closeNotification() {
//   notification.classList.add('hidden');
// }

// function restartApp() {
//   // electronService.ipcRenderer.send('restart_app');
// }
