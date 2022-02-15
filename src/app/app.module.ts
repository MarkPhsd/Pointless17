import { CommonModule, CurrencyPipe } from '@angular/common';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { NgxElectronModule } from 'ngx-electron';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { Printer } from '@ionic-native/printer/ngx';
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
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
import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { BasicAuthInterceptor } from './_http-interceptors/basic-auth.interceptor';
import { ErrorInterceptor } from './_http-interceptors/error.interceptor';
import { AppGateComponent } from './modules/app-gate/app-gate/app-gate.component';
import { TvPriceSpecialsComponent } from './modules/tv-menu/tv-price-specials/tv-price-specials.component';
import { TvPriceTierMenuItemsComponent } from './modules/tv-menu/tv-price-tier-menu-items/tv-price-tier-menu-items.component';
import { RegisterAccountMainComponent } from './modules/login/registration/register-account-main/register-account-main.component';
import { RegisterAccountExistingUserWithTokenComponent } from './modules/login/registration/register-account-existing-user-with-token/register-account-existing-user-with-token.component';
import { AgGridModule } from 'ag-grid-angular'
import { CategoriesAlternateComponent } from './modules/menu/categories/categories-alternate/categories-alternate.component';
import { ErrorHandler, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { RouteReuseStrategy } from '@angular/router';
import '@capacitor-community/camera-preview';
import '@capacitor-community/barcode-scanner';
import { BarcodeScannerComponent } from './shared/widgets/barcode-scanner/barcode-scanner.component';
import { HttpClientCacheService } from './_http-interceptors/http-client-cache.service';
import { CacheClientService } from './_http-interceptors/cache-client.service';
import { RenderingService } from './_services/system/rendering.service';
import { SafeHtmlPipe } from './_pipes/safe-html.pipe';
import { PagerService } from './_services/system/agpager.service';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AgGridTestComponent } from './shared/widgets/ag-grid-test/ag-grid-test.component';
import { CurrencyFormatterDirective } from './_directives/currency-reactive.directive';
import { AgGridImageFormatterComponent } from './_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { DsiEMVPaymentComponent } from './modules/admin/dsi-emvpayment/dsi-emvpayment.component';
import { AgGridToggleComponent } from './_components/_aggrid/ag-grid-toggle/ag-grid-toggle.component';
import { NGXMaterialModule } from './ngx-material.module';
import { AppInitService } from './_services/system/app-init.service';

// import { NGXMaterialModule } from './ngx-material.module';

// import { NgxKeypadModule } from 'ngx-keypad';
// import * as CapacitorSQLPlugin from 'capacitor-sqlite';
// import { IonCustomScrollbarModule } from 'ion-custom-scrollbar'

// import { AgGridTestComponent } from 'ag-grid-test/ag-grid-test.component';
// export class MyHammerConfig extends HammerGestureConfig  {
//   overrides = <any>{
//       // override hammerjs default configuration
//       'swipe': { direction: Hammer.DIRECTION_ALL  }
//   }
// }

export function init_app(appLoadService: AppInitService) {
  return () => appLoadService.init();
}
@NgModule({
  declarations: [
    AgGridTestComponent,
    AgGridImageFormatterComponent,
    AgGridToggleComponent,
    AppComponent,
    AppGateComponent,
    BarcodeScannerComponent,
    ChangepasswordComponent,
    CategoriesAlternateComponent,
    CurrencyFormatterDirective,
    DsiEMVPaymentComponent,
    LoginComponent,
    TvPriceTierMenuItemsComponent,
    TvPriceSpecialsComponent,
    RegisterAccountExistingUserWithTokenComponent,
    RegisterAccountMainComponent,
    ResetpasswordComponent,
    SafeHtmlPipe,
  ],

  imports: [
    AgGridModule.withComponents([AgGridImageFormatterComponent,AgGridToggleComponent]),
    AppRoutingModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    DefaultModule,
    EditorModule,
    FlexLayoutModule,
    FormsModule,
    HttpClientModule,
    LayoutModule,
    IonicModule.forRoot(),
    NGXMaterialModule,
    NgxElectronModule,
    ReactiveFormsModule,
    SharedModule
  ],

  exports: [
    AppMaterialModule,
    DsiEMVPaymentComponent,
    EditorModule,
    FormsModule,
    IonicModule,
    AgGridImageFormatterComponent,
    AgGridToggleComponent,
    NGXMaterialModule,
    SharedModule,
  ],

  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    CurrencyPipe,
    CacheClientService,
    HttpClientCacheService,
    Printer,
    BluetoothSerial,
    RenderingService,
    PagerService,
    StatusBar,
    SafeHtmlPipe,
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppInitService],
      multi: true
    },
    Title


  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],

})
export class AppModule { }

// import { EditorModule, TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
// import { SimpleTinyComponent } from '../../_components/tinymce/tinymce.component';
