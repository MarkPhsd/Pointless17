import { Component,   Input, Output, OnInit,
  EventEmitter,
  HostListener} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService,} from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams, GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ClientSearchModel } from 'src/app/_interfaces';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { Capacitor,  } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { IStoreCreditSearchModel, StoreCredit, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-store-credit-list',
  templateUrl: './store-credit-list.component.html',
  styleUrls: ['./store-credit-list.component.scss']
})
export class StoreCreditListComponent implements OnInit {
  buttonName: string; //if edit off then it's 'Assign'
  gridlist = "grid-list"
  editOff = false;
    //needed for search component
  searchForm:    UntypedFormGroup;
  get itemName() {
    if (this.searchForm) {
      return this.searchForm.get("itemName") as UntypedFormControl;
    }
  }

  @Output() outputPromptItem = new EventEmitter();

  get platForm()         {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }

  //AgGrid
  params               : any;
  private gridApi      : GridApi;
  // private gridColumnApi: GridAlignColumnsDirective;
  gridOptions          : any
  columnDefs           = [];
  defaultColDef        ;
  frameworkComponents  : any;
  rowSelection         = 'multiple'
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
  isfirstpage             : boolean;
  islastpage              : boolean;
  agtheme                 : string;
  value                   : any;
  urlPath                 : string;
  id                      : number;
  smallDevice             : boolean;
  listHeight              : string;
  gridDimensions          : string;
  selected                : any;
  searchPhrase            : string;

  storeCredit : StoreCredit;
  @Input() hideAdd   = false;
  @Input() hideEditSelected = false;

  initSubscriptions() {

  }
  constructor(  private _snackBar              : MatSnackBar,
    private storeCreditService     : StoreCreditService,
    private storeCreditMethodsService: StoreCreditMethodsService,
    private agGridService          : AgGridService,
    private fb                     : UntypedFormBuilder,
    private siteService            : SitesService,
    private productEditButtonService: ProductEditButtonService,
    private agGridFormatingService : AgGridFormatingService,
    public userAuthorization       : UserAuthorizationService,
    private awsService             : AWSBucketService,

    private dialog: MatDialog,
  )
{

  this.initAgGrid(this.pageSize);
}

async ngOnInit() {
  this.updateScreenSize();
  // this.initSearchForm();
  this.initForm();
  const clientSearchModel       = {} as ClientSearchModel;
  clientSearchModel.pageNumber  = 1
  clientSearchModel.pageSize    = 1000;

  this.urlPath        = await this.awsService.awsBucketURL();
  const site          = this.siteService.getAssignedSite()

  if (this.editOff) {
    this.buttonName = 'Assign'
    this.initSubscriptions();
    this.gridlist = "grid-list-nopanel"
  }
  if (!this.editOff) {
    this.buttonName = 'Edit'
  }
};


  @HostListener("window:resize", [])
  updateScreenSize() {
    this.smallDevice = false
    if (window.innerWidth < 390) {
      this.smallDevice = true
      this.listHeight = '35vh';
      this.initClasses()
      return
    }

    if (window.innerWidth < 420) {
      this.smallDevice = true
      this.listHeight = '42vh';
      this.initClasses()
      return
    }
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.listHeight = '67vh';
      this.initClasses()
      return
    }

