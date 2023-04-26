// ng-control-attribute.directive.ts
import { Directive, ElementRef, OnInit } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { InputTrackerService } from '../_services/system/input-tracker.service';

@Directive({
  selector: '[formControlName],[formControl]'
})
export class NgControlAttributeDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private ngControl: NgControl,
    private inputTrackerService: InputTrackerService
  ) {}

  ngOnInit(): void {
    try {
      const uniqueId = `ng-control-${Date.now()}-${Math.random()}`;
      this.el.nativeElement.setAttribute('data-ng-control-id', uniqueId);
      this.ngControl.control['__ngControlId__'] = uniqueId;
  
      // Register the FormControl instance with the InputTrackerService
      this.inputTrackerService.registerFormControl(uniqueId, this.ngControl.control as FormControl);
      
    } catch (error) {
      // console.log('error in Attribute Directive', error)      
    }
  }
}
