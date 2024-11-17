import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ButtonRendererComponent } from '../modules/admin/report-designer/widgets/button-renderer/button-renderer.component';
import { ProductEditButtonService } from '../_services/menu/product-edit-button.service';

// Services
import { InventoryEditButtonService } from '../_services/inventory/inventory-edit-button.service';
import { MBMenuButtonsService } from '../_services/system/mb-menu-buttons.service';


@NgModule({
  declarations: [
    ButtonRendererComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [

    ButtonRendererComponent
  ],
  providers: [
    InventoryEditButtonService,
    ProductEditButtonService,
    MBMenuButtonsService
  ]
})
export class SharedUiModule { }
