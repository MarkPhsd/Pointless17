import { Component, OnInit,} from '@angular/core';
import { AWSBucketService,  MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable,  of, switchMap } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams, GridApi } from 'ag-grid-community';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { Capacitor,  } from '@capacitor/core';
import { Subscription } from 'rxjs';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { BrandClassSearch, BrandClassSearchResults, BrandsResaleService, Brands_Resale } from 'src/app/_services/resale/brands-resale.service';
import { Router } from '@angular/router';
import { IProduct, IUserProfile } from 'src/app/_interfaces';

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
  urlPath$: Observable<any>;
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

        console.log('refresh search mode', data)

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

        if (!data.name) {
          this.brand_Resale = null;
        }
      }
    )

  }

  constructor(
    private fb                     : UntypedFormBuilder,
    private siteService            : SitesService,
    private productEditButtonService: ProductEditButtonService,
    private agGridFormatingService : AgGridFormatingService,
    private awsService             : AWSBucketService,
    private router                 : Router,
    private brandsResaleService    : BrandsResaleService,
    private menuService            : MenuService,
  )
{  }

  ngOnInit(): void {
    this.urlPath$  =  this.awsService.awsBucketURLOBS().pipe(
      switchMap(data => {
        this.urlPath = data;
        this.refreshDepartments()
        this.initSubscriptions();
        this.initAgGrid(this.pageSize);
        this.initPaging();
        return of(data)
      }
    ))
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
    // this.refreshDepartments();
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

      let header = {headerName: 'ID'
            ,  field: 'id',
            minWidth: 0,
            maxWidth: 9,
            hide: true,
            flex: 1,
      }
    this.columnDefs.push(header)

      let image =   { headerName: '',
            field: 'thumbnail',
            width: 75,
            minWidth: 75,
            maxWidth: 75,
            sortable: false,
            autoHeight: true,
            comparator: myComparator,
            cellRenderer: AgGridImageFormatterComponent
    }
    this.columnDefs.push(image)

    this.columnDefs.push(this.getValueField('name', 'Name', null, true,));
    this.columnDefs.push(this.getValueField('brandID_Barcode', 'Prefix', 150, true,));
    this.columnDefs.push(this.getValueField('gender', 'Gender', null, false,));

    this.brandsResaleService.lClassFieldData.forEach(data => {
      this.columnDefs.push(this.getValueField(data.name.toLowerCase()));
    })

    this.columnDefs.push(this.getValueField('images',null, null, null, true))
    this.columnDefs.push(this.getValueField('thumbNail',null, null, null, true))

    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs, false);
  }

  getValueField(name: string, header? : string, width?: number, disabled?: boolean, hide?: boolean) {
    if (!header) {
      header = name
    }
    if (!width) {
      width = 125
    }
    let edit = true;
    if (disabled) {
      edit = false
    }
    let visible = true;
    if (hide) {
      visible = false
    }
    return   {headerName: header.toUpperCase(),    field: name,
        sortable: true,
        width: 76,
        minWidth:width,
        hide: !visible,
        editable: edit,
        singleClickEdit: edit,
        comparator: myComparator,
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
    console.log('refreshsearch')
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
            // console.log('onGridReady',this.currentPage)
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            let results        =  this.refreshImages(data.results)
            params.successCallback( results )
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

  refreshImages(data) {
    const urlPath = this.urlPath
    if (urlPath) {
      data.forEach( item =>
        {
          if (item.thumbnail) {
            const list = item.thumbnail.split(',')
            if (list[0]) {
              item.thumbnail = `${urlPath}${list[0]}`
            }
          }
        }
      )
    }


    //   item.active = !event.value
    //   this.action$ = this.updateValues(event.data.id, !event.value, 'active');
    //   event.value = !event.value;
    //   this.refreshGrid()
    return data;
  }


  cellValueChanged(event) {

    let item = event?.data as Brands_Resale;
    const site = this.siteService.getAssignedSite()
    const action$ = this.brandsResaleService.put(site, item)
    const deptName = event?.colDef?.field;

    this.action$ =  this.brandsResaleService.get(site, item.id).pipe(switchMap(data => {
      item.images    = data.images;
      item.thumbnail = data.thumbnail;
      return action$
    })).pipe(
        switchMap( data => {
          const item$ = this.menuService.updateBrandClassValue( site, event.value, item.id, item.gender, deptName )
          return item$
        }
      )
    )
  }

  onCellClicked(event) {

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
    this.brand_Resale = selectedRows[0].data;
    console.log(this.id)
    this.getItem(this.id)
  }

  getItem(id: number) {
    if (id) {
      console.log('id',id)
      this.brand_Resale = null;
      const site = this.siteService.getAssignedSite();
      this.brandResale$  = this.brandsResaleService.get(site, this.id).pipe(
        switchMap(data => {
          this.brand_Resale = data as Brands_Resale;
          return of(data)
        })
      )
    }
  }

  updateBrand() {
    if (this.brand_Resale) {
      //foreach item in the columns
      //send the department name
      // this.brandsResaleService.lClassFieldData.filter(data => return data.name === )
    }
  }

  refresh(event){
    this.brandsResaleService.updateSearchModel( this.searchModel )
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
    this.productEditButtonService.openProductDialogObs(id).subscribe(
        data => {
        return of(data)
    })

  }

  nav() {
    this.router.navigate(['/resale-price-classes'])
  }

}
