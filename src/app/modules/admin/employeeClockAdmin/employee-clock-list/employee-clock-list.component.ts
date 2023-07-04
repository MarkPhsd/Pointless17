import { Component,   OnInit,
  ViewChild ,ElementRef, AfterViewInit, HostListener, OnDestroy, Input } from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, Subject, Subscription  } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { EmployeeClockService,EmployeeClockResults,EmployeeClockSearchModel } from 'src/app/_services/employeeClock/employee-clock.service';
import {  EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { Capacitor,  } from '@capacitor/core';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';

export interface rowItem {
  field: string,
  cellRenderer: string,
  cellRendererParams: any;
  minWidth: number;
  maxWidth: number;
  width   : number;
  flex: number;
  headerName: string;
  sortable: boolean;
}

@Component({
  selector: 'employee-clock-list',
  templateUrl: './employee-clock-list.component.html',
  styleUrls: ['./employee-clock-list.component.scss']
})
export class EmployeeClockListComponent implements OnInit {

  @ViewChild('input', {static: true}) input: ElementRef;
  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();
  dateRange        : UntypedFormGroup;

  @Input() reportOnly: boolean;
  @Input() notifier   : Subject<boolean>
  @Input() startDate: string;
  @Input() endDate: string;
  _changeNotifier: Subscription
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
   pageSize                = 25
   currentRow              = 1;
   currentPage             = 1
   numberOfPages           = 1
   startRow                = 0;
   endRow                  = 0;
   recordCount             = 0;
   isfirstpage             : boolean;
   islastpage              : boolean;
   value             : any;
   // //This is for the filter Section//
   //search form filters
   searchForm:        UntypedFormGroup;
   inputForm        : UntypedFormGroup;
   jobTypeID     : number;
   selected        : any[];
   selectedRows    : any;
   agtheme         = 'ag-theme-material';
   gridDimensions  = "width: 100%; height: 100%;"
   urlPath:        string;

   id              :   number;
   employeeClock   :   EmployeeClock ;
   searchModel     :   EmployeeClockSearchModel;
   isAuthorized    :   boolean;
   isStaff         :   boolean;
   smallDevice       = false;
   @Input() counter: number;
   buttonName      = 'Edit';
   pageNumber: number = 1;
   employeeID: number;

  summary: EmployeeClock;

  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }
  get platForm()         {  return Capacitor.getPlatform(); }

  constructor(
    private _snackBar               : MatSnackBar,
    private employeeClockService    : EmployeeClockService,
    private productEditButtonService: ProductEditButtonService,
    private siteService             : SitesService,
    private dateHelper              : DateHelperService,
    private agGridFormatingService  : AgGridFormatingService,
    private agGridService:  AgGridService,
  )
  {
    this.initAgGrid(25);
  }

  ngOnInit(): void {
    const i = 0;
    this.updateItemsPerPage();
    this.initNotifierSubscription();
  }

  initNotifierSubscription() {
    if (!this.notifier) {
      return
    }
    this._changeNotifier = this.notifier.asObservable().subscribe(data => {
      this.initGridColumns()
      console.log('refresh')
      let search = {} as EmployeeClockSearchModel
      search.summary = true;
      search.endDate = this.endDate;
      search.startDate = this.startDate;
      this.searchModel = search;
      this.refreshSearch(search);
    })
  }

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions = 'width: 100%; height: 100%;'
    this.agtheme        = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }

  initAgGrid(pageSize: number) {
    this.initGridColumns()
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

  initGridColumns() {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 2,
    };

    this.columnDefs = []

    let item  =   {
    field: 'id',
    cellRenderer: "btnCellRenderer",
                  cellRendererParams: {
                      onClick: this.editItemWithId.bind(this),
                      label:  this.buttonName,
                      getLabelFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 125,
                    maxWidth: 125,
                    width   : 125,
                    flex: 2,
                    headerName: '',
                    sortable: false,
    } as rowItem
    if (!this.reportOnly) {
      this.columnDefs.push(item);
    }

    const site = this.siteService.getAssignedSite();

    item =   {headerName: 'Employee',     field: 'employeeName', sortable: true,
      width   : 150,
      minWidth: 150,
      maxWidth: 150,
      flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'Login',     field: 'logInTime', sortable: true,
                cellRenderer: this.agGridService.dateCellRendererUSD,
                width   : 220,
                minWidth: 220,
                maxWidth: 220,
                flex    : 2,
    } as any
    if (!this.reportOnly) {
      this.columnDefs.push(item);
    }
    item =   {headerName: 'Log Out',     field: 'logOutTime', sortable: true,
              cellRenderer: this.agGridService.dateCellRendererUSD,
              width   : 220,
              minWidth: 220,
              maxWidth: 220,
              flex    : 2,
    } as any
    if (!this.reportOnly) {
      this.columnDefs.push(item);
    }

    item =   {headerName: 'Reg Hours',     field: 'regHours', sortable: true,
              width   : 125,
              minWidth: 125,
              maxWidth: 125,
              flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'Reg Pay',     field: 'regPay', sortable: true,
          cellRenderer: this.agGridService.currencyCellRendererUSD,
          width   : 125,
          minWidth: 125,
          maxWidth: 125,
          flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'OT Hours',     field: 'otHours', sortable: true,
        width   : 125,
        minWidth: 125,
        maxWidth: 125,
        flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'OT Pay',     field: 'otPay', sortable: true,
          cellRenderer: this.agGridService.currencyCellRendererUSD,
          width   : 125,
          minWidth: 125,
          maxWidth: 125,
          flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'Break Min',     field: 'breakMinutes', sortable: true,
          width   : 125,
          minWidth: 125,
          maxWidth: 125,
          flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'Break Min',     field: 'breakMinutes', sortable: true,
          width   : 100,
          minWidth: 200,
          maxWidth: 200,
          flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'OG CLock Out',     field: 'originalClockIn', sortable: true,
                cellRenderer: this.agGridService.dateCellRendererUSD,
                width   : 220,
                minWidth: 220,
                maxWidth: 220,
                flex    : 2,
    } as any
    this.columnDefs.push(item);

    item =   {headerName: 'OG CLock Out',     field: 'originalClockOut', sortable: true,
              cellRenderer: this.agGridService.dateCellRendererUSD,
              width   : 220,
              minWidth: 220,
              maxWidth: 220,
              flex    : 2,
    } as any

    this.columnDefs.push(item);

  }
  agColumnApiRefresh() {
    if (this.columnDefs) {
      this.agGridFormatingService.initGridOptionsFormated(this.pageSize, this.columnDefs)
    }
  }

  //mutli select method for selection change.
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
    if (selected) {
      this.selected = selected
      this.id = selectedRows[0].id;
      this.getItem(this.id)
    }
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return this.buttonName
      else return this.buttonName
  }

  refreshSearchAny(data:any) {
    this.startDate = this.dateHelper.format(data?.startDate, 'MM/dd/yyyy');
    this.endDate =this.dateHelper.format(data?.endDate, 'MM/dd/yyyy');
    this.refreshSearch(data)
  }

  refreshSearch(data) {
    const search = {} as EmployeeClockSearchModel
    if (search) {
      search.pageNumber = this.pageNumber;
      if (data) {
        search.employeeID = data?.employeeID;
      }
      // this.employeeID   = data?.employeeID;
      if (data?.pageSize) {
        if (+data?.pageSize != 0) {
          this.pageSize = data?.pageSize
        }
      }
      if (this.pageNumber) {
        this.pageNumber = 1;
      }
      search.pageNumber = this.pageNumber;
      search.summary    = data?.summary;
      search.pageSize   = this.pageSize;
      this.currentPage  = this.currentPage;
      search.startDate  = this.startDate;
      search.endDate    = this.endDate;
    }
    this.searchModel = search
    this.onGridReady(this.params)
  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.employeeClockService.getEmployeeClock(site,id).subscribe(data => {
          this.employeeClock = data;
        }
      )
    }
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    // if (!params) { return }
    try {
      if (params)  {
        this.params  = params
        this.gridApi = params.api;
        params.api.sizeColumnsToFit();
        this.autoSizeAll(false)
      }
    } catch (error) {

    }

    this.onFirstDataRendered(this.params)

    // if (!params) { return }
    if (params == undefined) { return }
    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    if (this.searchModel && this.searchModel.summary) {
      params.startRow = 1;
      params.endRow = 500;
    };

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      if (!items$) { return }
      items$.subscribe(data =>
        {
            const resp           =  data.paging
            this.summary         = data?.summary
            // console.log('data', data, data.summary)
            if (resp) {
              this.isfirstpage   = resp.isFirstPage
              this.islastpage    = resp.isFirstPage
              this.currentPage   = resp.currentPage
              this.numberOfPages = resp.pageCount
              this.recordCount   = resp.recordCount
              if (this.numberOfPages !=0 && this.numberOfPages) {
                this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
              }
            }
            if (data.results) {
              let results  =  this.refreshImages(data.results)
              params.successCallback(results)
              this.rowData = results
            }
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
    this.autoSizeAll(true)
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<EmployeeClockResults>  {
    const site                = this.siteService.getAssignedSite()
    // console.log(this.searchModel)
    let search = {} as EmployeeClockSearchModel
    search = this.searchModel;
    if (!this.searchModel) {
      search = {} as EmployeeClockSearchModel
    }

    if (search) {
      search.pageNumber = this.pageNumber;
      search.pageSize =   this.pageSize;
      this.currentPage =  this.currentPage;
      search.startDate =  this.startDate;
      search.endDate   =  this.endDate;
      search.employeeID = this.employeeID
    }

    if (search.startDate && search.endDate) {
      if (search.summary) {
        return this.employeeClockService.getTimeClockSummary(site, search)
      }
      return this.employeeClockService.listEmployeesBetweenPeriod(site, search)
    }

  }

  onFirstDataRendered (params) {
    try {
      params.api.sizeColumnsToFit()
      window.setTimeout(() => {
        const colIds = params.columnApi.getAllColumns().map(c => c.colId)
        params.columnApi.autoSizeColumns(colIds)
      }, 50)
      } catch (error) {
      console.log(error)
    }
  }

  refreshImages(data) {
    const urlPath = this.urlPath
    if (urlPath) {
      data.forEach( item =>
        {
          if (item.urlImageMain) {
            const list = item.urlImageMain.split(',')
            if (list[0]) {
              item.imageName = `${urlPath}${list[0]}`
            }
          }
        }
      )
    }
    return data;
  }

  autoSizeAll(skipHeader) {
    try {
      var allColumnIds = [];
      this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
        allColumnIds.push(column.colId);
      });
      this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
    } catch (error) {
      console.log(error)
    }
  }

  listAll(){
    const control = this.itemName
    control.setValue('')
    // this.refreshSearch()
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.gridDimensions = 'width: 100%; height: 85%;'
    }
  }

  editItemWithId(item:any) {
    if(!item) {
      // console.log(item)
      return
    }
    const id   = item.rowData.id;
    const site = this.siteService.getAssignedSite()
    const dialog = this.productEditButtonService.openClockEditor(id)
    dialog.afterClosed().subscribe(data => {
      this.refreshSearchAny(this.searchModel)
    })
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

  filterBottomSheet() {
    // this._bottomSheet.open(EmployeeClockEditComponent);
  }
}


