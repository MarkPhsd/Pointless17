import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { UUID } from 'angular2-uuid';
import { ReportDesignerService } from '../../services/report-designer.service';
import { ItemBasic, viewBuilder_ReportJSON, viewBuilder_View_Field_Values, viewBuilder_Where_Selector, whereTypeList } from '../../interfaces/reports';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
@Component({
  selector: 'pgReporting-filter-builder',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './filter-builder.component.html',
  styleUrls: ['./filter-builder.component.scss']
})
export class FilterBuilderComponent implements OnInit {
  whereForm: UntypedFormGroup | undefined;
 //  @Input() viewBuilder_View_Field_Values = [] as viewBuilder_View_Field_Values[];
  @Input() allFields = [] as viewBuilder_View_Field_Values[];
  @Input() placeHolder = ''
  _report: Subscription | undefined;
  _fieldList: Subscription | undefined;

  report = {} as viewBuilder_ReportJSON

  andOrList = [
    {id: 1, name: 'AND'},
    {id: 2, name: 'OR'}
  ]

  whereSelector = whereTypeList;
    //  @Output() onCopy: EventEmitter<EventObj<ClipboardEvent>> = new EventEmitter();
  @Output() addFilter: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private reportDesignerService: ReportDesignerService,
    private fb: UntypedFormBuilder) { }

  ngOnInit(): void {

    this._report = this.reportDesignerService.report$.subscribe(data => {
      this.report = data;
    })

    this._fieldList = this.reportDesignerService.fieldsList$.subscribe(data =>{
      this.allFields = data;
    })

    this.initForm()
  }

  editSelection(item: viewBuilder_Where_Selector) {
    this.whereForm?.patchValue(item)
  }

  deleteItem(item: viewBuilder_Where_Selector) {
    const list = this.report.where
    this.report.where =  list.filter( data => { return data.id != item.id } )
    this.reportDesignerService.updateReport(this.report)
  }


  initForm() {
    this.whereForm = this.fb.group({
      id: [ UUID.UUID()],
      name:[],
      whereType: [],
      whereCondition: [],
      andOr: [],
      andOrGroupNumber: [1],
      andOrGroup: [],
    })
  }

  setWhereFieldValue(event: unknown) {
    if (!event) { return }
    const where = event as ItemBasic
    this.whereForm?.controls['field'].setValue(where?.name)
  }

  addWhereCondition() {

    if (!this.whereForm) { return }
    const item = this.whereForm.value as viewBuilder_Where_Selector;
    if (!this.report.where) {
      this.report.where = []
    }
    //find out if item is already in the list, then it's an edit.
    if (this.report.where) {
      const itemCheck = this.report.where.filter(check => {
        return check.id = item.id;
      })

      if (itemCheck[0] && itemCheck[0].id == item.id) {
        const list = this.report.where
        this.report.where =  list.filter( data => { return data.id != item.id } )
      }
    }

    this.report.where.push(item)
    this.reportDesignerService.updateReport(this.report)
    this.initForm()
    //add where condition to JSON - do push. //also remove the same condition if the field exists.
  }

  getWhereConditions() {
    const item =  this.reportDesignerService.getWhereString(this.report.where, [])
    // console.log(item)
    return item
  }

}
