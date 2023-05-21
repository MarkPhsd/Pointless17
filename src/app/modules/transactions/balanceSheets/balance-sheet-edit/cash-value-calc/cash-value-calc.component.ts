import { Component, OnInit, Input, forwardRef,OnChanges, SimpleChange, SimpleChanges } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'cash-value-calc',
  templateUrl: './cash-value-calc.component.html',
  styleUrls: ['./cash-value-calc.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CashValueCalcComponent),
      multi: true
    }
  ]
})
export class CashValueCalcComponent implements OnInit, OnChanges {

  internalValue: string | undefined;
  get formControlItem()     { return this.inputForm.get(this.formControlName) as UntypedFormControl; }

  @Input() cashValue  : number;
  @Input() multiplier : number;
  @Input() formControlName : string;
  @Input() inputForm  : UntypedFormGroup;

  propagateChange = (_: any) => { }; // ControlValueAccessor

  constructor() { }

  ngOnInit(): void {
    this.refreshValues()
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.refreshValues()

  }

  refreshValues() {
    this.cashValue = 0;
    if (!this.inputForm) { return }
    if (this.inputForm.get(this.formControlName) && this.multiplier) {
      this.cashValue = this.inputForm.get(this.formControlName).value * this.multiplier
      return
    }
    return
  }

  get value(): string | undefined {
    return this.internalValue;
  }
  set value(value: string | undefined) {
    this.internalValue = value;
    this.propagateChange(value);
  }

  // some other methods here

  // implementing the ControlValueAccessor interface with these three methods
  writeValue(obj: any): void {
    if (obj) {
      this.value = obj;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    // throw new Error('Method not implemented.');
  }

}
