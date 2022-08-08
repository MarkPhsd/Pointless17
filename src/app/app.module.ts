import { CommonModule, CurrencyPipe } from '@angular/common';
import { APP_INITIALIZER, enableProdMode, ErrorHandler, NgModule } from '@angular/core';
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
import { Router, RouteReuseStrategy } from '@angular/router';
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
import { NgxElectronModule } from 'ngx-electron';
import { GridManagerComponent } from './modules/admin/grid-menu-layout/grid-manager/grid-manager.component';
import { GridMenuLayoutComponent } from './modules/admin/grid-menu-layout/grid-menu-layout.component';
import { GridManagerEditComponent } from './modules/admin/grid-menu-layout/grid-manager-edit/grid-manager-edit.component';
import { GridSettingsComponent } from './modules/admin/grid-menu-layout/grid-settings/grid-settings.component';
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
import { ClientTypeSelectionComponent } from './modules/admin/grid-menu-layout/client-type-selection/client-type-selection.component';
import { DashBoardRoutingModule } from './dash-board-routing.module';
// import { NgIdleModule } from '@ng-idle/core';
// import { NgIdleModule } from '@ng-idle/core';
import * as Sentry from "@sentry/angular";
import { BrowserTracing } from "@sentry/tracing";
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

Sentry.init({
  dsn: "https://ba163a19cdcf43ca80217e835d0f06bc@o1342227.ingest.sentry.io/6616061",
  integrations: [
    new BrowserTracing({
      tracingOrigins: ["localhost", "https://yourserver.io/api"],
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 3.0,
});

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
    LoginComponent,
    TvPriceTierMenuItemsComponent,
    TvPriceSpecialsComponent,
    RegisterAccountExistingUserWithTokenComponent,
    RegisterAccountMainComponent,
    ResetpasswordComponent,
    GridManagerComponent,
    GridSettingsComponent,
    GridMenuLayoutComponent,
    GridManagerEditComponent,
    GridComponentPropertiesComponent,
    GridDesignerInfoComponent,
    DashboardMenuComponent,
    OrderTotalBoardComponent,
    LimitValuesCardComponent,
    OrderHeaderDemographicsBoardComponent,
    CategoryItemsBoardComponent,
    CategoryItemsBoardItemComponent,
    GridcomponentPropertiesDesignComponent,
    ClientTypeSelectionComponent,
  ],

  imports: [
    IonicModule.forRoot(),
    AgGridModule.withComponents([AgGridImageFormatterComponent,AgGridToggleComponent]),
    // NgIdleModule.forRoot(),
    AppRoutingModule,
    AppMaterialModule,
    DashBoardRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    DefaultModule,
    DynamicModule,
    EditorModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    LayoutModule,
    NGXMaterialModule,
    NgxElectronModule,
    SharedModule,
  ],

  exports: [
    AppMaterialModule,
    EditorModule,
    FormsModule,
    IonicModule,
    AgGridImageFormatterComponent,
    AgGridToggleComponent,
    NGXMaterialModule,
    SharedModule,
  ],

  providers: [
    { provide: HTTP_INTERCEPTORS,  useClass: BasicAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS,  useClass: ErrorInterceptor, multi: true },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    CurrencyPipe,
    CacheClientService,
    HttpClientCacheService,
    Printer,
    BluetoothSerial,
    RenderingService,
    PagerService,
    StatusBar,
    AppInitService,
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler({
        showDialog: getIsDebugDevice()
      }),
    },
    {
      provide: Sentry.TraceService,
      deps: [Router],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppInitService, Sentry.TraceService],
      multi: true
    },
    Title
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],

})
export class AppModule { }
