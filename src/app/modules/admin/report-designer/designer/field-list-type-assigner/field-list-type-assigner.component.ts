import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ReportDesignerService } from '../../services/report-designer.service';
import { aggregateFunctions, viewBuilder_ReportJSON, viewBuilder_View_Field_Values } from '../../interfaces/reports';

export interface ItemBasic {
  id: number;
  name: string;
  description: string;
}
@Component({
  selector: 'pgReporting-field-list-type-assigner',
  templateUrl: './field-list-type-assigner.component.html',
  styleUrls: ['./field-list-type-assigner.component.scss']
})
export class FieldListTypeAssignerComponent implements OnInit {

  report: viewBuilder_ReportJSON;
  aggregateFunction: ItemBasic | undefined;
  itemSelected = {} as viewBuilder_View_Field_Values;
  fields = [] as viewBuilder_View_Field_Values[];
  // _fieldsList = this.reportDesignerService.fieldsList$.subscribe(data =>{
  //   this.fields = data;
  // })

  _report = this.reportDesignerService.report$.subscribe(data => {
    this.report = data;
    if (data && data.fields) {
      this.fields = data.fields.sort(({order:a}, {order:b}) => b-a);;
    }
  })

  aggregates = aggregateFunctions;

  formFieldAggregate: UntypedFormGroup | undefined;

  constructor(
    private reportDesignerService: ReportDesignerService,
    private fb: UntypedFormBuilder) { }

  ngOnInit(): void {

  }

  ngOnDestroy() {
    if (this._report) {
      this._report.unsubscribe()
    }
  }

  changeSelection() {
    // this.outPutID.emit(this.id)
  }

  setItem(event: any) {

    const item = this.aggregates.filter(item => {
      return item.name === event;
    })
    this.aggregateFunction  = item[0];

    this.itemSelected.fieldTypeAggregate = event;
    if (this.formFieldAggregate) {
      this.formFieldAggregate.patchValue(this.itemSelected)
    }
    this.saveItem();

  }

  initForm(item: viewBuilder_View_Field_Values) {

    if (!item) { return }
    this.formFieldAggregate = this.fb.group({
      id: [],
      type: [],
      name: [],
      fieldTypeAggregate: [],
    })

    this.itemSelected = item;

    const aggregate =  this.aggregates.filter( data =>
      { return data.name.toUpperCase() === item.fieldTypeAggregate.toUpperCase() })

    this.aggregateFunction  = aggregate[0]
    item.fieldTypeAggregate = item.fieldTypeAggregate.toUpperCase()
    this.formFieldAggregate.patchValue(item)

  }

  saveItem(){
    if (this.formFieldAggregate?.value) {
      const item = this.formFieldAggregate.value as viewBuilder_View_Field_Values
      this.fields = this.removeItemById(this.fields, item.id);
      this.fields.push(item);
      this.report.fields = this.fields
      this.reportDesignerService.updateReport(this.report)
    }
  }

  removeItemById(array: viewBuilder_View_Field_Values[], id: string): viewBuilder_View_Field_Values[] {
    return array.filter(item => item.id !== id);
  }

}
