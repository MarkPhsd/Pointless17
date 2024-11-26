import { Component,   OnInit, ViewEncapsulation,} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable,  of, switchMap  } from 'rxjs';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import {  GridApi } from '@ag-grid-community/all-modules';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ItemTypeEditorComponent } from './item-type-editor/item-type-editor.component';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { ItemTypeDisplayAssignmentService } from 'src/app/_services/menu/item-type-display-assignment.service';
import { AgGridImageFormatterComponent } from 'src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { ItemTypeMethodsService } from 'src/app/_services/menu/item-type-methods.service';
import { ActivatedRoute } from '@angular/router';
import { MetrcItemsCategoriesService } from 'src/app/_services/metrc/metrc-items-categories.service';
import { AgGridModule } from 'ag-grid-angular';
import { ItemTypeCategoryAssignmentComponent } from './item-type-category-assignment/item-type-category-assignment.component';
import { UseGroupTaxAssignmentComponent } from './use-group-tax-assignment/use-group-tax-assignment.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-item-type',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    AgGridModule,
    ItemTypeCategoryAssignmentComponent,
    ItemTypeDisplayAssignmentService,
    UseGroupTaxAssignmentComponent,

  SharedPipesModule],
  templateUrl: './item-type.component.html',
  styleUrls: ['./item-type.component.scss'],
  encapsulation: ViewEncapsulation.None // Disable encapsulation
})
export class ItemTypeComponent implements OnInit {

  selectedItems:      any[] = []; // [{name: 'blue', id: 1}, {name: 'green', id: 2},{name: 'yellow', id: 3},{name: 'red', id: 4},]
  availableItems:     any[] = []; //  = [{name: 'magenta', id: 10}, {name: 'purple', id: 11}]
  currentSelectItems: any[] = [];
  selectedItemTypes : any[] = [];
  itemTypeBasic     : any[] = [];

  gridApi:            GridApi;
  // gridColumnApi:      GridAlignColumnsDirective;
  searchGridOptions:  any;

  //AgGrid
  // @ViewChild('agGrid') agGrid: AgGridAngular;
  gridOptions:           any
  columnDefs             = [];
  defaultColDef;
  frameworkComponents:   any;
  rowDataClicked1        = {};
  rowDataClicked2        = {};
  public rowData:        any[];
  public info:           string;

  paginationSize          = 50
  currentRow              = 1;
  currentPage             = 1
  pageNumber              = 1
  pageSize                = 50
  numberOfPages           = 1
  rowCount                = 50
  rowSelection;
  loading_initTypes      : boolean;
  selected               : any;
  itemTypes              : IItemType[];

  metrcCatsExist: boolean;
  action$: Observable<any>;

  itemTypes$            : Observable<IItemType[]>;
  // itemTypes$             : Subject<IItemType[]> = new Subject();

  // public modules         : Module[] = AllCommunityModules;

  accordionStep = 0;
  UnAssignedCategories = "Unassigned Categories"
  AssignedCategories   = "Assigned Categories"
  urlPath: string;

  constructor(  private _snackBar: MatSnackBar,
                private siteService: SitesService,
                private dialog: MatDialog,
                private itemTypeService: ItemTypeService,
                private menuService: MenuService,
                private metrcCategoriesService: MetrcItemsCategoriesService,
                private itemTypeDisplay: ItemTypeDisplayAssignmentService,
                private awsService     : AWSBucketService,
                private itemTypeMethodsService: ItemTypeMethodsService,
                private route: ActivatedRoute,
                ) {

  }

  async ngOnInit()
  {
    this.accordionStep  = -1;
    this.refreshData();
    this.initGridResults();
    const site        = this.siteService.getAssignedSite();
    const categories$ = this.menuService.getCategoryListNoChildren(site)
    categories$.subscribe( data => {
      this.availableItems = data
    })
    this.urlPath     =  await this.awsService.awsBucketURL();
    this.itemTypeBasic            =  await this.itemTypeService.getBasicTypes(site).pipe().toPromise();
    this.selectedItemTypes        =  await this.itemTypeDisplay.getSortedList(site).pipe().toPromise();
    const step = this.route.snapshot.paramMap.get('accordionStep');
    if (step) {
      this.accordionStep = +step;
      this.setStep(+step)
    }
  }

