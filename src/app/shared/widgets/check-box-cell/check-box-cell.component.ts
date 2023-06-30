import { Component, ViewChild, ElementRef } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-check-box-cell',
  template: `<input type="checkbox" [checked]="params.data.athlete==''" (change)="onChange($event)">`,
  styleUrls: ['./check-box-cell.component.scss']
})
export class CheckBoxCellComponent implements ICellRendererAngularComp {

  @ViewChild('.checkbox') checkbox: ElementRef;
  public params: ICellRendererParams;

  constructor() { }
  refresh(params: any): boolean {
    this.params = params;
    return true;
  }
  agInit(params: ICellRendererParams): void {
    //console.log(params);
    //console.log(parems.getvalue());
    this.params = params;
  }

  public onChange(event) {
    this.params.data[this.params.colDef.field] = event.currentTarget.checked;

    console.log(event.data)

    let result = {
      event: event,
      data: this.params,
      rowdata: this.params.data
    }

    console.log(result);

    this.params.context.componentParent.onCheckBoxChange(result);
  }
}
