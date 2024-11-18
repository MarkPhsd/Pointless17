import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { BasicAuthInterceptor } from './_http-interceptors/basic-auth.interceptor';
import { CacheClientService } from './_http-interceptors/cache-client.service';
import { ErrorInterceptor } from './_http-interceptors/error.interceptor';
import { HttpClientCacheService } from './_http-interceptors/http-client-cache.service';
import { PagerService } from './_services/system/agpager.service';
import { AppInitService } from './_services/system/app-init.service';
import { RenderingService } from './_services/system/rendering.service';
import { AppConfigService } from './_services/system/app-config.service';

export function initializeApp(appConfigService: AppConfigService) {
  return (): Promise<any> => {
    return appConfigService.loadConfig();
  };
}

export function getIsDebugDevice(): boolean {
  if (localStorage.getItem('debugOnThisDevice') === 'true') {
    return true
  }
  return false
}

export  function init_app(appLoadService: AppInitService) {
  return () =>  appLoadService.init();
}

export  async function   getTrackingCode(appLoadService: AppInitService) : Promise<string>{
  return  await appLoadService.getGoogleTrackingID();
}

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Singleton services
    AppInitService,
    RenderingService,
    PagerService,
    HttpClientCacheService,
    CacheClientService,

    // Interceptors
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    // Third-party services
    Printer,
    BluetoothSerial,
    StatusBar,

    // APP_INITIALIZER
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      // deps: [AppInitService, Sentry.TraceService],
      deps: [AppInitService],
      multi: true
    },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeApp,
    //   deps: [AppConfigService],
    //   multi: true
    // },

  ],
})
export class CoreModule {}
