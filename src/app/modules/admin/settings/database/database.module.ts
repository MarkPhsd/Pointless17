import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CacheSettingsComponent } from './cache-settings/cache-settings.component';
import { DatabaseSchemaComponent } from './database-schema/database-schema.component';
import { ExportDataComponent } from './export-data/export-data.component';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
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
import { NgxImageCaptureModule } from 'ngx-image-compress';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxStripeModule } from 'ngx-stripe';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';
import { InventoryComponent } from '../inventory/inventory.component';

@NgModule({
  declarations: [


  ],
  imports: [
    CommonModule,
    IonicModule,
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedPipesModule,
    QRCodeModule,

    AgGridModule,
    DragDropModule,
    BrowserAnimationsModule,
    HighchartsChartModule,
    FormsModule,
    HammerModule,
    QRCodeModule,
    GalleryModule,
    LightboxModule ,
    ColorPickerModule,
    GridsterModule,
    RouterModule,
    ReactiveFormsModule,
    YouTubePlayerModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    NgxStripeModule,
    NgxImageCaptureModule,
    AngularSignaturePadModule,
    //standalones
    FormSelectListComponent,
    InventoryComponent,
    ExportDataComponent,
    // DatabaseSchemaComponent,

  ],
  exports: [
    FormSelectListComponent,
    InventoryComponent,
    // SharedUiModule,
    ExportDataComponent,
    // DatabaseSchemaComponent,

  ]
})
export class DatabaseModule { }
