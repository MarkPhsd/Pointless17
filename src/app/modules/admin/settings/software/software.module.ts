import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
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
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { SoftwareSettingsComponent } from './software.component';
import { SharedUiModule } from 'src/app/shared-ui/shared-ui.module';
import { FormSelectListComponent } from 'src/app/shared/widgets/formSelectList/form-select-list.component';
import { SharedUtilsModule } from 'src/app/shared-utils/shared-utils.module';

@NgModule({
  declarations: [
    //settings

  ],
  imports: [
    CommonModule,
    IonicModule,
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedUiModule,
    SharedPipesModule,
    SharedUtilsModule,
    ReactiveFormsModule,
    QRCodeModule,


    AgGridModule,
    DragDropModule,
    BrowserAnimationsModule,
    HammerModule,
    QRCodeModule,
    ColorPickerModule,
    NgxJsonViewerModule,
    NgxColorsModule,

    //standalones
    FormSelectListComponent,
  ],
  exports: [

  ]
})
export class SoftwareModule { }
