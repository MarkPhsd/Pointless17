import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription, catchError, of, switchMap } from 'rxjs';

import { ReportDesignerService } from '../../services/report-designer.service';
import { viewBuilder_ViewList, viewBuilder_ReportJSON, viewBuilder_View_Field_Values, viewBuilder_Where_Selector, viewBuilder_View_Builder_GroupBy, chartTypeCollection, viewBuilderList, viewBuilder_Report } from '../../interfaces/reports';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'psReporting-designer-editor',
  templateUrl: './designer-editor.component.html',
  styleUrls: ['./designer-editor.component.scss']
})
export class DesignerEditorComponent implements OnInit {
  dynamicData$: Observable<any>;
  action$: Observable<viewBuilder_ReportJSON>;

  @Input() viewBuilder_ViewList = [] as viewBuilder_ViewList[];
  @Input() report = {} as viewBuilder_ReportJSON;

  @Input() inputForm: UntypedFormGroup | undefined;
  @Input() viewBuilder_View_Field_Values = [] as viewBuilder_View_Field_Values[];

  @Output() getViewFieldNames =  new EventEmitter();
  @Output() getReportJSON = new EventEmitter();
  @Output() getViewList =  new EventEmitter();

  _report: Subscription | undefined;
  reportTypesForm: UntypedFormGroup | undefined;
  reportTypes: viewBuilder_ViewList[];
  chartTypes = chartTypeCollection;
  fieldList$: Observable<any[]>;

  constructor(private reportDesignerService:ReportDesignerService,
              private matSnack: MatSnackBar,
              private router: Router,
              private fb: FormBuilder, ) { }

  ngOnInit(): void {
    this._report = this.reportDesignerService.report$.subscribe(data => {
      this.report = data;
      this.initForm(this.report);

      const view = this.getViewByID(data?.viewBuilder_viewListID)
      this.getFieldList(view)

    })
    this.reportTypes = this.reportDesignerService.getReportTypeList()
  }

  reportList() {
    this.router.navigate(['ps-designer-list'])
  }

  setReportType(item: any) {
    // console.log(item)
    if (item && this.report) {
      const view = this.getViewByName(item)
      if (!this.reportTypesForm) {
        console.log('no report type form')
      }
      this.getFieldList(view)
      this.report.viewBuilder_viewListID = view?.id;
      this.reportDesignerService.updateReport(this.report)
    }
  }

  getFieldList(view: viewBuilder_ViewList) {
    if (!view) { return null}
    this.fieldList$ = this.reportDesignerService.getViewFieldList(view.viewNameValue).pipe(switchMap(data => {
      this.reportDesignerService.fieldsList = data;
      this.reportDesignerService.updateFieldsList(data)
      // console.log(data)
      return of(data)
    }))
  }

  getViewByName(item: string):viewBuilder_ViewList {
    let  list = viewBuilderList
    const views = list.filter(data => {
      return data.name === item;
    })
    if (!views || !views[0]) {return}
    const view = views[0]
    return view;
  }

  getViewByID(id: number):viewBuilder_ViewList {
    let  list = viewBuilderList
    const views = list.filter(data => {
      return data.id === id;
    })
    if (!views || !views[0]) {return}
    const view = views[0]
    return view;
  }

  setChartType(item: any) {
    if (!item && this.report) {
      this.report.chartType = item?.name
      this.reportDesignerService.updateReport(this.report)
    }
  }

  initForm(item: viewBuilder_ReportJSON) {

    this.reportTypesForm = this.fb.group( {
      reportTypes: []
    });

    if (item) {
      this.inputForm = this.fb.group({
        id:[],
        name: [],
        viewBuilder_GroupsID: [],
        viewBuilder_viewListID: [],
        description: [],
        fields: [],
        where: [],
        groups: [],
        orderBy: [],
        dashBoard:[],
      })
      this.inputForm.patchValue(item)
    }
  }

  ngOnDestroy() {
    if (this._report) {
      this._report?.unsubscribe()
    }
  }

  saveSelectedFields(fields: viewBuilder_View_Field_Values[]) {
    this.report.fields = fields
    this.reportDesignerService.updateReport(this.report)
  }

  addFilter(fields: viewBuilder_Where_Selector[]) {
    this.report.where = fields
    this.reportDesignerService.updateReport(this.report)
  }

  addGroup(fields: viewBuilder_View_Builder_GroupBy[]) {
    this.report.groups = fields
    this.reportDesignerService.updateReport(this.report)
  }

  addOrderBy(fields: viewBuilder_View_Field_Values[]) {
    this.report.orderBy = fields
    this.reportDesignerService.updateReport(this.report)
  }

  getSQLStatement() {
   return this.reportDesignerService.getSQLStatement([])
  }

  save() {
    if (this.report) {
      this.report.name = this.inputForm.controls['name'].value;
      this.report.description = this.inputForm.controls['description'].value;
      this.report.dashBoard = this.inputForm.controls['dashBoard'].value;

      this.action$ = this.reportDesignerService.saveReport(this.report).pipe(switchMap(data => {
        this.matSnack.open('Saved', 'Close')
        this.report = JSON.parse(data.json)
        return of(this.report)
      }),catchError(data => {
        this.matSnack.open('Error' + data.toString(), 'Close')
        return of(null)
      }))
    }
  }

  getData() {
    this.dynamicData$ =   this.reportDesignerService.getResults(this.getSQLStatement())
  }
  delete() {

  }

  copy(){

  }

}

  // id: number;
	// name: string;
	// viewBuilder_GroupsID: number;
	// viewBuilder_viewListID: number;
	// description: string;
	// fields: viewBuilder_View_Field_Values[];
	// where:  viewBuilder_Where_Selector[];
	// groups: viewBuilder_View_Builder_GroupBy[];
	// orderBy: viewBuilder_View_Field_Values[];
