import { Component, OnInit } from '@angular/core';
import { IMenuButtonGroups, MBMenuButtonsService } from 'src/app/_services/system/mb-menu-buttons.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { Observable, of, switchMap } from 'rxjs';
import { AgGridFormatingService } from 'src/app/_components/_aggrid/ag-grid-formating.service';
// import { GridAlignColumnsDirective } from '@angular/flex-layout/grid/typings/align-columns/align-columns';
import { IGetRowsParams, GridApi } from 'ag-grid-community';
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-alpine.css";
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Capacitor,  } from '@capacitor/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-function-group-list',
  templateUrl: './function-group-list.component.html',
  styleUrls: ['./function-group-list.component.scss']
})

export class FunctionGroupListComponent implements OnInit {
  gridDimensions  : any;
  menuButtonGroups: IMenuButtonGroups[];
  menuButtonGroup : IMenuButtonGroups;
  searchForm      : FormGroup;
  get itemName() {
    if (this.searchForm) {
      return this.searchForm.get("itemName") as FormControl;
    }
  }

  get gridAPI(): GridApi {  return this.gridApi;  }
  get platForm()         {  return Capacitor.getPlatform(); }
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
  pageSize                = 20
  currentRow              = 1;
  currentPage             = 1
  numberOfPages           = 1
  startRow                = 0;
  endRow                  = 0;
  recordCount             = 0;
  isfirstpage            : boolean;
  islastpage             : boolean;
  inputForm              : FormGroup;
  agtheme                = 'ag-theme-material';
  editOff       : boolean;
  buttonName    : string;
  id            : number;
  selected      : any[];
  value         : number;
  gridlist      : string;
  datasource: any;
  constructor(
              private _snackBar              : MatSnackBar,
              private agGridService          : AgGridService,
              private fb                     : FormBuilder,
              private siteService            : SitesService,
              private productEditButtonService: ProductEditButtonService,
              private agGridFormatingService : AgGridFormatingService,
              private dialog: MatDialog,
              private router: Router,
             private mbMenuGroupService: MBMenuButtonsService) {

      this.initForm();
      this.initAgGrid(this.pageSize);
      this.initClasses();
    }

  ngOnInit(): void {
    const i = 0
    if (this.editOff) {
      this.buttonName = 'Assign'
      this.gridlist = "grid-list-nopanel"
    }
  }

  initClasses()  {
    const platForm      = this.platForm;
    this.gridDimensions =  'width: 100%; height: 600px;'
    this.agtheme  = 'ag-theme-material';
    if (platForm === 'capacitor') { this.gridDimensions =  'width: 100%; height: 90%;' }
    if (platForm === 'electron')  { this.gridDimensions = 'width: 100%; height: 90%;' }
  }


  initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : [''],
    });
  }

  refreshSearchPhrase(event) {
    const item = { itemName: event }
    this.searchForm.patchValue(item)
    this.refreshSearch();
  }

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
      field: 'id',
      cellRenderer: "btnCellRenderer",
                    cellRendererParams: {
                        onClick: this.editItemFromGrid.bind(this),
                        label: this.buttonName,
                        getLabelFunction: this.getLabel.bind(this),
                        btnClass: 'btn btn-primary btn-sm'
                      },
                      minWidth: 125,
                      maxWidth: 125,
                      flex: 2,
      },
      {headerName: 'Name',     field: 'name',         sortable: true,
                  width   : 175,
                  minWidth: 175,
                  maxWidth: 275,
                  flex    : 1,
      },
      {headerName: 'Description',  field: 'description',      sortable: true,
                  width: 75,
                  minWidth: 125,
                  maxWidth: 150,
                  // flex: 1,
      }
    ]
    this.gridOptions = this.agGridFormatingService.initGridOptions(pageSize, this.columnDefs);
  }

  listAll(){
    const control = this.itemName
    if (control) {
      control.setValue('')
    }
    this.initForm()
    this.refreshSearch()
  }

  initSearchModel(): string {
    if (this.itemName) {
      if (this.itemName.value)          { return this.itemName.value  }
    }
    return '';
  }

  refreshSearch() {
    const site               = this.siteService.getAssignedSite()
    const productSearchModel = this.initSearchModel();
    this.onGridReady(this.params)
  }

  refreshGrid() {
    this.onGridReady(this.params)
  }

  //ag-grid standard method
  getRowData(params, startRow: number, endRow: number):  Observable<IMenuButtonGroups[]>  {
    const site                = this.siteService.getAssignedSite()
    const name =  this.initSearchModel()
    // return this.mbMenuGroupService.getGroupsByName(site,name )
    return this.mbMenuGroupService.getGroups(site)
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
            const resp         =  data
            if (!resp)         {return}
            if (this.numberOfPages !=0 && this.numberOfPages) {
              this.value = 100// ((this.currentPage / this.numberOfPages ) * 100).toFixed(0)
            }
            let results        =  this.refreshImages(data)
            params.successCallback(results)
          }
        );
      }
    };
    this.datasource = datasource;
    console.log(datasource)
    if (!datasource)   { return }
    if (!this.gridApi) { return }
    this.gridApi.setDatasource(datasource);
  }

  refreshImages(data) {
    const urlPath = ''
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
    this.getItemHistory(this.id)
  }

  getItem(id: number) {
    if (id) {
      const site = this.siteService.getAssignedSite();
      this.mbMenuGroupService.getGroupByID(site, id).subscribe(data => {
        this.menuButtonGroup = data;
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
      return this.buttonName
      else return this.buttonName
  }

  onBtnClick1(e) {
    this.rowDataClicked1 = e.rowData;
  }

  onBtnClick2(e) {
    this.rowDataClicked2 = e.rowData;
  }

  editItemFromGrid(e) {
    if (!e) {return}
    if (e.rowData.id)  {
      this.editItemWithId(e.rowData.id);
    }
  }

  editItemWithId(id:any) {
    if(!id) { return }
    this.router.navigate(['function-group-edit', {id:id}])
  }

  editProduct(e){
    if (!e) { return }
    const id = e.id;
    this.router.navigate(['function-group-edit', {id:id}])
  }

  addItem() {
    const group = {} as IMenuButtonGroups;
    group.name = 'Input Name';
    const site = this.siteService.getAssignedSite();
    this.mbMenuGroupService.postGroup(site, group).subscribe(data => {
      this.editItemWithId(data.id)
    })
  }

  resetOrderButtons() {
    const site        = this.siteService.getAssignedSite();
    const group       = {} as IMenuButtonGroups;
    group.name        ="Order Buttons";
    group.description ="Order Buttons";
    const group$ = this.mbMenuGroupService.postGroup(site, group).pipe(
      switchMap(data => {
        return  this.mbMenuGroupService.resetOrderButtons(site, data.id)
      })).subscribe(data => {
        this.refreshGrid();
        if (data[0])
        this.editItemWithId(data[0].mb_MenuButtonGroupID)
    })
  }

  onSortByNameAndPrice(sort: string) { }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}
