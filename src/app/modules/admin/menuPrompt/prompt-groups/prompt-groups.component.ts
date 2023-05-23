import { Component,  Inject,  Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService} from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { Capacitor, Plugins } from '@capacitor/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPromptSubResults, MenuSubPromptSearchModel } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { IPromptResults, MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';

@Component({
  selector: 'prompt-groups',
  templateUrl: './prompt-groups.component.html',
  styleUrls: ['./prompt-groups.component.scss']
})
export class PromptGroupsComponent  implements OnInit, AfterViewInit {

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchModel: MenuPromptSearchModel;

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  gridDimensions = "height: 90%"
  // //search with debounce
  searchItems$              : Subject<IPromptResults> = new Subject();
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
  isfirstpage             :boolean;
  islastpage              :boolean;

  //search form filters
  searchForm:        UntypedFormGroup;
  inputForm        : UntypedFormGroup;

  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';

  urlPath:        string;
  value : any;
  id              : number;
  prompt         : IPromptGroup;

  buttonVisible  = true;

  constructor(  private _snackBar              : MatSnackBar,
                private promptService          : PromptGroupService,
                private agGridService          : AgGridService,
                private fb                     : UntypedFormBuilder,
                private siteService            : SitesService,
                private productEditButtonService: ProductEditButtonService,
                private agGridFormatingService : AgGridFormatingService,
                private awsService             : AWSBucketService,
              )
{
  this.initForm();
  this.initAgGrid(this.pageSize);
}


async ngOnInit() {
  this.initClasses()
  this.urlPath        = await this.awsService.awsBucketURL();
  const site          = this.siteService.getAssignedSite()
  this.rowSelection   = 'multiple'
};

initClasses()  {
  const platForm      = this.platForm;
  this.gridDimensions =  'width: 100%; height: 100%;'
  this.agtheme  = 'ag-theme-material';
  if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
  if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
}

async initForm() {
  this.searchForm   = this.fb.group( {
    itemName          : [''],
  });
}

ngAfterViewInit() {
  if (this.input) {
    console.log('ngAfterViewInit refreshInputHook')
    fromEvent(this.input.nativeElement,'keyup')
    .pipe(
      filter(Boolean),
      debounceTime(500),
      distinctUntilChanged(),
      tap((event:KeyboardEvent) => {
        const search  = this.input.nativeElement.value
        this.refreshSearch();
      })
    )
    .subscribe();
  }
}

buttoncellrender(params: any) {

  this.buttonVisible = true;
  if (isNaN(params) != true)  {
    this.buttonVisible = false
  }

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

  // cellRenderer: this.agGridService.currencyCellRendererUSD,

  this.columnDefs =  [
    {
    field: 'id',
    cellRenderer: "btnCellRenderer",
                   cellRendererParams: {
                      cellRenderer: this.buttoncellrender,
                      onClick: this.editProductFromGrid.bind(this),
                      getLabelFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 125,
                    maxWidth: 125,
                    flex: 2,
    },
    {headerName: 'Name',     field: 'name',         sortable: true,
                  width   : 275,
                  minWidth: 175,
                  maxWidth: 275,
                  flex    : 1,
    },
  ]
  this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
}

listAll(){
  const control = this.itemName
  control.setValue('')
  this.refreshSearch()
}

  //initialize filter each time before getting data.
  //the filter fields are stored as variables not as an object since forms
  //and other things are required per grid.
initSearchModel(): MenuSubPromptSearchModel {
    let searchModel        = {} as MenuSubPromptSearchModel;
    let search                    = ''
    if (this.itemName.value)            { searchModel.name        = this.itemName.value  }
    searchModel.pageSize   = this.pageSize
    searchModel.pageNumber = this.currentPage
    return searchModel
  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(): Observable<IPromptSubResults[]> {
    this.currentPage         = 1
    const site               = this.siteService.getAssignedSite()
    const productSearchModel = this.initSearchModel();
    this.params.startRow     = 1;
    this.params.endRow       = this.pageSize;
    this.onGridReady(this.params)
    return this._searchItems$
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
  getRowData(params, startRow: number, endRow: number):  Observable<IPromptResults>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.promptService.searchMenuPrompts(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    // if (!params) { return }
    if (params == undefined) { return }

    if (!params.startRow ||  !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            const resp         =  data.paging
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount

            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }

            let results        =  this.refreshImages(data.results)
            params.successCallback(results)

          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);

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

  //search method for debounce on form field
  displayFn(search) {
    this.selectItem(search)
    console.log('displayFn', search)
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
    this.getItemHistory(this.id)
  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.promptService.getPrompt(site, this.id).subscribe(data => {
         this.prompt = data;
        }
      )
    }
  }

  async getItemHistory(id: any) {
    const site = this.siteService.getAssignedSite();
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

  onBtnClick1(e) {
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  editProductFromGrid(e) {
    if (e.rowData.id)  {
      this.editItemWithId(e.rowData.id);
    }
  }

  editItemWithId(id:number) {
    const dialog =   this.productEditButtonService.openPromptEditor(id);
    dialog.afterClosed(data => {
      this.refreshSearch()
    })
  }

  editProduct(e){
    this.editItemWithId(e.id)
  }

  editSelectedItems() {
    if (!this.selected) {
      this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
      return
    }
    this.productEditButtonService.editTypes(this.selected)
  }

  onSortByNameAndPrice(sort: string) { }

  addNew()  {
    this.editItemWithId(0)
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

}

