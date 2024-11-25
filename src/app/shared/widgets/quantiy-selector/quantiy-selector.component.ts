import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { ValueFieldsComponent } from 'src/app/modules/admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-quantiy-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    ValueFieldsComponent,
  ],
  templateUrl: './quantiy-selector.component.html',
  styleUrls: ['./quantiy-selector.component.scss']
})
export class QuantiySelectorComponent implements OnInit{

  @Input() inputForm     : UntypedFormGroup;
  @Output() outPutValue  = new  EventEmitter();
  quantity               = 1;

  constructor() { }

  ngOnInit() {
    if (this.inputForm){
      this.inputForm.valueChanges.subscribe(data => {

          const value = this.inputForm.controls['quantity'].value
          console.log('value', value)
          if (value > 0) {
            this.outPutValue.emit(value)
            return;
          }

      })
    }
  }

  changeQuantity(value: number) {
    if (!this.inputForm) { return}

    this.quantity = value + this.quantity

    if (this.quantity  == 0 || this.quantity < 0) { this.quantity = 1}
    this.inputForm.patchValue({quantity: this.quantity})
    this.outPutValue.emit(this.quantity)

  }
}
