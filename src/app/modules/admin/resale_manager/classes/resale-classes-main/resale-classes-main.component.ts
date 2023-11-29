import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, FormGroup, UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { GridApi, IGetRowsParams } from 'ag-grid-community';
import { Observable, Subscription, switchMap, of, debounceTime, distinctUntilChanged } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IProduct, IUserProfile } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ClassClothingSearch, Classes_Clothing, ClassesResaleService, ClassResaleSearchResults } from 'src/app/_services/resale/classes-resale.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ButtonRendererComponent } from '../../../report-designer/widgets/button-renderer/button-renderer.component';

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
  selector: 'app-resale-classes-main',
  templateUrl: './resale-classes-main.component.html',
  styleUrls: ['./resale-classes-main.component.scss']
})
export class ResaleClassesMainComponent implements OnInit {

  buttonName = 'edit'
  get platForm()         {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }
  copy$: Observable<any>;
  searchModel        = {} as ClassClothingSearch;
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
  classResale$: Observable<Classes_Clothing>;
  class_Resale:  Classes_Clothing;
  class$: Observable<Classes_Clothing>;
  departmentID: number;
  brandID: number;

  searchForm: FormGroup;
  pagingForm: FormGroup;
  pageNumber: number;

  _search$: Subscription;
  advanced : boolean = true;
  sortList: boolean  = false;
  department: string;
  parent = 'class'

  // .pipe(
  //   debounceTime(250),
  //     distinctUntilChanged(),
  //     switchMap(data => {
  //       console.log('updata', data)
  //       return of(data)
  //   }))
  initSubscriptions() {
    this._search$ = this.classResaleService.search$
      .subscribe(data => {

        if (!data) { return }
        if (data.pageNumber) {
          this.currentPage  = 1;
          data.pageNumber = 1;
        }

        this.searchModel = data;

        if (data.pageNumber) {
          this.onGridReady(this.params)
        } else {
          this.currentPage += 1
          this.onGridReady(this.params)
        }
    })
  }

  constructor(
    private agGridService          : AgGridService,
    private fb                     : UntypedFormBuilder,
    private siteService            : SitesService,
    private productEditButtonService: ProductEditButtonService,
    private agGridFormatingService : AgGridFormatingService,
    private awsService             : AWSBucketService,
    private dialog                 : MatDialog,
    private router                 : Router,
    private classResaleService     : ClassesResaleService,
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

    this.pagingForm.valueChanges.pipe(
      debounceTime(250),
        distinctUntilChanged(),
        switchMap(data => {
          return of(data)
      }))
      .subscribe(data => {
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

  // results$ = this.searchPhrase.pipe(
  //   debounceTime(250),
  //   distinctUntilChanged(),
  //   switchMap(searchPhrase => {
  //     this.searchModel = {} as SearchModel;
  //     console.log('searchPhrase', searchPhrase, this.searchModel)
  //     this.searchModel.name = searchPhrase;
  //     return this.menuService.getUnitTypesSearch(this.site,  this.searchModel).pipe(switchMap(data => {
  //       return of(data.results)
  //     }))
  //    }
  //   )
  // )

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
    }
    this.columnDefs.push(header)
    this.columnDefs.push(this.getValueField('attributeDesc','Attribute',   125, false));
    this.columnDefs.push(this.getValueField('department', 'Department',  125, false));
    this.columnDefs.push(this.getValueField('classValue', 'Value' , 125, true));
    this.columnDefs.push(this.getValueField('gender', 'Gender',  125, true),);
    // this.columnDefs.push(this.getValueField('price', 'Price'));

    let price = {headerName: 'Price',   field: 'price',
          cellRenderer: this.agGridService.currencyCellRendererUSD,
          width: 100,
          minWidth: 100,
          maxWidth: 125,
          editable: true,
          comparator: myComparator,
          singleClickEdit: true,
    }
    this.columnDefs.push(price)

    this.columnDefs.push(this.getValueField('departmentID', 'Barcode Part'));
    // this.columnDefs.push(this.getValueField('brandID_Barcode', 'Prefix', 150));

    // id: number;
    // brandType: string;
    // classValue?: number | null;
    // attributeDesc: string;
    // gender?: number | null;
    // name: string;
    // price?: number | null;
    // classID_Barcode?: number | null;
    // brandTypeID: number;
    // this.gridOptions = this.agGridFormatingService.initGridOptionsFormated(pageSize, this.columnDefs);
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs, false);
  }

  getValueField(name: string, header? : string, width?: number, editable?: boolean) {
    if (!header) {
      header = name
    }
    if (!width) {
      width = 125
    }
    if (!editable) {
      editable = false
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

  initSearchModel(): ClassClothingSearch {
    // console.log('initSearchModel')
    if (!this.searchModel) {
      this.searchModel        = {} as ClassClothingSearch;
    }
    this.searchModel.name        = null;
    this.searchModel.classValue  = null;
    this.departmentID            = null
    this.department             = null
    // this.searchModel.brandTypeID = null;
    this.searchModel.pageSize    = this.pageSize
    this.searchModel.pageNumber  = this.currentPage
    return this.searchModel;
  }

  getSearchModel(){
    // console.log('getSearchModel', this.searchModel)
    if (!this.searchModel) {    return this.initSearchModel()  }
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
    console.log('set current Page', this.searchModel.pageNumber, this.currentPage)
    return this.currentPage
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<ClassResaleSearchResults>  {
    this.currentPage     = this.setCurrentPage(startRow, endRow)
    if (this.searchModel) {
      this.searchModel.pageNumber =  this.currentPage // this.gridApi.paginationGetCurrentPage() ;
    }
    const site           = this.siteService.getAssignedSite()
    // console.log('get Row Data', this.searchModel.pageNumber, this.currentPage)
    // console.log('api page', this.gridApi.paginationGetCurrentPage() )

    return this.classResaleService.searchView(site, this.searchModel)
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
            // console.log('onGridReady',this.currentPage)
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
      this.class$  = this.classResaleService.get(site, this.id).pipe(
        switchMap(data => {
          this.class_Resale = data
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
    this.router.navigate(['/resale-brand-classes'])
  }

}
