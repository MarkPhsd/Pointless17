import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// Components
import { ProductEditButtonService } from '../_services/menu/product-edit-button.service';
// Services
import { InventoryEditButtonService } from '../_services/inventory/inventory-edit-button.service';
import { MBMenuButtonsService } from '../_services/system/mb-menu-buttons.service';
import { IonicModule } from '@ionic/angular';
import { AppMaterialModule } from '../app-material.module';
import { LogoComponent } from '../shared/widgets/logo/logo.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { GridcomponentPropertiesDesignComponent } from '../modules/admin/grid-menu-layout/grid-component-properties/gridcomponent-properties-design/gridcomponent-properties-design.component';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';
import { QRCodeModule } from 'angularx-qrcode';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { AgGridModule } from 'ag-grid-angular';
import { GridsterModule } from 'angular-gridster2';
import { HighchartsChartModule } from 'highcharts-angular';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxColorsModule } from 'ngx-colors';
import { NgxImageCaptureModule } from 'ngx-image-compress';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxStripeModule } from 'ngx-stripe';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AutofocusDirective } from '../_directives/auto-focus-input.directive';
import { DisableControlDirective } from '../_directives/disable-control-directive.directive';
import { FreeDraggingHandleDirective } from '../_directives/free-dragging-handle.directive';
import { FreeDraggingDirective } from '../_directives/free-dragging.directive';
import { InstructionDirective } from '../_directives/instruction.directive';
import { NgControlAttributeDirective } from '../_directives/ng-control-attribute.directive';
import { NumericDirective } from '../_directives/numeric-directive.directive';
import { UserAuthorizedDirective } from '../_directives/user-authorized.directive';

@NgModule({
  declarations: [

    NgControlAttributeDirective,
    NumericDirective,
    UserAuthorizedDirective,
    NgxDaterangepickerMd,
    NgControlAttributeDirective,
    FreeDraggingDirective,
    FreeDraggingHandleDirective,
    AutofocusDirective,
    DisableControlDirective,
    InstructionDirective,

  ],
  imports: [

    CommonModule,
    IonicModule,
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedPipesModule,
    QRCodeModule,
    LogoComponent,
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
    NgxDaterangepickerMd.forRoot(),
    AngularSignaturePadModule,



  ],

  exports: [
    NgControlAttributeDirective,
    NumericDirective,
    UserAuthorizedDirective,
    NgxDaterangepickerMd,
    NgControlAttributeDirective,
    FreeDraggingDirective,
    FreeDraggingHandleDirective,
    AutofocusDirective,
    DisableControlDirective,

  ],
  providers: [
    InventoryEditButtonService,
    ProductEditButtonService,
    MBMenuButtonsService,
  ]
})
export class SharedUiModule { }
