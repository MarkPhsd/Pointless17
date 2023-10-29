import { Component, EventEmitter, Output, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-quantiy-selector',
  templateUrl: './quantiy-selector.component.html',
  styleUrls: ['./quantiy-selector.component.scss']
})
export class QuantiySelectorComponent {

  @Input() inputForm     : UntypedFormGroup;
  @Output() outPutValue  = new  EventEmitter();
  quantity               = 1;

  constructor() { }

  changeQuantity(value: number) {
    if (!this.inputForm) { return}

    this.quantity = value + this.quantity

    if (this.quantity  == 0 || this.quantity < 0) { this.quantity = 1}
    // this.outPutValue.emit(this.quantity)
    this.inputForm.patchValue({quantity: this.quantity})
  }
}
