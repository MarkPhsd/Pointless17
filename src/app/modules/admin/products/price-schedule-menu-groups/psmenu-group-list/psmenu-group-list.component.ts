import { Component, Inject, Input, Output, OnInit, Optional,
  ViewChild ,ElementRef, AfterViewInit, EventEmitter, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AWSBucketService} from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams,  GridApi } from 'ag-grid-community';
// import "ag-grid-community/dist/styles/ag-grid.css";
// import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
// import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { IPriceSchedule, IPriceSearchModel, PriceMenuGroup, PSMenuGroupPaged } from 'src/app/_interfaces/menu/price-schedule';
import { AgGridToggleComponent } from 'src/app/_components/_aggrid/ag-grid-toggle/ag-grid-toggle.component';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { PriceScheduleMenuGroupService } from 'src/app/_services/menu/price-schedule-menu-group.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

@Component({
  selector: 'psmenu-group-list',
  templateUrl: './psmenu-group-list.component.html',
  styleUrls: ['./psmenu-group-list.component.scss']
})
export class PSMenuGroupListComponent implements OnInit, AfterViewInit, OnDestroy {

  //search with debounce: also requires AfterViewInit()
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  searchPhrase               :  Subject<any> = new Subject();
  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
  private readonly onDestroy = new Subject<void>();

