import { CommonModule, CurrencyPipe } from '@angular/common';
import { APP_INITIALIZER, enableProdMode, NgModule } from '@angular/core';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Printer } from '@ionic-native/printer/ngx';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule,   } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DefaultModule } from './dashboard/default.module';
import { AppMaterialModule } from './app-material.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './modules/login/login.component';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from '@angular/cdk/layout';
import { ChangepasswordComponent } from './modules/login/changepassword/changepassword.component';
import { ResetpasswordComponent } from './modules/login/resetpassword/resetpassword.component';
import { EditorModule } from '@tinymce/tinymce-angular';
import { BasicAuthInterceptor } from './_http-interceptors/basic-auth.interceptor';
import { ErrorInterceptor } from './_http-interceptors/error.interceptor';
import { AppGateComponent } from './modules/app-gate/app-gate/app-gate.component';
import { TvPriceSpecialsComponent } from './modules/tv-menu/tv-price-specials/tv-price-specials.component';
import { TvPriceTierMenuItemsComponent } from './modules/tv-menu/tv-price-tier-menu-items/tv-price-tier-menu-items.component';
import { RegisterAccountMainComponent } from './modules/login/registration/register-account-main/register-account-main.component';
import { RegisterAccountExistingUserWithTokenComponent } from './modules/login/registration/register-account-existing-user-with-token/register-account-existing-user-with-token.component';
import { AgGridModule } from 'ag-grid-angular'
import { CategoriesAlternateComponent } from './modules/menu/categories/categories-alternate/categories-alternate.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router, RouteReuseStrategy, RouterModule } from '@angular/router';
import '@capacitor-community/camera-preview';
import '@capacitor-community/barcode-scanner';
import { BarcodeScannerComponent } from './shared/widgets/barcode-scanner/barcode-scanner.component';
import { HttpClientCacheService } from './_http-interceptors/http-client-cache.service';
import { CacheClientService } from './_http-interceptors/cache-client.service';
import { RenderingService } from './_services/system/rendering.service';
import { PagerService } from './_services/system/agpager.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AgGridTestComponent } from './shared/widgets/ag-grid-test/ag-grid-test.component';
import { CurrencyFormatterDirective } from './_directives/currency-reactive.directive';
import { AgGridImageFormatterComponent } from './_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { AgGridToggleComponent } from './_components/_aggrid/ag-grid-toggle/ag-grid-toggle.component';
import { NGXMaterialModule } from './ngx-material.module';
import { AppInitService } from './_services/system/app-init.service';

import { GridManagerComponent } from './modules/admin/grid-menu-layout/grid-manager/grid-manager.component';
import { GridMenuLayoutComponent } from './modules/admin/grid-menu-layout/grid-menu-layout.component';
import { GridManagerEditComponent } from './modules/admin/grid-menu-layout/grid-manager-edit/grid-manager-edit.component';
import { DynamicModule } from 'ng-dynamic-component';
import { GridComponentPropertiesComponent } from './modules/admin/grid-menu-layout/grid-component-properties/grid-component-properties.component';
import { GridDesignerInfoComponent } from './modules/admin/grid-menu-layout/grid-designer-info/grid-designer-info.component';
import { DashboardMenuComponent } from './modules/admin/grid-menu-layout/dashboard-menu/dashboard-menu.component';
import { CategoryItemsBoardComponent } from './modules/tv-menu/category-items-board/category-items-board.component';
import { CategoryItemsBoardItemComponent } from './modules/tv-menu/category-items-board/category-items-board-item/category-items-board-item.component';
import { OrderTotalBoardComponent } from './modules/posorders/pos-order/order-total-board/order-total-board.component';
import { OrderHeaderDemographicsBoardComponent } from './modules/posorders/pos-order/order-header-demographics-board/order-header-demographics-board.component';
import { LimitValuesCardComponent } from './modules/posorders/limit-values-card/limit-values-card.component';
import { GridcomponentPropertiesDesignComponent } from './modules/admin/grid-menu-layout/grid-component-properties/gridcomponent-properties-design/gridcomponent-properties-design.component';
import * as Sentry from "@sentry/angular";
import { BrowserTracing } from "@sentry/tracing";
import { SplashLoadingComponent } from './shared/widgets/splash-loading/splash-loading.component';
import { UserIdleModule } from 'angular-user-idle';
import { ResizeDirective } from './_directives/resize.directive';
import {NgcCookieConsentConfig} from 'ngx-cookieconsent';
import {NgcCookieConsentModule} from 'ngx-cookieconsent';
import { AppConfigService } from './_services/system/app-config.service';
import { DisplayToggleAndroidComponent } from './modules/admin/grid-menu-layout/dashboard-menu/display-toggle-android/display-toggle-android.component';
import { SharedPipesModule } from './shared-pipes/shared-pipes.module';

// const cookieConfig:NgcCookieConsentConfig = {
//   cookie: {
//     domain: 'window.location.hostname' // or 'your.domain.com' // it is mandatory to set a domain, for cookies to work properly (see https://goo.gl/S2Hy2A)
//   },
//   palette: {
//     popup: {
//       background: '#000'
//     },
//     button: {
//       background: '#f1d600'
//     }
//   },
//   theme: 'edgeless',
//   type: 'opt-out'
// };


export function initializeApp(appConfigService: AppConfigService) {
  return (): Promise<any> => {
    return appConfigService.loadConfig();
  };
}

