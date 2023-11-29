import { Component,   Input, Output, OnInit,
  EventEmitter,
  HostListener,
  OnDestroy} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService, ContactsService, MenuService } from 'src/app/_services';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemBasicB, IProductSearchResultsPaged } from 'src/app/_services/menu/menu.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormGroup, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Observable, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams, GridApi } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { ClientSearchModel, IProduct, IUserProfile } from 'src/app/_interfaces';
import { Capacitor,  } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { PromptSubGroupsService } from 'src/app/_services/menuPrompt/prompt-sub-groups.service';
import { PromptSubGroups } from 'src/app/_interfaces/menu/prompt-groups';
import { MatDialog } from '@angular/material/dialog';
import { BrandClassSearch, BrandClassSearchResults, BrandsResaleService, Brands_Resale } from 'src/app/_services/resale/brands-resale.service';
import { Router } from '@angular/router';

function myComparator(value1, value2) {
  if (value1 === null && value2 === null) {
    return 0;
  }
  if (value1 === null) {
    return -1;
  }
  if (value2 === null) {
    return 1;
  }
  return value1 - value2;
}

@Component({
  selector: 'brand-editor-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class BrandEditorMainComponent implements OnInit {

  buttonName = 'edit'
  get platForm()         {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }
  copy$: Observable<any>;
  searchModel        = {} as BrandClassSearch;
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
  pageSize                = 50
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             : boolean;
  islastpage              : boolean;
  gridlist = "grid-list"
  hideAdd : boolean;
  action$         : Observable<any>;
  inputForm        : UntypedFormGroup;
  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  gridDimensions  = "height: calc(82vh )"
  urlPath:        string;
  value           : any;
  id              : number;
  product         : IProduct;
  smallDevice: boolean;
  listHeight : string;

  departments$: Observable<IMenuItem[]>;
  brandList$ : Observable<IUserProfile>;
  brandResale$: Observable<Brands_Resale>;
  brand_Resale:  Brands_Resale;

  departmentID: number;
  brandID: number;

  searchForm: FormGroup;
  pagingForm: FormGroup;
  pageNumber: number;

  _search$: Subscription;
  advanced : boolean = true;
  sortList: boolean  = false;

  // .pipe(
  //   debounceTime(250),
  //     distinctUntilChanged(),
  //     switchMap(data => {
  //       console.log('brandSearch', data)
  //       return of(data)
  //   }))
  initSubscriptions() {
    this._search$ = this.brandsResaleService.search$
      .subscribe(data => {
        if (!data) { return }

        if (data.pageNumber) {
          this.currentPage  = 1;
          data.pageNumber = 1;
        }

        this.searchModel = data;

        console.log('brandSearch 2', data)

        if (data.pageNumber) {
          this.onGridReady(this.params)
        } else {
          this.currentPage += 1
          this.onGridReady(this.params)
        }
      }
    )

  }

  constructor(
    private agGridService          : AgGridService,
    private fb                     : UntypedFormBuilder,
    private siteService            : SitesService,
    private productEditButtonService: ProductEditButtonService,
    private agGridFormatingService : AgGridFormatingService,
    private awsService             : AWSBucketService,
    private dialog: MatDialog,
    private router: Router,
    private brandsResaleService: BrandsResaleService,
    private menuService            : MenuService,
  )
{  }

  ngOnInit(): void {

    this.refreshDepartments()
    this.initSubscriptions();
    this.initAgGrid(this.pageSize);
    this.initPaging();
  }

  initPaging() {
    this.pagingForm = this.fb.group({
      pageSize  : [],
      pageNumber: [],
      sort      : []
    })
    this.pagingForm.patchValue(this.initSearchModel());
    this.pagingForm.valueChanges.subscribe(data => {
      if (data) {
        const page =  this.pagingForm.controls['pageNumber'].value;
        const pageSize =   this.pagingForm.controls['pageSize'].value;
        let refreshGridOn = false

        if (this.currentPage != page) { refreshGridOn = true  }
        if (this.currentPage != page) { refreshGridOn = true }

        if (refreshGridOn) {
          this.pageSize  = pageSize
          this.currentPage = page
          this.gridOptions = this.agGridFormatingService.initGridOptions(this.pageSize , this.columnDefs, false);
          this.refreshGrid()
        }
      }
    })
  }

  refreshDepartments() {
    const site          = this.siteService.getAssignedSite()
    this.departments$   = this.menuService.getListOfDepartmentsAll(site).pipe(
      switchMap(data => {
        return of(data)
      })
    )
  }

  setBrandID(event) {
    if (event && event.id) {
      this.brandID = event.id
      this.refreshSearch(1);
    }
  }

  refreshGrid() {
    this.refreshDepartments()
    this.onGridReady(this.params)
  }

  initAgGrid(pageSize: number) {
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 1,
      sortable: false,
    };

   this.columnDefs =  []

    let header = {headerName: 'ID',  field: 'id',
          // cellRenderer: "btnCellRenderer",
          // cellRendererParams: {
          //   onClick: this.editProductFromGrid.bind(this),
          //   label: this.buttonName,
          //   getLabelFunction: this.getLabel.bind(this),
          //   btnClass: 'btn btn-primary btn-sm'
          // },
          minWidth: 125,
          maxWidth: 125,
          visible: false,
          flex: 2,
    }
    this.columnDefs.push(header)
    this.columnDefs.push(this.getValueField('name'));
    this.columnDefs.push(this.getValueField('brandID_Barcode', 'Prefix', 150));
    this.columnDefs.push(this.getValueField('gender'));
    this.columnDefs.push(this.getValueField('jeans'));
    this.columnDefs.push(this.getValueField('pants'));
    this.columnDefs.push(this.getValueField('crops'));
    this.columnDefs.push(this.getValueField('shorts'));
    this.columnDefs.push(this.getValueField('skirts'));
    this.columnDefs.push(this.getValueField('shirts'));
    this.columnDefs.push(this.getValueField('tops'));
    this.columnDefs.push(this.getValueField('polos'));
    this.columnDefs.push(this.getValueField('tees'));
    this.columnDefs.push(this.getValueField('tanks'));
    this.columnDefs.push(this.getValueField('sweaters'));
    this.columnDefs.push(this.getValueField('fleece'));
    this.columnDefs.push(this.getValueField('outerwear'));
    this.columnDefs.push(this.getValueField('seasonal'));
    this.columnDefs.push(this.getValueField('dresses'));
    this.columnDefs.push(this.getValueField('bags'));
    this.columnDefs.push(this.getValueField('flips'));
    this.columnDefs.push(this.getValueField('shoes'));
    this.columnDefs.push(this.getValueField('belts'));
    this.columnDefs.push(this.getValueField('jewelry'));
    this.columnDefs.push(this.getValueField('watch'));
    this.columnDefs.push(this.getValueField('sunglasses'));
    this.columnDefs.push(this.getValueField('hats'));
    this.columnDefs.push(this.getValueField('misc'));
    // this.gridOptions = this.agGridFormatingService.initGridOptionsFormated(pageSize, this.columnDefs);
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs, false);
  }

  getValueField(name: string, header? : string, width?: number) {
    if (!header) {
      header = name
    }
    if (!width) {
      width = 125
    }
    return   {headerName: header.toUpperCase(),    field: name,
        sortable: true,
        width: 76,
        minWidth:width,
        editable: true,
        singleClickEdit: true,
        comparator: myComparator,
      // flex: 2,
    }
  }

  initSearchModel(): BrandClassSearch {
    if (!this.searchModel) {
      this.searchModel        = {} as BrandClassSearch;
    }
    this.searchModel.name = '';
    this.searchModel.classValue = 0;
    this.searchModel.brandTypeID = 0;
    this.searchModel.pageSize   = this.pageSize
    this.searchModel.pageNumber = this.currentPage
    return this.searchModel;
  }

  getSearchModel(){
    if (!this.searchModel) {
      return this.initSearchModel()
    }
    this.searchModel.pageSize   = this.pageSize
    this.searchModel.pageNumber = this.currentPage
    return this.searchModel
  }

  refreshSearch(page: number) {
    this.initAgGrid(this.pageSize)
    if (page != 0) { this.currentPage  = page}
    const productSearchModel = this.getSearchModel();
    this.onGridReady(this.params)
  }

  setSearchModel(search) {
    this.searchModel = search
  }

  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow
    this.startRow      = startRow
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.currentPage - 1 }
    if (tempStartRow < startRow) { return this.currentPage + 1 }
    // this.searchModel.pageNumber = this.currentPage;
    console.log('setCurrentPage', this.currentPage, startRow, endRow)

    return this.currentPage
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<BrandClassSearchResults>  {
    this.currentPage     = this.setCurrentPage(startRow, endRow)
    const searchModel    = this.getSearchModel();
    const site           = this.siteService.getAssignedSite()
    return this.brandsResaleService.searchView(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
      params.api.sizeColumnsToFit();
      params.api.resetRowHeights();
    }

    if (params == undefined) { return }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            const resp         =  data.paging
            if (!resp)         {return}
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount
            console.log('onGridReady',this.currentPage)
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            params.successCallback( data.results )
          }
        );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
    params.api.sizeColumnsToFit();
    params.api.resetRowHeights();
  }

  cellValueChanged(event) {

  }

  onCellClicked(event) {
    // console.log('event' , event)
    // const colName = event?.column?.colId.toString() as string;
    // if (colName === 'active') {
    //   let item = event.data
    //   item.active = !event.value
    //   this.action$ = this.updateValues(event.data.id, !event.value, 'active');
    //   event.value = !event.value;
    //   this.refreshGrid()
    //   // console.log(item)
    // this.gridAPI.setRowData(item)
  }

  // refreshImages(data) {
  //   const urlPath = this.urlPath
  //   if (urlPath) {
  //     data.forEach( item =>
  //       {
  //         if (item.urlImageMain) {
  //           const list = item.urlImageMain.split(',')
  //           if (list[0]) {
  //             item.imageName = `${urlPath}${list[0]}`
  //           }
  //         }
  //       }
  //     )
  //   }
  //   return data;
  // }

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

    this.getItem(this.id)

  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.brandResale$  = this.brandsResaleService.get(site, this.id).pipe(
        switchMap(data => {
          this.brand_Resale =data
          return of(data)
        })
      )
    }
  }

  editSelectedItem() {
    // console.log('selected Items', this.selected)
    let id = 0;
    if (this.product) { id = this.product.id}
    if (this.selected){ id = this.selected[0]};
    if (id) {
      this.editItemWithId( this.id);
      return;
    }
  }

  getItemHistory(id: any) {
    const site = this.siteService.getAssignedSite();
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
    // console.log('on button click1')
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    // console.log('on button click2')
    this.rowDataClicked2 = e.rowData;
  }

  editProductFromGrid(e) {
    if (!e) {
      // console.log('edit product from grid no data')
      return
    }
    if (e.rowData.id)  {
      if (this.buttonName === 'Edit') {
        this.editItemWithId(e.rowData.id);
       } else {

      }
    }
  }

  editItemWithId(id:number) {
    if(!id) { return }
    // this.openingProduct = true
    // console.log('edit Item With Id',id)
    // this.product$ =
    this.productEditButtonService.openProductDialogObs(id).subscribe(
      // switchMap(
        data => {
        // console.log('product', data)
        // this.openingProduct = false
        return of(data)
      })
    // )
  }

  nav() {
    this.router.navigate(['/resale-price-classes'])
  }

}
