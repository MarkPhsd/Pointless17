import { Component,  Input} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { IProduct } from 'src/app/_interfaces';
import { BrandTypeSelectComponent } from '../_product-edit-parts/brand-type-select/brand-type-select.component';
import { ChemicalValuesComponent } from '../_product-edit-parts/chemical-values/chemical-values.component';
import { SpeciesListComponent } from '../_product-edit-parts/species-list/species-list.component';
import { ValueFieldsComponent } from '../_product-edit-parts/value-fields/value-fields.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'cannabis-item-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    FormsModule,ReactiveFormsModule,
    BrandTypeSelectComponent,ChemicalValuesComponent,SpeciesListComponent,ValueFieldsComponent
  ],
  templateUrl: './cannabis-item-edit.component.html',
  styleUrls: ['./cannabis-item-edit.component.scss']
})

export class CannabisItemEditComponent   {
  @Input() product: IProduct
  @Input() inputForm: UntypedFormGroup
  constructor() { }

}
