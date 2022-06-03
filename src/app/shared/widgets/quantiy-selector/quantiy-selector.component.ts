import { Component, EventEmitter, Output, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-quantiy-selector',
  templateUrl: './quantiy-selector.component.html',
  styleUrls: ['./quantiy-selector.component.scss']
})
export class QuantiySelectorComponent {

  @Input() inputForm     : FormGroup;
  @Output() outPutValue  = new  EventEmitter();
  quantity               = 1;

  constructor() { }

  changeQuantity(value: number) {
    if (!this.inputForm) { return}
    console.log('value', value)
    console.log(' this.quantity ',  this.quantity )
    this.quantity = value + this.quantity 
    this.inputForm.patchValue({quantity: this.quantity})
  }
}
