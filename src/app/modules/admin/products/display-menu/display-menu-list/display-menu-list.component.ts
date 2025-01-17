import { Component,  Inject,  Input, Output, OnInit, Optional,
         ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { AWSBucketService} from 'src/app/_services';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { IPromptSubResults, MenuSubPromptSearchModel } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { IPromptResults, MenuPromptSearchModel, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { IDisplayMenu, IDisplayMenuSearchResults } from 'src/app/_interfaces/menu/price-schedule';
import { Capacitor } from '@capacitor/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { AgGridModule } from 'ag-grid-angular';
import { PromptInfoPanelComponent } from '../../../menuPrompt/prompt-groups/prompt-info-panel/prompt-info-panel.component';
import { DisplayMenuSortComponent } from '../display-menu-sort/display-menu-sort.component';

@Component({
  selector: 'admin-display-menu-list',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    AgGridModule,PromptInfoPanelComponent,DisplayMenuSortComponent,
  SharedPipesModule],
  templateUrl: './display-menu-list.component.html',
  styleUrls: ['./display-menu-list.component.scss']
})
export class AdminDisplayMenuListComponent implements OnInit {

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchModel: MenuPromptSearchModel;

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();
  buttonName: string;
  gridDimensions = "height: 90%; min-height:600px"
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

  //search form filters
  searchForm:        UntypedFormGroup;
  inputForm        : UntypedFormGroup;
  buttonVisible   : boolean;
  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';

  urlPath:        string;
  value               : any;
  id                  : number;
  displayMenu         : IDisplayMenu;

  constructor( private siteService           : SitesService,
              private fb                     : UntypedFormBuilder,
              private _snackBar              : MatSnackBar,
              private agGridService          : AgGridService,
              private agGridFormatingService : AgGridFormatingService,
              private displayMenuService     : DisplayMenuService,
              private awsService             : AWSBucketService,
              private productEditButtonService: ProductEditButtonService,
              private router: Router,
              private priceScheduleService: PriceScheduleService,) { }

   ngOnInit() {
     this.initClasses();
     this.initForm();
    const site          = this.siteService.getAssignedSite()
    this.rowSelection   = 'multiple';
    this.buttonName = 'edit'
    this.initAgGrid(50);
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
      itemName          : [''],
    });
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
      sortable: false,
    };

    // cellRenderer: this.agGridService.currencyCellRendererUSD,
    this.columnDefs =  [
      // {
      // field: 'id',
      // cellRenderer: "btnCellRenderer",
      //                 cellRendererParams: {
      //                   cellRenderer: this.buttoncellrender,
      //                   onClick: this.editProductFromGrid.bind(this),
      //                   getLabelFunction: this.getLabel.bind(this),
      //                   btnClass: 'btn btn-primary btn-sm'
      //                 },
      //                 minWidth: 125,
      //                 maxWidth: 125,
      //                 flex: 2,
      // },

      {   headerName: '',
          field: 'id',
          cellRenderer: "btnCellRenderer",
                  cellRendererParams: {
                    onClick: this.editProductFromGrid.bind(this),
                    label: this.buttonName,
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

    this.gridOptions = this.agGridFormatingService.initGridOptions( 25, this.columnDefs, false );
    return this.columnDefs;

  }

  navPriceScheduleGroups() {
    this.router.navigate(['/price-schedule'])
  }
  listAll(){
    const control = this.itemName
    control.setValue('')
    this.refreshSearch()
  }

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

     //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<IDisplayMenuSearchResults>  {
    this.currentPage          = this.setCurrentPage(startRow, endRow)
    const search  = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.displayMenuService.searchMenuPrompts(site, search.name)
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
            // console.log('data', data)
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
        this.displayMenuService.getMenu(site, this.id).subscribe(data => {
           this.displayMenu = data;
          }
        )
      }
    }

    onExportToCsv() {
      this.gridApi.exportDataAsCsv();
    }

    getLabel(rowData)
    {
      if(rowData && rowData.hasIndicator) {
        return this.buttonName
      } else return this.buttonName
    }


    onBtnClick1(e) {
      this.rowDataClicked1 = e.rowData;
    }

    onBtnClick2(e) {
      this.rowDataClicked2 = e.rowData;
    }

    editProductFromGrid(e) {
      if (e.rowData.id)  {
        this.editItem(e.rowData);
      }
    }

    editItem(data) {
      const dialog =   this.productEditButtonService.openDisplayMenuEditor(data);
      dialog.afterClosed(data => {
        this.listAll()
      })
    }

    addNew()  {
      const dialog =  this.productEditButtonService.openDisplayMenuEditor(null);
      dialog.afterClosed(data => {
        console.log('added')
        this.listAll()
      })
    }

    editSelectedItems() {
      if (!this.selected) {
        this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
        return
      }
      this.productEditButtonService.editTypes(this.selected)
    }

    onSortByNameAndPrice(sort: string) { }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
      });
    }

}