  initalizeTypes() {
    this.loading_initTypes = true;
    const result = window.confirm('Please confirm. This function will delete all item type settings and re-initialize all options for item types.');

    if (!result) { this.loading_initTypes = false;}

    if (result) {
      this.loading_initTypes = true ;
      this.itemTypeMethodsService.initalizeTypes().subscribe( {
        next: data => {
          this.itemTypeMethodsService.notify(`Items initialized.`, 'Success', 2000)
          this.loading_initTypes = false;
        },
        error: err => {
          this.itemTypeMethodsService.notify(`Error. ${err}`, 'Failure', 15000)
          this.loading_initTypes = false;
        }
      })
    }
  }

 refreshData() {
    const site        = this.siteService.getAssignedSite()
    // this._itemTypes$  = this.itemTypeService.getItemTypes(site);
    const filePath    = this.urlPath;

    // this._itemTypes$.subscribe(data => {
    //   if (this.urlPath) {
    //     data.forEach( item =>
    //       {
    //         if (item.imageName) {
    //           item.imageName = `${this.urlPath}${item.imageName}`
    //         }
    //       }
    //     )
    //   }
    //   data = data.sort((a, b) => (a.name > b.name) ? 1 : -1)

    // })

    this.itemTypes$ = this.itemTypeService.getItemTypes(site).pipe(switchMap(data => {
      if (data) {
        if (this.urlPath) {
          data.forEach( item =>
            {
              if (item.imageName) {
                item.imageName = `${this.urlPath}${item.imageName}`
              }
            }
          )
        }
        data = data.sort((a, b) => (a.name > b.name) ? 1 : -1)
        // this.itemTypes$.next(data)
        return of(data)
      }
    }))
  }

  createItemTypesFromMetrcCategories() {
    const site = this.siteService.getAssignedSite()
    this.action$ = this.itemTypeService.createItemTypesFromMetrcCategories(site).pipe(switchMap(data => {
      this.siteService.notify("List generated.", 'close', 4000, )
      return of(data)
    }))
  }

  checkIfMetrcCategoriesExist() {
    const site = this.siteService.getAssignedSite()
    this.metrcCategoriesService.getCategories( ).subscribe(data => {
      if (data) {
        this.metrcCatsExist = true;
      }
    })

  }

  initGridResults() {
    this.initAGGridFeatures()
    this.frameworkComponents = {
      btnCellRenderer: ButtonRendererComponent
    };
    this.defaultColDef = {
      flex: 1,
      minWidth: 100,
    };
  }

  onGridReady(params) {
    if (params) {
      this.gridApi = params.api;
      // this.gridColumnApi = params.columnApi;
    }
    if (!params)  { console.log('no params')}
  }

  setStep(index: number) {
    this.accordionStep = index;
  }

  nextStep() {
    this.accordionStep++;
  }

  prevStep() {
    this.accordionStep--;
  }

  initAGGridFeatures() {
    this.columnDefs =  [
      {
       field: "id",
       cellRenderer: "btnCellRenderer",
       cellRendererParams: {
         onClick: this.editFromGrid.bind(this),
         label: 'Edit',
         getLabelFunction: this.getLabel.bind(this),
         btnClass: 'btn btn-primary btn-sm'
       },
       minWidth: 65,
       width: 65
     },

      {headerName: 'Name', field: 'name', sortable: true, minWidth: 150},
      {headerName: 'Group',  sortable: true, field: 'type',},
      {headerName: 'Enabled', field: 'enabled', sortable: true},
      {headerName: 'Age Requirement', field: 'ageRequirement', sortable: true},
      { headerName: 'Image',
        field: 'imageName',
        width: 60,
        sortable: false,
        autoHeight: true,
        cellRendererFramework: AgGridImageFormatterComponent
      },

      {headerName: 'Metrc', field: 'metrcCategoryID', sortable: true, minWidth: 50},
    ]
    this.rowSelection = 'multiple';
    this.initGridOptions()
  }

