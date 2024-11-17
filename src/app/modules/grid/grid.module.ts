import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GridRoutingModule } from './grid-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedUiModule } from 'src/app/shared-ui/shared-ui.module';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    GridRoutingModule,
    ReactiveFormsModule,
    SharedUiModule
  ], 
  exports: [

  ]
})
export class GridModule { }
