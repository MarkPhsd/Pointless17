import {  Component, EventEmitter, Inject, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { GridApi, Optional } from 'ag-grid-community';
import { UUID } from 'angular2-uuid';
// import { ButtonRendererComponent } from '../../widgets/button-renderer/button-renderer.component';
import { ReportDesignerService } from '../../services/report-designer.service';
import { viewBuilder_Report, viewBuilder_ReportJSON } from '../../interfaces/reports';
import { ButtonRendererComponent } from '../../widgets/button-renderer/button-renderer.component';
import { Observable, of, switchMap } from 'rxjs';
import { threadId } from 'worker_threads';
import { json } from 'stream/consumers';

@Component({
  selector: 'ps-designer-list',
  templateUrl: './designer-list.component.html',
  styleUrls: ['./designer-list.component.scss']
})
export class DesignerListComponent implements OnInit {

  // get isGridView() {
  //   if (this.viewGrid) {
  listReports$: Observable<viewBuilder_ReportJSON[]>;
  addReport$: Observable<viewBuilder_ReportJSON>;
  getItem$: Observable<viewBuilder_ReportJSON>;
  action$: Observable<viewBuilder_Report[]>;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  viewGrid: boolean = false

  @ViewChild('gridView') gridView: TemplateRef<any> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() dataInterface: string = ''
  @Input() data        = [] as any[];
  @Output() delete = new EventEmitter();
  @Output() add    = new EventEmitter();
  selectedReport: viewBuilder_ReportJSON | undefined;
  params               : any;
  private gridApi      : GridApi | undefined;
  get gridAPI(): GridApi | undefined {  return this.gridApi;  }

  columnDefs = [] as any[];
  frameworkComponents:   any;
  defaultColDef = {
    flex: 1,
    minWidth: 100,
  };

  gridOptions = {
    defaultColDef: {
      sortable: true,
      filter: 'agTextColumnFilter',
      resizable: true,
    },

    columnDefs: this.columnDefs,
    enableSorting: true,
    enableFilter: true,
    pagination: false,
  } as any;

  configureColumns() {
    let colDefs = [] as any[]
    let item = {} as any;

    item = {
      headerName: 'Edit',
      field: "id",
      cellRenderer: ButtonRendererComponent,
      cellRendererParams: {
        onClick: this.editFromGrid.bind(this),
        label: 'Edit',
        getLabelFunction: this.getLabel.bind(this),
        btnClass: ''
      },
      width   : 125,
      minWidth: 125,
      maxWidth: 125
    }
    colDefs.push(item)

    // item = {
    //   field: 'athlete',
    //   cellRenderer: BtnCellRenderer,
    //   cellRendererParams: {
    //     clicked: function (field: any) {
    //       alert(`${field} was clicked`);
    //     },
    //   },
    //   minWidth: 150,
    // }
    // colDefs.push(item)

    item = {}  as any;
    item = {headerName: 'Name',field: 'name',
          sortable: true,
          width   : 175,
          minWidth: 175,
          maxWidth: 275,
          flex    : 1,
    } as any;
    colDefs.push(item)

    item = {} as any;
    item =   {headerName: 'Description',field: 'description',
          sortable: true,
          width   : 375,
          minWidth: 375,
          maxWidth: 375,
          flex    : 1,
          cellStyle: {'white-space': 'normal'},
    } as any;
    colDefs.push(item)

    this.columnDefs = colDefs;

  }

  initGridResults() {
    this.configureColumns()
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
  }

  constructor(
    private matSnack : MatSnackBar,
    private router: Router,
    private reportDesignerService: ReportDesignerService,
    @Optional() private dialogRef: MatDialogRef<DesignerListComponent>,
    @Inject(MAT_DIALOG_DATA) public gridData: any,
  ) {
    this.viewGrid = true
    this.listReports();
    this.configureColumns()
  }

  listReports() {
    console.log('listReports')
    this.listReports$ = this.reportDesignerService.getReports().pipe(switchMap(data => {
      const list = [] as viewBuilder_ReportJSON[];
      console.log('listReports', data)
      if (data) {
        return of(this.listJSONFromReports(data))
      }
      return of(list)
    }))
  }

  listJSONFromReports(reports: viewBuilder_Report[]): viewBuilder_ReportJSON[] {
    const list = [] as viewBuilder_ReportJSON[];
    let report = {} as viewBuilder_ReportJSON;
    reports.forEach(data => {
      let report = JSON.parse(data.json);
      list.push(report)
    })
    this.data = list;
    if (!list) {
      this.gridApi.setRowData(list)
    }
    return list;
  }

  refreshReport() {

  }

  ngOnInit() {
    this.refreshList();
  }

  refreshList() {
    this.action$ = this.reportDesignerService.getReports().pipe(switchMap(data => {
      if (!data) {
        data =  this.addReport()
        this.data = data;
      }
      if (this.gridApi) {
        this.gridApi.setRowData(this.data)
      }
      return of(data)
    }))
  }

  ngAfterViewInit(): void {

  }

  onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
      params.api.resetRowHeights();
    }
    if (this.data) {

      // this.dynamicallyConfigureColumnsFromObject(this.data)
    }
  }

  onExportToCsv() {
    if (this.gridAPI == undefined) { return }
    this.gridApi.exportDataAsCsv();
  }

  loadExample() {

  }

  get isGridView() {
    if (this.viewGrid) {
      return this.gridView;
    }
    return null
  }

  addReport(): viewBuilder_Report[] {

    const item = this._addReport();
    this.data.push(item)
    this.add.emit(item)
    if (this.gridApi) {
      this.gridApi.setRowData(this.data)
    }
    return this.data
  }

  _addReport():viewBuilder_Report {
    const item = {} as viewBuilder_ReportJSON;
    item.name = 'New report.'
    item.description = 'Description.'
    item.id   = UUID.UUID()

    const report = {} as viewBuilder_Report;
    report.name = item.name;
    report.id = item.id;
    report.json = JSON.stringify(item);

    this.addReport$ = this.reportDesignerService.postReport(report).pipe(switchMap(data => {
      const item = JSON.parse(data.json) as viewBuilder_ReportJSON
      return of(item)
    }))
    return report;
  }

  deleteReport() {
    if (!this.selectedReport || !this.selectedReport.id) { return }
    this.delete.emit(this.selectedReport?.id)
  }

  copyReport() {

  }

  onSelectionChange(event: any) {
    console.log(event)
  }

  loadItem(report: viewBuilder_ReportJSON) {
    this.reportDesignerService.updateReport(report)
    this.router.navigate(['ps-report-editor'])
  }

  loadExampleReport() {
    const item = this.reportDesignerService.loadExampleData()
    this.reportDesignerService.updateReport(item)
    this.router.navigate(['ps-report-editor'])
  }

  editFromGrid(e: any) {
    if (e.rowData)  {
      console.log('get report', e.rowData.id)
      this.getItem$ = this.reportDesignerService.getReport(e.rowData.id).pipe(switchMap(data => {
          if (!data) {
            const item = this._addReport();
            const report = JSON.parse(item.json) as unknown as  viewBuilder_ReportJSON
            return of(report)
          }
          const item = JSON.parse(data.json) as unknown as  viewBuilder_ReportJSON
          return of(item)
      })).pipe(switchMap(data => {
        console.log('load item', data)
        this.loadItem(data);
        return of(data)
      }))
    }
  }

  getLabel(rowData: any)
  {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }


}
