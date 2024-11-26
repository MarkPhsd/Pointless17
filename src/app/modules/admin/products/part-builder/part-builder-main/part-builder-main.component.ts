import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { AgGridModule } from 'ag-grid-angular';
import { GridApi, IGetRowsParams } from 'ag-grid-community';
import { Observable, of, switchMap } from 'rxjs';
import { AgGridFormatingService, rowItem } from 'src/app/_components/_aggrid/ag-grid-formating.service';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { PB_Main, PB_SearchResults, PartBuilderMainService } from 'src/app/_services/partbuilder/part-builder-main.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PartBuilderFilterComponent } from '../part-builder-filter/part-builder-filter.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

export interface IPartSearchModel {
  name: string;
  pageNumber: number;
  pageSize: number;
}

@Component({
  selector: 'app-part-builder-main',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  AgGridModule,PartBuilderFilterComponent,
  SharedPipesModule],
  templateUrl: './part-builder-main.component.html',
  styleUrls: ['./part-builder-main.component.scss']
})
export class PartBuilderMainComponent implements OnInit {

  partList$ : Observable<any>;
  searchModel = {} as IPartSearchModel

  get platForm()         {  return Capacitor.getPlatform(); }
  get PaginationPageSize(): number {return this.pageSize;  }
  get gridAPI(): GridApi {  return this.gridApi;  }
  buttonName: string = 'Edit'
  id: any;
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
  pageNumber              = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage             : boolean;
  islastpage              : boolean;
  value             : any;
  selected          : any[];
  selectedRows      : any;
  agtheme           = 'ag-theme-material';
  gridDimensions    = "width: 100%; height: 100%;"
  searchName: string;

  item$: Observable<PB_Main>;

  constructor(
    private siteService: SitesService,
    private agGridFormatingService: AgGridFormatingService,
    private partBuilderService: PartBuilderMainService,
    private router: Router,
  ) {
    // this.initSubscriptions();
    // this.initForm();
    this.initAGGrid();
  }

  ngOnInit(): void {
    const i = 0;
    this.rowSelection       = 'multiple'
  }

  navUsage() {
    this.router.navigate(['part-usage-list'])
  }

  refreshSearchAny(search: any) {
    if (search) {
      search = this.initSearchModel()
    }
    // console.log('search', search)
    if (search) {
      const site = this.siteService.getAssignedSite()
      this.searchName  = search.name;
      this.partList$ = this.getRowData(this.params, 1, 50)
      if (this.params){
        this.params.startRow     = 1;
        this.params.endRow       = this.pageSize;
      }
      this.onGridReady(this.params)
    }
  }

  refreshList() {
    this.refreshSearchAny(this.searchModel)
  }

  initSearchModel(): IPartSearchModel {
    let search        = {} as IPartSearchModel;
    search.name       = this.searchName
    search.pageNumber = this.pageNumber;
    search.pageSize   = this.pageSize;
    return search
  }

  getRowData(params, startRow: number, endRow: number):  Observable<PB_SearchResults>  {
    this.pageNumber           = this.setCurrentPage(startRow, endRow)
    this.searchModel.pageNumber = this.pageNumber;
    const searchModel         = this.initSearchModel();
    const site                = this.siteService.getAssignedSite()
    return this.partBuilderService.searchMenuPrompts(site, searchModel)
  }

  //this doesn't change the page, but updates the properties for getting data from the server.
  setCurrentPage(startRow: number, endRow: number): number {
    const tempStartRow = this.startRow
    this.startRow      = startRow
    this.endRow        = endRow;
    if (tempStartRow > startRow) { return this.pageNumber - 1 }
    if (tempStartRow < startRow) { return this.pageNumber + 1 }
    return this.pageNumber
  }

  initAGGrid() {

    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };

    this.defaultColDef = {
      flex: 2,
    };

    let item  =   {
    field: 'id',
    cellRenderer: "btnCellRenderer",
                  cellRendererParams: {
                      onClick: this.editItemWithId.bind(this),
                      label:  this.buttonName,
                      getLabelFunction: this.getLabel.bind(this),
                      btnClass: 'btn btn-primary btn-sm'
                    },
                    minWidth: 125,
                    maxWidth: 125,
                    width   : 100,
                    flex: 2,
                    headerName: '',
                    sortable: false,
    } as rowItem
    this.columnDefs.push(item);

    item =   {headerName: 'Name',     field: 'name', sortable: true,
      width   : 100,
      minWidth: 200,
      maxWidth: 200,
      flex    : 2,
    } as any
    this.columnDefs.push(item);

    this.gridOptions = this.agGridFormatingService.initGridOptions(this.pageSize, this.columnDefs);
  }

  getLabel(rowData) {
    if(rowData && rowData.hasIndicator)
      return this.buttonName
      else return this.buttonName
  }

  editItemWithId(item:any) {
    if(!item) {
      // console.log(item)
      return
    }
    const id   = item.rowData.id;
    const site = this.siteService.getAssignedSite()
    this.router.navigate(['/part-builder-edit', {id:item.rowData.id}]);
  }

  autoSizeAll(skipHeader) {
    try {
      var allColumnIds = [];
      this.gridOptions.columnApi.getAllColumns().forEach(function (column) {
        allColumnIds.push(column.colId);
      });
      this.gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
    } catch (error) {
      console.log(error)
    }
  }

  add() {
    const site = this.siteService.getAssignedSite()
    const item = {name: 'New Item '} as PB_Main;

    this.item$ = this.partBuilderService.post(site, item).pipe(switchMap(data => {
      this.router.navigate(['part-builder-edit', {id:data.id}])
      return of(data)
    }))
  }

  onGridReady(params: any) {
    if (params)  {
      this.params  = params
      this.gridApi = params.api;
      params.api.sizeColumnsToFit();
      this.autoSizeAll(false)
    }

    this.onFirstDataRendered(this.params)
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
            // console.log('data', data)
            const resp         =  data.paging
            if (resp) {
              this.isfirstpage   = resp.isFirstPage
              this.islastpage    = resp.isFirstPage
              this.pageNumber    = resp.currentPage
              this.numberOfPages = resp.pageCount
              this.recordCount   = resp.recordCount
              if (this.numberOfPages !=0 && this.numberOfPages) {
                this.value = ((this.pageNumber / this.numberOfPages ) * 100).toFixed(0)
              }
              if (data.results) {
                params.successCallback(data.results)
                this.rowData = data.results;
              }
            }
          }
      );
      }
    };

    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
    this.autoSizeAll(true)
  }

  onFirstDataRendered (params) {
    try {
      params.api.sizeColumnsToFit()
      window.setTimeout(() => {
        const colIds = params.columnApi.getAllColumns().map(c => c.colId)
        params.columnApi.autoSizeColumns(colIds)
      }, 50)
     } catch (error) {
      console.log(error)
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
    if (selected) {
      this.selected = selected
      this.id = selectedRows[0].id;
      this.getItem(this.id)
    }
  }

  getItem(id: number) {
    const site = this.siteService.getAssignedSite();
    this.item$ = this.partBuilderService.getItem(site, this.id)
    // this.employeeService.updateCurrentEditEmployee(null);
    // if (id) {
    //   const site = this.siteService.getAssignedSite();
    //   this.employeeService.getEmployee(site, this.id).subscribe(data => {
    //      this.employee = data;
    //      this.employeeService.updateCurrentEditEmployee(data)
    //     }
    //   )
    // }
  }

  onExportToCsv() {
    this.gridApi.exportDataAsCsv();
  }
}
