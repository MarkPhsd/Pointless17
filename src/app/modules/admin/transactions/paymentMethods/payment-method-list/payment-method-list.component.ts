
import { Component,  Inject,  Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';

@Component({
  selector: 'app-payment-method-list',
  templateUrl: './payment-method-list.component.html',
  styleUrls: ['./payment-method-list.component.scss']
})
export class PaymentMethodListComponent implements OnInit {

  paymentMethod$        : Observable<IPaymentMethod[]>;
  paymentMethod         : IPaymentMethod;

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  searchPhrase:         Subject<any> = new Subject();
  product               : IPaymentMethod;
  id                    : number;

  get searchItemsValue() { return this.searchForm.get("searchItems") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  //search with debounce
  // paymentMethods              : Subject<IPaymentMethod[]> = new Subject();
  _paymentMethod$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  get PaginationPageSize(): number {
    return this.pageSize;
  }

  get gridAPI(): GridApi {
    return this.gridApi;
  }

  //AgGrid
  params               : any;
  private gridApi      : GridApi;
  private gridColumnApi: GridAlignColumnsDirective;
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

  //AgGrid
  //This is for the filter Section/
  searchForm      : FormGroup;
  inputForm       : FormGroup;
  selected        : any[];
  selectedRows    : any;
  agtheme         = 'ag-theme-material';
  urlPath:        string;

  constructor(
            private paymentMethodService      : PaymentMethodsService,
            private _snackBar               : MatSnackBar,
            private fb                      : FormBuilder,
            private siteService             : SitesService,
            private productEditButtonService: ProductEditButtonService,
            private agGridFormatingService  : AgGridFormatingService,
            private awsService              : AWSBucketService,
            private router                  : Router,
  ) { }

  async ngOnInit() {
    const site          = this.siteService.getAssignedSite();
    this.rowSelection   = 'multiple'
    this.urlPath          = await this.awsService.awsBucketURL();
    this.paymentMethod$   = this.paymentMethodService.getList(site);
    this.initForm();
    this.initAgGrid(this.pageSize);
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      searchItems    : [''],
    });
  }

  ngAfterViewInit() {
    if (this.input) {
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

    //ag-grid
    //standard formating for ag-grid.
    //requires addjustment of column defs, other sections can be left the same.
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
                        onClick: this.editProductFromGrid.bind(this),
                        label: 'Edit',
                        getLabelFunction: this.getLabel.bind(this),
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
      ]

      }

    listAll(){
      this.refreshSearch()
    }

    //initialize filter each time before getting data.
    //the filter fields are stored as variables not as an object since forms
    //and other things are required per grid.
    initSearchModel(): IPaymentMethod {
      let searchModel         = {} as IPaymentMethod;
      // let search              = ''
      searchModel.name        = this.searchItemsValue.value
      // productSearchModel.pageSize   = this.pageSize
      // productSearchModel.pageNumber = this.currentPage
      return searchModel
    }

    //this is called from subject rxjs obversablve above constructor.
    refreshSearch(): Observable<IPaymentMethod[]> {
      this.currentPage         = 1
      const site               = this.siteService.getAssignedSite()
      const searchModel        = this.initSearchModel();
      this.params.startRow     = 1;
      this.params.endRow       = this.pageSize;
      this.onGridReady(this.params)
      return this._paymentMethod$
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
    getRowData(params, startRow: number, endRow: number):  Observable<IPaymentMethod[]>  {
      this.currentPage  = this.setCurrentPage(startRow, endRow)
      const name        = this.searchItemsValue.value
      const site        = this.siteService.getAssignedSite()
      return this.paymentMethodService.getListByName(site, name)
    }

    //ag-grid standard method
    async onGridReady(params: any) {

      if (params)  {
        this.params         = params
        this.gridApi        = params.api;
        this.gridColumnApi  = params.columnApi;
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

      this.selected = selected
      this.id = selectedRows[0].id;
    }

    getItem(id: number) {
      if (id) {
        const site = this.siteService.getAssignedSite();
        this.paymentMethodService.getPaymentMethod(site, this.id).subscribe(data => {
           this.paymentMethod = data;
          }
        )
      }
    }

    onDeselectAll() { }

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
        // this.router.navigate(['client-type-edit', {id: e.rowData.id}])
        this.productEditButtonService.openPaymentMethodEditor(e.rowData.id)
      }
    }
    addNew() {
      this.productEditButtonService.openPaymentMethodEditor(0)
    }

    onSortByNameAndPrice(sort: string) { }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
      });
    }

  }
