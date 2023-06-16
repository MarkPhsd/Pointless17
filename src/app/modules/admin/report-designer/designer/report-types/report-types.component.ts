import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { chartTypeCollection } from '../../interfaces/reports';

@Component({
  selector: 'ps-report-types',
  templateUrl: './report-types.component.html',
  styleUrls: ['./report-types.component.scss']
})
export class ReportTypesComponent implements OnInit {


  @Input() inputForm: UntypedFormGroup | undefined;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() fieldName: string = 'reportTypes'
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() hideClear: boolean  = false;
  @ViewChild('formView')      formView: TemplateRef<any> | undefined;

  chartType = chartTypeCollection;

  @Output() setItemValue = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  get isFormView() {
    if (this.inputForm) {
      return this.formView
    }
    return null;
  }

  setItem(item:any) {
    // console.log('item output', item)
    this.setItemValue.emit(item)
  }
}
