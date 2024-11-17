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
import { MatMenuBasicComponent } from '../shared/widgets/mat-menu-basic/mat-menu-basic.component';
import { ClientSearchSelectorComponent } from '../shared/widgets/client-search-selector/client-search-selector.component';
import { ValueFieldsComponent } from '../modules/admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { OrderTotalComponent } from '../modules/posorders/pos-order/order-total/order-total.component';
import { StrainIndicatorComponent } from '../modules/tv-menu/strain-indicator/strain-indicator.component';
import { UploaderComponent } from '../shared/widgets/AmazonServices';
import { ApiStatusDisplayComponent } from '../shared/widgets/api-status-display/api-status-display.component';
import { EditButtonsStandardComponent } from '../shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { LogoComponent } from '../shared/widgets/logo/logo.component';
import { ProductSearchSelectorComponent } from '../shared/widgets/product-search-selector/product-search-selector.component';
import { ToggleThemeComponent } from '../shared/widgets/toggle-theme/toggle-theme.component';
import { ReactiveFormsModule } from '@angular/forms';
// import { GridcomponentPropertiesDesignComponent } from '../modules/admin/grid-menu-layout/grid-component-properties/gridcomponent-properties-design/gridcomponent-properties-design.component';
import { LimitValuesCardComponent } from '../modules/posorders/limit-values-card/limit-values-card.component';
import { OrderHeaderDemographicsBoardComponent } from '../modules/posorders/pos-order/order-header-demographics-board/order-header-demographics-board.component';
import { OrderTotalBoardComponent } from '../modules/posorders/pos-order/order-total-board/order-total-board.component';
import { CategoryItemsBoardItemComponent } from '../modules/tv-menu/category-items-board/category-items-board-item/category-items-board-item.component';
import { CategoryItemsBoardComponent } from '../modules/tv-menu/category-items-board/category-items-board.component';
import { TvPriceSpecialsComponent } from '../modules/tv-menu/tv-price-specials/tv-price-specials.component';
import { TvPriceTierMenuItemsComponent } from '../modules/tv-menu/tv-price-tier-menu-items/tv-price-tier-menu-items.component';
import { LimitValuesProgressBarsComponent } from '../modules/posorders/limit-values-progress-bars/limit-values-progress-bars.component';
import { ProgressBarComponent } from '../shared/widgets/progress-bar/progress-bar.component';
import { TiersCardComponent } from '../modules/tv-menu/tv-price-specials/tiers-card/tiers-card.component';
import { OrderHeaderDemoGraphicsComponent } from '../modules/posorders/pos-order/order-header-demo-graphics/order-header-demo-graphics.component';


@NgModule({
  declarations: [
    BarcodeScannerComponent,
    ButtonRendererComponent,
    ScaleReaderComponent,

    MatMenuBasicComponent,
    LogoComponent,
    ProductSearchSelectorComponent,
    ValueFieldsComponent,
    UploaderComponent,
    EditButtonsStandardComponent,
    ToggleThemeComponent,
    ApiStatusDisplayComponent,
    StrainIndicatorComponent,
    OrderTotalComponent,
    ClientSearchSelectorComponent,


    TvPriceTierMenuItemsComponent,
    TvPriceSpecialsComponent,
    TiersCardComponent,
    OrderTotalBoardComponent,
    OrderHeaderDemoGraphicsComponent,
    
    LimitValuesCardComponent,
    ProgressBarComponent,
    LimitValuesProgressBarsComponent,
    
    OrderHeaderDemographicsBoardComponent,
    CategoryItemsBoardComponent,
    CategoryItemsBoardItemComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    AppMaterialModule,
    ReactiveFormsModule,
  ],
  exports: [
    BarcodeScannerComponent,
    ButtonRendererComponent,
    ScaleReaderComponent,

    MatMenuBasicComponent,
    LogoComponent,
    ProductSearchSelectorComponent,
    ValueFieldsComponent,
    UploaderComponent,
    EditButtonsStandardComponent,
    ToggleThemeComponent,
    ApiStatusDisplayComponent,
    StrainIndicatorComponent,
    OrderTotalComponent,
    ClientSearchSelectorComponent,


    TvPriceTierMenuItemsComponent,
    TvPriceSpecialsComponent,
    TiersCardComponent,
    OrderTotalBoardComponent,
    OrderHeaderDemoGraphicsComponent,
    
    LimitValuesCardComponent,
    ProgressBarComponent,
    LimitValuesProgressBarsComponent,
    
    OrderHeaderDemographicsBoardComponent,
    CategoryItemsBoardComponent,
    CategoryItemsBoardItemComponent,
   
  ],
  providers: [
    InventoryEditButtonService,
    ProductEditButtonService,
    MBMenuButtonsService
  ]
})
export class SharedUiModule { }