    if (window.innerWidth < 1200) {
      this.smallDevice = true
      this.listHeight = '67vh';
      this.initClasses()
      return
    }
    if (window.innerWidth > 1200) {
      this.smallDevice = true
      this.listHeight = '78vh';

      this.initClasses()
      return
    }
  }

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions =  'width: 100%; height: 90%;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }

    //height: 72vh; 1180
    //greater than 900 and less than  should be 73vh
    //less than 900 should be 67vh
    //393  < 42vh
  }

  listAll(){
    const control = this.itemName
    this.searchPhrase = ''
    this.initForm()
    this.refreshSearch(1, '');
    if (control) { control.setValue('') }
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      userName          : [''],
      cardNumber        : [''],
      itemName          : [],
    });
  }

  refreshSearchPhrase(event) {
    const item = { itemName: event }
    this.searchForm.patchValue(item)
    this.searchPhrase = event;
    this.refreshSearch(1,event);
  }

    //mutli select method for selection change.
  onSelectionChanged(event) {

    let selectedRows       = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow          = this.pageSize;
    let selected           = []

    if (selectedRows.length == 0) { return }
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
    // this.getItem(this.id)
    // this.getItemHistory(this.id)

  }

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
  initSearchModel(search: string): IStoreCreditSearchModel {
    let searchModel        = {} as IStoreCreditSearchModel;

    // if (this.itemName) {
    //   if (this.itemName.value) { searchModel.cardNumber  = this.itemName.value  }
    //   if (this.itemName.value) { searchModel.userName  = this.itemName.value  }
    // }
    searchModel.cardNumber = search
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    return searchModel;
  }

  refreshSearch(page: number, search: string) {
    const site               = this.siteService.getAssignedSite()
    if (page != 0) { this.currentPage         = page}
    this.initSearchModel(search);

    this.onGridReady(this.params)
  }

  refreshGrid() {
    this.onGridReady(this.params)
  }

  //this doesn't change the page, but updates the properties for getting data from the server.
  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow
    this.startRow      = startRow
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.currentPage - 1 }
    if (tempStartRow < startRow) { return this.currentPage + 1 }
    return this.currentPage
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<StoreCreditResultsPaged>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel(this.searchPhrase);
    const site                = this.siteService.getAssignedSite()
    return this.storeCreditService.search(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    if (params == undefined) { return }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)

      items$.subscribe(data =>
        {
            const resp         =  data.paging

            if (data.errorMessage) {
              this.storeCreditMethodsService.notifyEvent(data.errorMessage, 'Alert')
              return
            }

            if (!resp)         {return}
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            // let results        =  this.refreshImages(data.results)

            params.successCallback(data.results)
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
  }

  //ag-grid
  //standard formating for ag-grid.
  //requires addjustment of column defs, other sections can be left the same.
  initAgGrid(pageSize: number) {
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
                      onClick: this.editFromGrid.bind(this),
                      label: this.buttonName,
                      getLabelFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 175,
                    maxWidth: 175,
                    flex: 2,
      },

      {headerName: 'Card Number',     field: 'cardNum',         sortable: true,
                  width   : 175,
                  minWidth: 175,
                  maxWidth: 175,
                  flex    : 1,
      },

      {headerName: 'User Name',    field: 'UserName', sortable: true,
                    width: 125,
                    minWidth: 125,
                    maxWidth: 125,

      },

      {headerName: 'Account',    field: 'accountNumber', sortable: true,
                    width: 125,
                    minWidth: 125,
                    maxWidth: 125,

      },

      {headerName: 'Value',  field: 'value',      sortable: true,
                  cellRenderer: this.agGridService.currencyCellRendererUSD,
                  width: 75,
                  minWidth: 125,
                  maxWidth: 150,
                  // flex: 1,
      },


    ]
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

  editFromGrid(e) {
    if (!e) {return}
    if (e.rowData.id)  {
      if (this.buttonName === 'Edit') {
        this.editItemWithId(e.rowData.id);
       } else {
          this.assignItem(e)
      }
    }
  }

  editItemWithId(id:any) {
    if(!id) {
      return
    }
    if (!this.userAuthorization.isManagement) {
      this.siteService.notify('Not Authorized', 'Alert', 2000)
      return;
    }
    this.storeCreditMethodsService.openStoreCreditEditor(id);
  }

  editProduct(e){
    this.editItemWithId(e.id)
  }

  getLabel() {
    return 'Edit'
  }

  assignItem(e){
    if (!e ) {
      return
    }
    this.outputPromptItem.emit(e.rowData.id)
  }

  childAddItem() {
    this.storeCreditMethodsService.openStoreCreditEditor(0);
  }

  editSelectedItems() {

  }

}
