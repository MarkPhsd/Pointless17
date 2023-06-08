import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { ReportDesignerService } from '../../services/report-designer.service';
import { viewBuilder_View_Field_Values, viewBuilder_ReportJSON, viewBuilder_View_Builder_GroupBy } from '../../interfaces/reports';
@Component({
  selector: 'psReporting-report-group-selector',
  templateUrl: './report-group-selector.component.html',
  styleUrls: ['./report-group-selector.component.scss']
})
export class ReportGroupSelectorComponent implements OnInit {
  whereForm: UntypedFormGroup | undefined;
  //  @Input() viewBuilder_View_Field_Values = [] as viewBuilder_View_Field_Values[];
   @Input() allFields = [] as viewBuilder_View_Field_Values[];
   _report: Subscription | undefined;
   _fieldList: Subscription | undefined;

  report = {} as viewBuilder_ReportJSON

  constructor(
    private reportDesignerService: ReportDesignerService,
    private fb: UntypedFormBuilder) { }


  ngOnInit(): void {

    this._report = this.reportDesignerService.report$.subscribe(data => {
      this.report = data;
      if (this.report.fields) {
        this.allFields = this.report.fields.filter(data =>  {
          return (!data.fieldTypeAggregate || data.fieldTypeAggregate == '')
        })
      }
    })

  }
  addAll() {
    const list = [] as viewBuilder_View_Builder_GroupBy[];
    this.allFields.forEach(data => {
      let item = {} as viewBuilder_View_Builder_GroupBy;
      item.id = UUID.UUID();
      item.name = data.name;
      list.push(item);
    })
    this.report.groups = list;
    this.reportDesignerService.updateReport(this.report)
  }

  addItem(item: viewBuilder_View_Builder_GroupBy) {
    //get items to select
    console.log('item', item)
    if (!this.report.groups) {
      this.report.groups= []
    }

    let groups =  this.report.groups.filter(data => {
      return data.name != item.name
    })

    groups.push(item)
    this.report.groups = groups;
    // const id = item.id;
    // const list = this.report.groups
    // this.report.groups =  list.filter( data => { return data.id != id } )

    this.reportDesignerService.updateReport(this.report)
  }

  deleteItem(item: viewBuilder_View_Builder_GroupBy ) {
    const list = this.report.groups
    this.report.groups =  list.filter( data => { return data.id != item.id } )
    this.reportDesignerService.updateReport(this.report)
  }


}
