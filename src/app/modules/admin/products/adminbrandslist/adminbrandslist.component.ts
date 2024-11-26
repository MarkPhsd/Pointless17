import { Component, ViewChild,   AfterViewInit, OnInit,Output, Input, EventEmitter, ElementRef } from '@angular/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { ClientSearchModel, ClientSearchResults, Item,  IUserProfile, }  from 'src/app/_interfaces';
import { fromEvent, Observable, Subject  } from 'rxjs';
import { Router } from '@angular/router';
import { AWSBucketService, ContactsService } from 'src/app/_services';
import { MatSort } from '@angular/material/sort';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { IPagedList } from 'src/app/_services/system/paging.service';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
// import { AgGridService } from 'src/app/_services/system/ag-grid-service';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { IClientTable }   from  'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-adminbrandslist',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
      AgGridModule,
  SharedPipesModule],
  templateUrl: './adminbrandslist.component.html',
  styleUrls: ['./adminbrandslist.component.scss']
})
export class AdminbrandslistComponent implements OnInit, AfterViewInit {

  @Input() notifier: Subject<boolean>
//search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchPhrase:         Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("name") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  // //search with debounce
  searchItems$              : Subject<ClientSearchResults> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch()
    )
  )

  searchForm: UntypedFormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource              : any;
  bucketName              : string;
  length                  : number;
  pageSize                 = 100;
  pageSizeOptions         : any;
  product                 : IUserProfile;
  currentRecordSource     : any[];

  expandedElement: IUserProfile | null;

  clientSearchModel       = {} as ClientSearchModel;
  endOfRecords            = false;
  loading                 = false;
  appName                 = ''
  isApp                   = false;
  value                   : any;
  clientSearchResults$    : Observable<ClientSearchResults>;
  itemsPerPage            : number;
  totalRecords            : number;
  pagingInfo              : IPagedList;

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
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             : boolean;
  islastpage              : boolean;
  clientTypeID:         number;
  urlPath             : string;
  selected            : number[];
  selectedRows        : any;
  agtheme             = 'ag-theme-material';
  gridDimensions
  id                  : any;
  userProfile         : IUserProfile;
  message             : string;

  item: Item; //for routing
  constructor(private contactService: ContactsService,
              private router: Router,
              private awsBucket: AWSBucketService,
              private siteService            : SitesService,
              private clientTableService     : ClientTableService,
              private clientTypeService      : ClientTypeService,
              private awsService             : AWSBucketService,
              private agGridFormatingService : AgGridFormatingService,
              private _snackBar              : MatSnackBar,
              private fb                     : UntypedFormBuilder,
             ) {

  }

    async ngOnInit() {
      const site          = this.siteService.getAssignedSite()
      this.bucketName     = await this.awsBucket.awsBucket()
      this.urlPath        = await this.awsService.awsBucketURL();

      const searchModel        = {} as ClientSearchModel;
      searchModel.pageNumber   = 1
      searchModel.pageSize     = 25;
      this.clientSearchModel   = searchModel;

      this.initForm();
      this.initAgGrid(this.pageSize);
      this.initClasses()
      this.rowSelection   = 'multiple'

    };

    editItem(id:number) {
      this.router.navigate(["/adminbranditem/", {id:id}]);
    }

     deleteItem(id: number) {
      if (!id) {return}
       this.clientTableService.delete(this.siteService.getAssignedSite(), id).subscribe(data => {

       })
    }

    async deleteSelectedItems(id) {
      await this.deleteItem(id)
    }

    add() {
      const site = this.siteService.getAssignedSite();
      //this.selected
      const clientType$ = this.clientTypeService.getClientTypeByName(site, 'brand')
      const client      = {} as IClientTable;

      clientType$.pipe(
        switchMap(clientType => {
          client.clientTypeID = clientType.id;
          return this.clientTableService.postClient(site, client)
      })).subscribe(newClient => {
        this.editItemWithId(newClient.id);
      })

    }

    deleteSelected() {
      if (!this.selected) { return}
      this.message = 'Deleting, this may take a while'
      this.clientTableService.deleteList(this.siteService.getAssignedSite(), this.selected).subscribe(data => {
        this.refreshSearch();
        this.message = '';
      })
    }

    initClasses()  {
      this.gridDimensions =  'width: 100%; height: 75vh;'
      this.agtheme  = 'ag-theme-material';
    }

    async initForm() {
      this.searchForm   = this.fb.group( {
        name          : [''],
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
            console.log('ngAfterViewInit', this.input.nativeElement.value)
            const search  = this.input.nativeElement.value
            this.refreshSearch();
          })
        )
        .subscribe();
      }
    }

    editClientFromGrid(e) {
      if (e.rowData.id)  {
       this.editItemWithId(e.rowData.id);
      }
    }

    editItemWithId(id: number) {
      this.router.navigate(["/adminbranditem/", {id: id}]);
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
        field: "id",
        cellRenderer: "btnCellRenderer",
                      cellRendererParams: {
                          onClick: this.editClientFromGrid.bind(this),
                          label: 'Edit',
                          getLabelFunction: this.getLabel.bind(this),
                          btnClass: 'btn btn-primary btn-sm'
                        },
                        minWidth: 125,
                        maxWidth: 125,
                        flex: 2,
        },
        {headerName: 'Name',     field: 'company',         sortable: true,
                    width   : 275,
                    minWidth: 175,
                    maxWidth: 275,
                    flex    : 1,
        },
        {headerName: 'Account',  field: 'accountNumber',      sortable: true,
                    width: 75,
                    minWidth: 125,
                    maxWidth: 150,
                    // flex: 1,
        },
        { headerName: 'Image',
                    field: 'onlineDescriptionImage',
                    width: 100,
                    minWidth: 100,
                    maxWidth: 100,
                    sortable: false,
                    autoHeight: true,
                    cellRendererFramework: AgGridImageFormatterComponent
        }
      ]

      this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
    }

    listAll(){
      // const control = this.itemName
      // control.setValue('')
      this.refreshSearch()
    }

      //initialize filter each time before getting data.
      //the filter fields are stored as variables not as an object since forms
      //and other things are required per grid.
    initSearchModel(): ClientSearchModel {

        let searchModel        = {} as ClientSearchModel;
        let search                   = this.itemName.value
        searchModel.pageSize   = this.pageSize
        searchModel.pageNumber = 1
        searchModel.clientTypeID = this.clientTypeID;
        searchModel.name       = search;
        return searchModel
    }

    //this is called from subject rxjs obversablve above constructor.
    refreshSearch(): Observable<ClientSearchResults> {
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

    //ag-grid standard method.
    getDataSource(params) {
      return {
      getRows: (params: IGetRowsParams) => {
        const items$ = this.getRowData(params, params.startRow, params.endRow)
        items$.subscribe(data =>
          {
              console.log('data',data)
              if (data) {
                const resp =  data.paging
                if (!resp) {
                  console.log('no data result')
                  return
                }
                this.isfirstpage   = resp.isFirstPage
                this.islastpage    = resp.isFirstPage
                this.currentPage   = resp.currentPage
                this.numberOfPages = resp.pageCount
                this.recordCount   = resp.recordCount
                if (data.results) {
                  params.successCallback(data.results)
                  this.rowData = data.results
                }
              }
            }, err => {
              console.log(err)
            }
        );
        }
      };
    }

    //ag-grid standard method
    getRowData(params, startRow: number, endRow: number):  Observable<ClientSearchResults>  {
      this.currentPage          = this.setCurrentPage(startRow, endRow)
      const searchModel         = this.initSearchModel();
      const site                = this.siteService.getAssignedSite()
      return this.contactService.getLiveBrands(site, searchModel)
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
            // console.log('data',data)
            if (data) {
              const resp =  data.paging
              if (!resp) {
                // console.log('no data result')
                return
              }
              this.isfirstpage   = resp.isFirstPage
              this.islastpage    = resp.isFirstPage
              this.currentPage   = resp.currentPage
              this.numberOfPages = resp.pageCount
              this.recordCount   = resp.recordCount
              let results        =  this.refreshImages(data.results)

              params.successCallback(data.results)
            }
          }, err => {
            console.log(err)
          }
          );
        }
      };

      if (!datasource)   { return }
      if (!this.gridApi) { return }
      console.log("grid api reload")
      this.gridApi.setDatasource(datasource);
    }

    refreshImages(data) {
      const urlPath = this.urlPath
      if (urlPath) {
        data.forEach( item =>
          {
            if (item.onlineDescriptionImage) {
              const list = item.onlineDescriptionImage.split(',')
              if (list[0]) {
                item.onlineDescriptionImage = `${urlPath}${list[0]}`
              }
            }
          }
        )
      }
      return data;
    }

    getImageURL(fileName: string): any {
      if(fileName) {
        let images = fileName.split(",")
        if (images)
          {
            console.log(this.awsBucket.getImageURLPath(this.bucketName, images[0]))
            return this.awsBucket.getImageURLPath(this.bucketName, images[0])
          }
      }
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
        this.contactService.getContact(site, this.id).subscribe(data => {
           this.userProfile = data;
          }
        )
      }
    }

    async getItemHistory(id: any) {
      const site = this.siteService.getAssignedSite();
      // if (id) {

      //   this.inventoryAssignmentService.getInventoryAssignment(site, id ).subscribe(data =>{
      //     this.inventoryAssignment = data;
      //   })

      //   const history$ = this.inventoryAssignmentService.getInventoryAssignmentHistory(site, id)
      //   history$.subscribe(data=>{
      //     this.inventoryAssignmentHistory = data
      //   })
      // }
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


    editSelectedItems() {

      if (!this.selected) {
        this._snackBar.open('No items selected. Use Shift + Click or Ctrl + Cick to choose multiple items.', 'oops!', {duration: 2000})
        return
      }
        // this.productEditButtonService.editTypes(this.selected)
    }

    onSortByNameAndPrice(sort: string) { }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
      });
    }


}
