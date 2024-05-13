import { Component, OnInit, SimpleChange, ViewChild, AfterViewInit , OnChanges, Inject} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable} from 'rxjs';
import { UntypedFormBuilder,  UntypedFormGroup, Validators } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatSort } from '@angular/material/sort';
import { ManifestStatus, ManifestStatusService } from 'src/app/_services/inventory/manifest-status.service';
import { GridApi, IGetRowsParams } from 'ag-grid-community';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';

@Component({
  selector: 'app-manifest-status',
  templateUrl: './manifest-status.component.html',
  styleUrls: ['./manifest-status.component.scss']
})
export class ManifestStatusComponent implements OnInit {

  inputForm: UntypedFormGroup;
  location  : ManifestStatus  ;

  selected: any;
  id: number;

  //AgGrid
  params               : any;
  private gridApi      : GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents  : any;
  rowSelection         : any;
  rowDataClicked1      = {};
  rowDataClicked2      = {};
  rowData:             any[];
  pageSize                = 20
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             = 0;
  islastpage              = 0;
  agtheme         = 'ag-theme-material';


  constructor(
              private _snackBar            : MatSnackBar,
              private fb                   : UntypedFormBuilder,
              private manifestStatusService: ManifestStatusService,
              private agGridFormatingService  : AgGridFormatingService,
    )
    {  }

  ngOnInit(): void {
    this.initForm();
    this.initAgGrid(25);
    this.refresh();
  }

  refresh() {
    const list$ = this.manifestStatusService.listAll();
    this.initAgGrid(25);
  }

  initAgGrid(pageSize: number) {
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);

    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 2,
      // minWidth: 100,
    };

    this.columnDefs =  [
      {
      field: 'id',
      cellRenderer: "btnCellRenderer",
                  cellRendererParams: {
                      onClick: this.editItem.bind(this),
                      label: 'Edit',
                      getLabelFunction: 'edit',
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 150,
                    maxWidth: 150,
                    flex: 2,
      },
      {field: 'name',          headerName: 'Name',         sortable: true,
                  width   : 275,
                  minWidth: 175,
                  maxWidth: 275,
                  flex    : 1,
      },
      {field: 'icon',     headerName: 'Icon',      sortable: true,
                  width: 150,
                  minWidth: 155,
                  maxWidth: 150,
                  flex: 1,
      },
    ]

  }

  //ag-grid standard method.
  getDataSource(params) {
    return {
    getRows: (params: IGetRowsParams) => {
      const items$ = this.getRowData(params, params.startRow, params.endRow)
      console.log(params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            this.isfirstpage = 1
            this.islastpage = 1
            this.currentPage = 1
            this.numberOfPages = 1
            this.recordCount = 100;
            params.successCallback(data)
            this.rowData = data
          }, err => {
            console.log(err)
          }
      );
      }
    };
  }

    //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<ManifestStatus[]>  {
    // this.currentPage  = this.setCurrentPage(startRow, endRow)
    // const searchModel = this.initSearchModel();
    // const site        = this.siteService.getAssignedSite()
    return this.manifestStatusService.listAll()
  }

      //ag-grid standard method
  async onGridReady(params: any) {

    if (params)  {
      this.params         = params
      this.gridApi        = params.api;
      // this.gridColumnApi  = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    if (params == undefined) {
      console.log('params is not defined')
      return
    }

    if (!params.startRow ||  params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    console.log(params.startRow, params.endRow)
    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
         {
            this.isfirstpage   = 1
            this.islastpage    = 1
            this.currentPage   = 1
            this.numberOfPages = 1
            this.recordCount   = 100;
            let results        =  data // this.refreshImages(data.results)
            params.successCallback(results)
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);

  }


  editItem(row: any) {
    this.initFormData(row.rowData.id)
  }

  initForm() {
    this.inputForm = this.fb.group({
      name: ['', Validators.required],
      icon: [''],
      id  : [''],
    })
  }

  initFormData(id: number) {
    this.manifestStatusService.get(id).subscribe(
      {next:
        data => {
          this.inputForm.patchValue(data)
          this.location = data
        },
        error: err => {
          this.notifyEvent(`Error:. ${err}`, "Error")
        }
      }
    )
  }


  update() {
    if (this.inputForm.valid) {
      this.applyChanges(this.inputForm.value)
    };
  }

  applyChanges(data) {
    console.log(data);
    if (data.id) {
      const item$ = this.manifestStatusService.update( data.id, data)
      this.updateItem(item$);
    } else {
      const item$ = this.manifestStatusService.add(data)
      this.updateItem(item$)
    }
  }

  delete() {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    if (this.location) {
      this.initForm();
      let item$ =  this.manifestStatusService.delete(this.location.id)
      this.updateItem(item$)
    }
  }

  updateItem(item$: Observable<ManifestStatus>){
    item$.subscribe(
      {
        next: data => {
          this.refreshSearch();
          this.initForm()
        },
        error: err => {
          this.notifyEvent("Error deleting: " + err, "Error")
        }
      }
    )
  }

  refreshSearch(): Observable<ManifestStatus[]> {
    this.currentPage         = 1
    this.params.startRow     = 1;
    this.params.endRow       = this.pageSize;
    this.onGridReady(this.params)
    return this.manifestStatusService.listAll();
  }

  onSelectionChanged(event) {

    let selectedRows       = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow          = this.pageSize;
    let selected           = []

    selectedRows.forEach(function (selectedRow, index) {
    if (index >= maxToShow) { return; }
    if (index > 0) {  selectedRowsString += ', ';  }
      selected.push(selectedRow.id)
      selectedRowsString += selectedRow.name;
    });

    if (selectedRows.length > maxToShow) {
    let othersCount = selectedRows.length - maxToShow;
    selectedRowsString +=
      ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }

    this.selected = selected
    this.id = selectedRows[0].id;
  }


  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