  //search with debounce
  searchItems$              : Subject<PriceMenuGroup[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
    debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchPhrase =>
        this.refreshSearch(searchPhrase)
    )
  )

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
  isfirstpage             : boolean;
  islastpage              : boolean;

  //This is for the filter Section//
  fieldsForm      : UntypedFormGroup;
  searchForm      : UntypedFormGroup;
  inputForm       : UntypedFormGroup;
  name            : string
  type             = '';

  selected         : any[];
  selectedRows     : any;
  agtheme           = 'ag-theme-material';
  urlPath:         string;

  // priceSchedule : IPriceSchedule;
  id            : number;

  _psMenuGroup: Subscription;
  priceMenuGroup : PriceMenuGroup;

  initSubscriptions() {
    this._psMenuGroup = this.priceScheduleMenuGroupService.priceMenuGroup$.subscribe(data => {
      this.priceMenuGroup = data;
    })
  }

  constructor(
          private _snackBar         : MatSnackBar,
          private priceScheduleMenuGroupService: PriceScheduleMenuGroupService,
          private router                  : Router,
          private fb                      : UntypedFormBuilder,
          private siteService             : SitesService,
          private awsService              : AWSBucketService,
          private productEditButtonService: ProductEditButtonService,
          private fbPriceSchedule         : FbPriceScheduleService,
        )
  {
    this.initForm();
    this.initAgGrid(this.pageSize);
  }

  async ngOnInit() {
    this.urlPath        = await this.awsService.awsBucketURL();
    const site          = this.siteService.getAssignedSite()
    this.rowSelection   = 'multiple'
  };
  
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._psMenuGroup) { this._psMenuGroup.unsubscribe()}
  }
  async initForm() {
    this.fieldsForm = this.fbPriceSchedule.initSearchForm(this.fieldsForm)
    this.searchForm = this.fb.group( { itemName: '' } );
  }

  // //ag-grid
  ngAfterViewInit() {
    fromEvent(this.input.nativeElement,'keyup')
    .pipe(
      filter(Boolean),
      debounceTime(300),
      distinctUntilChanged(),
      tap((event:KeyboardEvent) => {
        const search  = this.input.nativeElement.value
        this.refreshSearch(search);
      })
    )
    .subscribe();
  }

    //ag-grid
    //standard formating for ag-grid.
    //requires addjustment of column defs, other sections can be left the same.
  initAgGrid(pageSize: number) {

    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent,
      agGridToggleComponent: AgGridToggleComponent
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
                  onClick: this.editItemFromGrid.bind(this),
                  label: 'Edit',
                  getLabelFunction: this.getLabel.bind(this),
                  btnClass: 'mat-raised-button'
                },
                minWidth: 115,
                maxWidth: 115,
                flex: 2,
        },

        {
          headerName: "Menu Lists Groups",
          children: [
            {headerName: 'Name',          field: 'name',         sortable: true,
                        width   : 275,
                        minWidth: 175,
                        maxWidth: 275,
                        flex    : 1,
            },
          ]
        },

      ]

      this.gridOptions = {
          cacheBlockSize: 20,
          maxBlocksInCache: 50,
          rowModelType: 'infinite',
          rowSelection: 'multiple',
          pagination: true,
          paginationPageSize: pageSize,
      };
      // this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

    //and other things are required per grid.
  initSearchModel(): IPriceSearchModel {
    try {
      let searchModel        = {} as IPriceSearchModel;
      let search             = ''
      searchModel.name       = this.input.nativeElement.value
      searchModel.pageSize   = this.pageSize
      searchModel.pageNumber = this.currentPage
      console.log(searchModel)
      return searchModel

    } catch (error) {
      console.log('error', error)
      return null
    }
  }

  onToggleChange(event) {
    this.refreshSearch(this.name);
  }

  listAll() {
    const control = this.itemName
    control.setValue('')
    this.name = ''
    this.refreshSearch('')
  }

  // his is called from subject rxjs obversablve above constructor.
  refreshSearch(searchPhrase: string): Observable<PriceMenuGroup[]> {
    this.currentPage         = 1
    const site               = this.siteService.getAssignedSite()
    this.params.startRow     = 1;
    this.params.endRow       = this.pageSize;
    this.onGridReady(this.params)
    return this._searchItems$
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
  getRowData(params, startRow: number, endRow: number):  Observable<PSMenuGroupPaged>  {
    this.currentPage  = this.setCurrentPage(startRow, endRow)
    const searchModel = this.initSearchModel();
    const site        = this.siteService.getAssignedSite()
    return this.priceScheduleMenuGroupService.searchList(site, searchModel)
  }

  //ag-grid standard method
  async onGridReady(params: any) {
    if (params)  {
      this.params        = params
      this.gridApi       = params.api;
      // this.gridColumnApi = params.columnApi;
      params.api.sizeColumnsToFit();
    }

    if (params == undefined) { return }

    if (!params.startRow || !params.endRow) {
      params.startRow = 1
      params.endRow = this.pageSize;
    }

    let datasource =  {
      getRows: (params: IGetRowsParams) => {
      const items$ =  this.getRowData(params, params.startRow, params.endRow)
      items$.subscribe(data =>
        {
            if (!data) {
              console.log('resp empty' )
              return
            }

            const resp =  data.paging
            this.isfirstpage   = resp.isFirstPage
            this.islastpage    = resp.isFirstPage
            this.currentPage   = resp.currentPage
            this.numberOfPages = resp.pageCount
            this.recordCount   = resp.recordCount


            if (data.results) {
              params.successCallback(data.results)
            } else {
              console.log( 'data results is null')
            }
            console.log('resp', resp)
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
    console.log('search', search)
    this.selectItem(search)
    return search;
  }

  //search method for debounce on form field
  selectItem(search){
    if (search) {
      this.currentPage = 1
      console.log('search', search)
      this.searchPhrase.next(search)
    }
  }

  //mutli select method for selection change.
  onSelectionChanged(event) {
    try {
      let selectedRows       = this.gridApi.getSelectedRows();
      let selectedRowsString = '';
      let maxToShow          = this.pageSize;
      let selected           = []

      if (selectedRows) {
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
    } catch (error) {
      console.log('getitem', error)
    }
  }

  // : Promise<IPriceSchedule>
  async getItem(id: number) {
    // try {
    //   if (id) {
    //     const site = this.siteService.getAssignedSite();
    //     this.priceScheduleService.getPriceSchedule(site, this.id).subscribe( data =>
    //       {
    //         this.inputForm = this.fbPriceSchedule.initForm(this.inputForm)
    //         this.priceScheduleDataService.updatePriceSchedule(data)
    //         this.fbPriceSchedule.updateDiscountInfos(this.inputForm, data);
    //       }
    //     )
    //   }
    // } catch (error) {
    //   console.log('getitem', error)
    // }
  }

  async editItemFromGrid(e) {
    if (!e) { return }
    const id = e.rowData.id
    this.editItem(id)
  }

  addSchedule() {
    const site = this.siteService.getAssignedSite();
    const item = {} as PriceMenuGroup
    item.name = "New Menu Group"
    this.priceScheduleMenuGroupService.post(site, item).subscribe( data => {
      this.editItem(data.id);
    })
  }

  navPriceScheduleGroups() {
    this.router.navigate(['/psmenu-group-list'])
  }

  editItem(id: number) {
    this.productEditButtonService.openPSMenuGroupEditor(id);
  }

  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
    return 'Edit';
    else return 'Edit';
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
    duration: 2000,
    verticalPosition: 'top'
    });
  }

}