const cookieConfig:NgcCookieConsentConfig = {
  cookie: {
    domain: window.location.hostname // it is recommended to set your domain, for cookies to work properly
  },
  palette: {
    popup: {
      background: '#000'
    },
    button: {
      background: '#f1d600'
    }
  },
  theme: 'edgeless',
  type: 'opt-out',
  layout: 'my-custom-layout',
  layouts: {
    "my-custom-layout": '{{messagelink}}{{compliance}}'
  },
  elements:{
    messagelink: `
    <span id="cookieconsent:desc" class="cc-message">{{message}}
      <a aria-label="learn more about cookies" tabindex="0" class="cc-link" href="{{cookiePolicyHref}}" target="_blank" rel="noopener">{{cookiePolicyLink}}</a>,
      <a aria-label="learn more about our privacy policy" tabindex="1" class="cc-link" href="{{privacyPolicyHref}}" target="_blank" rel="noopener">{{privacyPolicyLink}}</a> and our
      <a aria-label="learn more about our terms of service" tabindex="2" class="cc-link" href="{{tosHref}}" target="_blank" rel="noopener">{{tosLink}}</a>
    </span>
    `,
  },
  content:{
    message: 'By using our site, you acknowledge that you have read and understand our ',

    cookiePolicyLink: 'Cookie Policy',
    cookiePolicyHref: 'https://cookie.com',

    privacyPolicyLink: 'Privacy Policy',
    privacyPolicyHref: 'https://privacy.com',

    tosLink: 'Terms of Service',
    tosHref: 'https://tos.com',
  }
};


// import {HammerGestureConfig, HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';

// export class MyHammerConfig extends HammerGestureConfig {
//   overrides = {
//     swipe: { direction: Hammer.DIRECTION_HORIZONTAL },
//   };
// }
// Sentry.init({
//   dsn: "https://ba163a19cdcf43ca80217e835d0f06bc@o1342227.ingest.sentry.io/6616061",
//   debug: false,

//   // beforeSend: (event, hint) => {
//   //   if (true) {
//   //     console.error(hint.originalException || hint.syntheticException);
//   //     return null; // this drops the event and nothing will be sent to sentry
//   //   }
//   //   return event;
//   //  },
//   // beforeSend: (event, hint) => {
//   //   setTimeout(() => console.error(hint.originalException || hint.syntheticException), 0);
//   //   return event;
//   // },
//   // integrations: [
//   //   new BrowserTracing({
//   //     tracingOrigins: ["localhost", "https://yourserver.io/api"],
//   //     routingInstrumentation: Sentry.routingInstrumentation,
//   //   }),
//   // ],

//   // Set tracesSampleRate to 1.0 to capture 100%
//   // of transactions for performance monitoring.
//   // We recommend adjusting this value in production
//   tracesSampleRate: 3.0,
// });

enableProdMode();
// platformBrowserDynamic()
//   .bootstrapModule(AppModule)
//   .then(success => console.log(`Bootstrap success`))
//   .catch(err => console.error(err));

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
  declarations: [
    AgGridTestComponent,
    AgGridImageFormatterComponent,
    AgGridToggleComponent,
    AppComponent,
    AppGateComponent,
    // BarcodeScannerComponent,
    ChangepasswordComponent,
    CategoriesAlternateComponent,
    CurrencyFormatterDirective,
    LoginComponent,

 
    RegisterAccountExistingUserWithTokenComponent,
    RegisterAccountMainComponent,
    ResetpasswordComponent,

    GridManagerComponent,
    GridMenuLayoutComponent,
    GridManagerEditComponent,
    GridComponentPropertiesComponent,
    GridDesignerInfoComponent,
    DisplayToggleAndroidComponent,
    DashboardMenuComponent,
    GridcomponentPropertiesDesignComponent,




    SplashLoadingComponent,
    ResizeDirective,

  ],

  imports: [
    IonicModule.forRoot(),
    SharedPipesModule,
    // G-6BNWKZ7VY8
    // NgxGoogleAnalyticsModule.forRoot('traking-code'),
    // NgxGoogleAnalyticsModule.forRoot(await getTrackingCode()) ,
    // NgxGoogleAnalyticsRouterModule,
    UserIdleModule.forRoot({idle: 10, timeout: 100, ping: 120}),
    AppRoutingModule,
    AppMaterialModule,
    DefaultModule,
    AgGridModule,
    HttpClientModule,
    //environment.enableAnimations ? BrowserAnimationsModule :
    BrowserAnimationsModule,
    // NoopAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    CommonModule,
    DynamicModule,
    EditorModule,
    SharedModule,
    NGXMaterialModule,

    LayoutModule,
  ],

  exports: [
    SharedPipesModule,
    AppMaterialModule,
    NgcCookieConsentModule,
    SharedModule,
    EditorModule,
    FormsModule,
    IonicModule,
    AgGridImageFormatterComponent,
    AgGridToggleComponent,
  ],

  providers: [
    // { provide: HAMMER_GESTURE_CONFIG, useClass: MyHammerConfig },
    { provide: HTTP_INTERCEPTORS,  useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS,  useClass: ErrorInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    AppInitService,
    CurrencyPipe,
    CacheClientService,
    HttpClientCacheService,
    Printer,
    BluetoothSerial,
    RenderingService,
    PagerService,
    StatusBar,
    ErrorInterceptor,
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
    Title
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],

})
export class AppModule { }
