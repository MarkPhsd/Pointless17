import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ButtonRendererComponent } from '../modules/admin/report-designer/widgets/button-renderer/button-renderer.component';
import { ProductEditButtonService } from '../_services/menu/product-edit-button.service';

// Services
import { InventoryEditButtonService } from '../_services/inventory/inventory-edit-button.service';
import { MBMenuButtonsService } from '../_services/system/mb-menu-buttons.service';
import { BarcodeScannerComponent } from '../shared/widgets/barcode-scanner/barcode-scanner.component';
import { IonicModule } from '@ionic/angular';
import { AppMaterialModule } from '../app-material.module';
import { ScaleReaderComponent } from '../shared/widgets/scale-reader/scale-reader.component';


@NgModule({
  declarations: [
    BarcodeScannerComponent,
    ButtonRendererComponent,
    ScaleReaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    AppMaterialModule,
  ],
  exports: [
    BarcodeScannerComponent,
    ButtonRendererComponent,
    ScaleReaderComponent
  ],
  providers: [
    InventoryEditButtonService,
    ProductEditButtonService,
    MBMenuButtonsService
  ]
})
export class SharedUiModule { }
