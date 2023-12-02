import { Component, ElementRef, forwardRef, Input, ViewChild, EventEmitter, AfterViewInit, Renderer2, Output, TemplateRef } from '@angular/core';
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
  @Input() enableCancel : boolean = false;
  @Output() outPutCancel = new EventEmitter()

  @Input() searchingEnabled : boolean;

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

  cancelButton() {
    this.outPutCancel.emit(true)
  }

}
