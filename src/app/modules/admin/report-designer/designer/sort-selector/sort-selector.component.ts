import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { Subscription } from 'rxjs';
import { ReportDesignerService } from '../../services/report-designer.service';
import { viewBuilder_View_Field_Values, viewBuilder_ReportJSON } from '../../interfaces/reports';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'psReporting-sort-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule],
  templateUrl: './sort-selector.component.html',
  styleUrls: ['./sort-selector.component.scss']
})
export class SortSelectorComponent implements OnInit {
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
          // this.report.orderBy
          return (!data.fieldTypeAggregate || data.fieldTypeAggregate == '')
        })
      }
    })

  }

  addAll() {
    const list = [] as viewBuilder_View_Field_Values[];
    this.allFields.forEach(data => {
      let item = {} as viewBuilder_View_Field_Values;
      item.id = UUID.UUID();
      item.name = data.name;
      list.push(item);
    })
    this.report.orderBy = list;
    this.reportDesignerService.updateReport(this.report)
  }

  addItem(item: viewBuilder_View_Field_Values) {

    if (!this.report.orderBy) {
      this.report.orderBy= []
    }

    let items =  this.report.orderBy.filter(data => {
      return data.name != item.name
    })

    items.push(item)
    this.report.orderBy = items;
    this.reportDesignerService.updateReport(this.report)
  }

  deleteItem(item: viewBuilder_View_Field_Values ) {
    const list = this.report.orderBy
    this.report.orderBy =  list.filter( data => { return data.id != item.id } )
    this.reportDesignerService.updateReport(this.report)
  }


}
