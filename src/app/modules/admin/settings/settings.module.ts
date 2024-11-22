import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgxImageCaptureModule } from 'ngx-image-compress';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { AppMaterialModule } from 'src/app/app-material.module';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { DashBoardRoutingModule } from 'src/app/dash-board-routing.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { SharedUiModule } from 'src/app/shared-ui/shared-ui.module';
import { SharedUtilsModule } from 'src/app/shared-utils/shared-utils.module';
import { CacheSettingsComponent } from './database/cache-settings/cache-settings.component';
import { DatabaseSchemaComponent } from './database/database-schema/database-schema.component';
import { ExportDataComponent } from './database/export-data/export-data.component';

@NgModule({
  declarations: [

    ExportDataComponent,
    DatabaseSchemaComponent,
    CacheSettingsComponent
  ],
  imports: [
    IonicModule.forRoot(),
    CommonModule,
    SharedUiModule,
    SharedUtilsModule,
    SharedPipesModule,
    
    AgGridModule,
    AppRoutingModule,
    DashBoardRoutingModule,
    DragDropModule,
    AppMaterialModule,

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
    // SwiperModule,
    YouTubePlayerModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    NgxImageCaptureModule,
    NgxDaterangepickerMd.forRoot(),
    AngularSignaturePadModule,

  ],
})
export class SettingsModule { }
