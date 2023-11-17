import { Component, ElementRef, forwardRef, Input, ViewChild,  AfterViewInit, Renderer2 } from '@angular/core';
import { FormArrayName, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
@Component({
  selector: 'app-value-fields',
  templateUrl: './value-fields.component.html',
  styleUrls: ['./value-fields.component.scss']
})

export class ValueFieldsComponent implements  AfterViewInit  {
  @Input() inputForm    : UntypedFormGroup
  @Input() formArray    : FormArrayName
  @Input() fieldName    : string;
  @Input() fieldDescription: string;
  @Input() fieldType    = 'text';
  @Input() passwordMask : boolean;
  @Input() fieldsClass   = "fields"
  @Input() type          = 'input'
  @Input() enabled       = true;

  itemHeader: string;
  @ViewChild('itemText') items: ElementRef

  constructor( private renderer: Renderer2) {

  }

  ngAfterViewInit() {
    try {
      const textNode = this.items.nativeElement.childNodes[0];
      var textInput = textNode.nodeValue;
      this.renderer.setValue(textNode, '');
      this.itemHeader = textInput;
    } catch (error) {

    }

  }
}