  initGridOptions()  {
    this.gridOptions = {
      pagination: true,
      paginationPageSize: 50,
      cacheBlockSize: 25,
      maxBlocksInCache: 800,
      rowModelType: 'infinite',
      infiniteInitialRowCount: 2,
      rowSelection: 'multiple',
    }
  }

  filterMetrcCategories() {
    const site = this.siteService.getAssignedSite()
    this.itemTypes$  = this.itemTypeService.getTypeList(site).pipe(switchMap(data => {
      if (data) {
        let list = data.filter(item => {
          return item.metrcCategoryID>0
        })
        return of(list)
      }
      return of(data)
    }))
  }


  getLabel(rowData)
  {
    if(rowData && rowData.hasIndicator)
      return 'Edit';
      else return 'Edit';
  }

  onSelectionChanged(event) {

    let selectedRows = this.gridApi.getSelectedRows();
    let selectedRowsString = '';
    let maxToShow = 5;
    let selected = []

    selectedRows.forEach(function (selectedRow, index) {
      if (index >= maxToShow) {
        return;
      }
      if (index > 0) {
        selectedRowsString += ', ';
      }
      try {

      } catch (error) {
        console.log( error , this.selected )
      }

      selectedRowsString += selectedRow.name;
    });

    selectedRows.forEach(data=>{
      selected.push(data.id)
    })

    if (selectedRows.length > maxToShow) {

      let othersCount = selectedRows.length - maxToShow;
      selectedRowsString +=
        ' and ' + othersCount + ' other' + (othersCount !== 1 ? 's' : '');
    }
    document.querySelector('#selectedRows').innerHTML = selectedRowsString;
    this.selected = selected
  }

  editFromGrid(e) {
    if (e.rowData.id)  {
      this.editItemWithId(e.rowData.id);
    }
  }

  editItemWithId(id:any) {
    this.openItemEditor(id);
  }

  openItemEditor(id: number) {
    let dialogRef = this.itemTypeMethodsService.openItemEditor(id);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshData();
      }
    });
  }



  //not implemented.
  editSelected() {
    // this.openEditor(this.selected)
    if (this.selected) {
      let dialogRef: any;

      {
        dialogRef = this.dialog.open(ItemTypeEditorComponent,
          { width:        '700px',
            minWidth:     '700px',
            height:       '740px',
            minHeight:    '740px',
            data : {selected: this.selected}
          },
        )

      }
      dialogRef.afterClosed().subscribe(result => {
        this.refreshData();
      });
    }
  }

  openEditor(data: any) {
    let dialogRef: any;
    {
      dialogRef = this.dialog.open(ItemTypeEditorComponent,
        { width:        '700px',
          minWidth:     '700px',
          height:       '740px',
          minHeight:    '740px',
          data : {data}
        },
      )

    }
    dialogRef.afterClosed().subscribe(result => {
      this.refreshData();
    });

  }

  async delete() {
    const site = this.siteService.getAssignedSite();
    if (this.selected)  {

      const answer = window.confirm('Please confirm, this will remove settings that may be important.');
      if (answer) {

          const items = [] as IItemType[]
          this.selected.forEach(data =>
            {
              const item = {} as IItemType;
              item.id = data
              items.push(item)
            })

          this.itemTypeService.deleteItems(site, items).subscribe(data => {
            this._snackBar.open('Items Deleted', 'Success', {duration: 2000})
            this.refreshData();
          });
        }
      }
  }

  add() {

    const itemType = {} as IItemType;
    const site = this.siteService.getAssignedSite();
    const itemType$ = this.itemTypeService.saveItemType(site, itemType)

    itemType$.subscribe( ( data => {
      this.openItemEditor(data.id)
    }))

  }

  onItemsMoved(event) {
  }

}
