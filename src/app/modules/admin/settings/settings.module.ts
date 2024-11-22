import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { IonicModule } from '@ionic/angular';
import { AgGridModule } from 'ag-grid-angular';
import { GridsterModule } from 'angular-gridster2';
import { QRCodeModule } from 'angularx-qrcode';
import { HighchartsChartModule } from 'highcharts-angular';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxColorsModule } from 'ngx-colors';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxImageCaptureModule } from 'ngx-image-compress';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { SharedUiModule } from 'src/app/shared-ui/shared-ui.module';
import { SharedUtilsModule } from 'src/app/shared-utils/shared-utils.module';
import { CacheSettingsComponent } from './database/cache-settings/cache-settings.component';
import { DatabaseSchemaComponent } from './database/database-schema/database-schema.component';
import { ExportDataComponent } from './database/export-data/export-data.component';
import { DeviceInfoComponent } from './device-info/device-info.component';
import { CardPointSettingsComponent } from '../../payment-processing/cardPointe/card-point-settings/card-point-settings.component';
import { StripeSettingsComponent } from './stripe-settings/stripe-settings.component';
import { NgxStripeModule } from 'ngx-stripe';
import { EmailSettingsComponent } from './email-settings/email-settings.component';
import { UIHomePageSettingsComponent } from './software/uihome-page-settings/uihome-page-settings.component';
import { UITransactionsComponent } from './software/UISettings/uitransactions/uitransactions.component';
import { SaveChangesButtonComponent } from 'src/app/shared-ui/save-changes-button/save-changes-button.component';

@NgModule({
  declarations: [

    //data
    ExportDataComponent,
    DatabaseSchemaComponent,
    CacheSettingsComponent,
    
    //credit card processing 
    CardPointSettingsComponent,
    StripeSettingsComponent,

    //email settings
    EmailSettingsComponent,

    //settings
    UIHomePageSettingsComponent,
    UITransactionsComponent,
    //devieinfo
    DeviceInfoComponent,

    ],
  imports: [
    IonicModule.forRoot(),
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    SharedUiModule,
    SharedUtilsModule,
    SharedPipesModule,
    AppMaterialModule,

    AgGridModule,
    DragDropModule,
  
    BrowserAnimationsModule,
    HighchartsChartModule,
  
    HammerModule,
    QRCodeModule,
    GalleryModule,
    LightboxModule ,
    ColorPickerModule,
    GridsterModule,

    YouTubePlayerModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    NgxImageCaptureModule,
    NgxStripeModule,
    NgxDaterangepickerMd.forRoot(),
    AngularSignaturePadModule,

  ],
})
export class SettingsModule { }
