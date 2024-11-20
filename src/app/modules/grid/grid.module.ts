import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgOptimizedImage } from '@angular/common'
import { GridRoutingModule } from './grid-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedUiModule } from 'src/app/shared-ui/shared-ui.module';
import { CurrencyFormatterDirective } from 'src/app/_directives/currency-reactive.directive';
import { AgGridModule } from 'ag-grid-angular';
import { GridsterModule } from 'angular-gridster2';
import { DynamicModule } from 'ng-dynamic-component';
import { AppMaterialModule } from 'src/app/app-material.module';
import { DefaultModule } from 'src/app/dashboard/default.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { SharedUtilsModule } from 'src/app/shared-utils/shared-utils.module';
import { SharedModule } from 'src/app/shared/shared.module';


import { DashboardMenuComponent } from '../admin/grid-menu-layout/dashboard-menu/dashboard-menu.component';
import { DisplayToggleAndroidComponent } from '../admin/grid-menu-layout/dashboard-menu/display-toggle-android/display-toggle-android.component';
import { GridComponentPropertiesComponent } from '../admin/grid-menu-layout/grid-component-properties/grid-component-properties.component';
import { GridcomponentPropertiesDesignComponent } from '../admin/grid-menu-layout/grid-component-properties/gridcomponent-properties-design/gridcomponent-properties-design.component';
import { GridDesignerInfoComponent } from '../admin/grid-menu-layout/grid-designer-info/grid-designer-info.component';
import { GridManagerEditComponent } from '../admin/grid-menu-layout/grid-manager-edit/grid-manager-edit.component';
import { GridManagerComponent } from '../admin/grid-menu-layout/grid-manager/grid-manager.component';
import { GridMenuLayoutComponent } from '../admin/grid-menu-layout/grid-menu-layout.component';
import { TestGridComponent } from './test-grid/test-grid.component';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
// import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    CurrencyFormatterDirective,

    // GridManagerComponent,
    // GridMenuLayoutComponent,
    // GridManagerEditComponent,
    // GridComponentPropertiesComponent,
    // GridDesignerInfoComponent,
    // DisplayToggleAndroidComponent,
    // DashboardMenuComponent,
    // GridcomponentPropertiesDesignComponent,

    // TestGridComponent

  ],
  imports: [
    // CommonModule,
    // GridRoutingModule,
    // ReactiveFormsModule,
    // SharedUiModule

    CommonModule,


    MatCardModule,
    // AgGridModule,
    // GridsterModule, // Add this line
    // GridRoutingModule,
    // ReactiveFormsModule,
    // FormsModule,
    // AppMaterialModule,
    // SharedUiModule,
    // SharedUtilsModule,
    // SharedPipesModule,
    // SharedModule,
    // DynamicModule,
    // DefaultModule,
  ], 
  exports: [
    // TestGridComponent
  ],
  // schemas: [NO_ERRORS_SCHEMA],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridModule { }
