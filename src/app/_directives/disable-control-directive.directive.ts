import { Directive, HostListener, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[disableControl]'
})

export class DisableControlDirective implements OnChanges {

  @Input() set disableControl( condition : boolean ) {
    try {
      // const action = condition ? 'disable' : 'enable';
      // if (!this.ngControl) { return }
      // this.ngControl.control[action]();
    } catch (error) {
      console.log('error', error)
    }
  }

  @Input() opDisabled;
  ngOnChanges(changes) {
   if (changes['opDisabled']) {
     const action = this.opDisabled ? 'disable' : 'enable';
     this.ngControl.control[action]();
   }
 }

  constructor( private ngControl : NgControl ) {

  }

}
