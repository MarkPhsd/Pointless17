import { Component, ElementRef, forwardRef, Input, ViewChild, EventEmitter, AfterViewInit, Renderer2, Output, TemplateRef } from '@angular/core';
import { FormArrayName, UntypedFormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-search-fields',
  templateUrl: './search-fields.component.html',
  styleUrls: ['./search-fields.component.scss']
})
export class SearchFieldsComponent implements AfterViewInit {

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
  itemNameInput: string;
  @ViewChild('standardInputField') standardInputField: TemplateRef<any>;
  @ViewChild('paswordMaskField') paswordMaskField: TemplateRef<any>;
  @ViewChild('cancelInPutButton') cancelInPutButton: TemplateRef<any>;

  constructor( private renderer: Renderer2) {

  }

  ngAfterViewInit() {
    try {
      // const textNode = this.items.nativeElement.childNodes[0];
      // var textInput = textNode.nodeValue;
      // this.renderer.setValue(textNode, '');
      // this.itemHeader = textInput;
    } catch (error) {
    }
  }

  cancelButton() {
    this.outPutCancel.emit(true)
  }

  get inputField() {
    if (this.passwordMask && this.inputForm) {
      return this.paswordMaskField
    }
    return this.standardInputField
  }

  get cancelInputButtonOn() {
    if (this.enableCancel && this.inputForm) {
      return this.cancelInPutButton;
    }
    return null
  }
}

