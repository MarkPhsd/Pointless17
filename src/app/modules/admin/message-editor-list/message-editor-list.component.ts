import { Component,  Output, OnInit,
  ViewChild ,ElementRef, EventEmitter, TemplateRef } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, of } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
// import { AgGridService } from 'src/app/_services/system/ag-grid-service';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { Capacitor } from '@capacitor/core';
import { IRequestMessage, IRequestMessageSearchModel, IRequestMessagesResult, RequestMessageService } from 'src/app/_services/system/request-message.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-message-editor-list',
  templateUrl: './message-editor-list.component.html',
  styleUrls: ['./message-editor-list.component.scss']
})
export class MessageEditorListComponent implements OnInit {


  action$: Observable<any>;

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  @ViewChild('messageSettings') messageSettings: TemplateRef<any>;

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  gridDimensions = "height: 90%; min-height:600px"
  // //search with debounce
  searchItems$              : Subject<any> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )
  get platForm() {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }

  //AgGrid
  params               : any;
  private gridApi      : GridApi;
  gridOptions : any;
  sortList: boolean;

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
  isfirstpage             :boolean;
  islastpage              :boolean;

  settingsForm    : UntypedFormGroup;
  //search form filters
  typeList            = this.messageService.messageTypes
  searchForm:        UntypedFormGroup;
  inputForm        : UntypedFormGroup;
  buttonVisible   : boolean;
  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  value
  requestMessages
  requestMessage: IRequestMessage;
  id: number;
  requestMessage$: Observable<IRequestMessage>;

  viewSettings: boolean;
  savingSettings$: Observable<any>;
  message: string;
  uiSettings: TransactionUISettings;

  constructor( private siteService           : SitesService,
              private fb                     : UntypedFormBuilder,
              private _snackBar              : MatSnackBar,
              private agGridFormatingService : AgGridFormatingService,
              private messageService     : RequestMessageService,
              private uISettingsService: UISettingsService,
              private productEditButtonService: ProductEditButtonService,
           ) { }

  ngOnInit() {
    this.initClasses();
    this.initForm();
    this.initAgGrid(50);
    const site          = this.siteService.getAssignedSite()
    this.rowSelection   = 'multiple'
    this.initSettingsForm();
  };

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions =  'width: 100%; height: 100%; min-height:600px;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%; min-height:600px;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%; min-height:600px;' }
  }

   initForm() {
    this.searchForm   = this.fb.group( {
      itemName  : [''],
      type  : [],
      archived  : [],
      template  : [],
      balanceZero: [],
    });

  }

  initSettingsForm() {
    this.uISettingsService.transactionUISettings$.subscribe( data => {
      if (data) {
        this.settingsForm = this.uISettingsService.initForm(this.settingsForm);
        this.uiSettings = data;
        this.settingsForm.patchValue(data)
      }
    });
  }

  buttoncellrender(params: any) {
    this.buttonVisible = true;
    if (isNaN(params) != true)  {
      this.buttonVisible = false
    }
  }

  initMessageListDefault() {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.messageService.postMessageList(site).pipe(
      switchMap(data =>  {
        console.log(data)
        this.siteService.notify('Default messages generated for communications. You may filter for templates and edit the text. Leave the name as it is, edit subject and messages only.', 'close', 10000)
        return of(data)
    }))
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

    this.columnDefs =  []
    let item = {}
    // item =  {
    //   field: 'id',
    //   cellRenderer: "btnCellRenderer",
    //                   cellRendererParams: {
    //                     cellRenderer: this.buttoncellrender,
    //                     onClick: this.editItem.bind(this),
    //                     getLabelFunction: this.getLabel.bind(this),
    //                     btnClass: 'btn btn-primary btn-sm'
    //                   },
    //     minWidth: 125,
    //     maxWidth: 125,
    //     flex: 2,
    //   }
    //   this.columnDefs.push(item)
      item = {headerName: 'Name',     field: 'userRequested',         sortable: true,
                    width   : 275,
                    minWidth: 175,
                    maxWidth: 275,
                    flex    : 1,
      }
      this.columnDefs.push(item)
      item = {headerName: 'Subject',     field: 'subject',         sortable: true,
            width   : 275,
            minWidth: 175,
            maxWidth: 275,
            flex    : 1,
      }
      this.columnDefs.push(item)
      item = {headerName: 'Sender',     field: 'senderName',         sortable: true,
            width   : 275,
            minWidth: 175,
            maxWidth: 275,
            flex    : 1,
      }

      this.columnDefs.push(item)
      item ={
        headerName: "Archived",
            width:    100,
            minWidth: 100,
            maxWidth: 100,
            flex: 1,
            field: "archived",
            cellRenderer: function(params) {
                var input = document.createElement('input');
                input.type="checkbox";
                input.checked=params.value;
                input.disabled = true;
                input.addEventListener('click', function (event) {
                    params.value=!params.value;
                    params.node.data.fieldName = params.value;
                });
            return input;
        }
      }
      this.columnDefs.push(item)

      this.gridOptions = this.agGridFormatingService.initGridOptions( pageSize, this.columnDefs );
      return this.columnDefs;

  }

  listAll(){
    const control = this.itemName
    control.setValue('')
    this.initForm();
    this.refreshSearch()
  }

  filter(event) {
    if (event.value === 'clear'){
      this.initSearchModel();
      return;
    }
    this.initSearchModel();
    this.refreshSearch();
  }

  updateSetting() {

  }

  get settingsView() {
    if (this.viewSettings) {
      return this.messageSettings;
    }
    return undefined;
  }

  initSearchModel(): IRequestMessageSearchModel {
    let searchModel        = {} as IRequestMessageSearchModel;
    let search             = ''
    if (this.itemName.value)  { searchModel.name  = this.itemName.value  }

    console.log(this.searchForm.value)

    if ( this.searchForm.controls['type'].value) {
      searchModel.type       = this.searchForm.controls['type'].value;
    }

    if (this.searchForm.controls['template'].value) {
      searchModel.template      = this.searchForm.controls['template'].value;
    }

    if (this.searchForm.controls['archived'].value) {
      searchModel.archived      = this.searchForm.controls['archived'].value;
    }
    if (this.searchForm.controls['balanceZero'].value) {
      searchModel.archived      = this.searchForm.controls['balanceZero'].value;
    }

    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    return searchModel
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch() {
    this.currentPage         = 1
    const site               = this.siteService.getAssignedSite()
    const searchModel        = this.initSearchModel();
    this.params.startRow     = 1;
    this.params.endRow       = this.pageSize;

    this.onGridReady(this.params)
    return this._searchItems$
  }

     //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<IRequestMessagesResult>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const search              = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.messageService.searchMessages(site, search )
  }

  //ag-grid standard method
  onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
    }

    if (params == undefined) { return }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            if (!data || !data.paging) {
              return;
            }
            const resp         =  data.paging
            if (!resp)         {return}
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            params.successCallback(data.results)
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
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

  //search method for debounce on form field
  displayFn(search) {
    this.selectItem(search)
    return search;
  }

  //search method for debounce on form field
  selectItem(search){
    if (search) {
      this.currentPage = 1
      this.searchPhrase.next(search)
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

      // document.querySelector('#selectedRows').innerHTML = selectedRowsString;
      this.selected = selected
      this.id = selectedRows[0].id;
      this.getItem(this.id)

    }

    getItem(id: number) {
      if (id) {
        const site = this.siteService.getAssignedSite();
        this.requestMessage$ = this.messageService.getRequestMessage(site, this.id).pipe(
          switchMap(data => {
           this.requestMessage = data;
           return of(data)
          }
        ))
      }
    }

    onExportToCsv() {
      this.gridApi.exportDataAsCsv();
    }

    getLabel(rowData)
    {
      return 'Edit';
    }

    onBtnClick1(e) {
      this.rowDataClicked1 = e.rowData;
    }

    onBtnClick2(e) {
      this.rowDataClicked2 = e.rowData;
    }

    editProductFromGrid(e) {
      if (e.rowData.id)  {
        console.log(e.rowData)
        this.editItem(e.rowData);
      }
    }

    editItem(data) {
      const dialog =   this.productEditButtonService.openMessageEditor(data);
      dialog.afterClosed(data => {
        this.listAll()
      })
    }

    addNew()  {
      const dialog =  this.productEditButtonService.openMessageEditor(null);
      dialog.afterClosed(data => {
        // console.log('added')
        this.listAll()
      })
    }

    editSelectedItems() {
      if (!this.selected) {
        this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
        return
      }
      this.productEditButtonService.openBlogEditor(this.selected)
    }

    openMessage(item) {
      this.editItem(item)
    }

    delete(item) {
      const warn = window.confirm('Are you sure you want to delete this item?')
      if (!warn) {return }
     const site = this.siteService.getAssignedSite()
      this.action$ = this.messageService.delete(site, item.id).pipe(
        switchMap(data => {
          this.refreshSearch()
          return of(data)
      }))
    }

    getMessageType(type: string) {

      if (type) {
       const item = this.messageService.messageTypes.find(data => {
          return data.id.toLowerCase() == type.toLowerCase()
        })
        return item
      }
    }

}
