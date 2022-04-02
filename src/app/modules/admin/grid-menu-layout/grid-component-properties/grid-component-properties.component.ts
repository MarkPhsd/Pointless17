import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';
import { DashboardContentModel, DashboardModel } from '../grid-models';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { MenuService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
export interface ValueTypeList {
  filter: string;
  name  : string;
  icon  : string;
}
@Component({
  selector: 'app-grid-component-properties',
  templateUrl: './grid-component-properties.component.html',
  styleUrls: ['./grid-component-properties.component.scss']
})

export class GridComponentPropertiesComponent implements OnInit {

  dashBoardContent: DashboardContentModel;
  inputForm   : FormGroup;
  rangeTypes = ['year', 'month', 'date', 'week', 'hour',]
  cardTypes  = [
    {name: 'chart', icon: 'bar_chart', filter: 'none'},
    {name: 'report', icon: 'list', filter: 'none'},
    {name: 'menu', icon: 'menu', filter: 'none'},
    {name: 'tables', icon: 'table', filter: 'none'},
  ]as ValueTypeList[];
  cardType: string;
  cardValueTypes  = [] as ValueTypeList[];
  cardValueType: string;

  chartTypes = [
    {name: 'Bar', icon: 'bar_chart', filter: 'none'},
    {name: 'Line', icon: 'show_chart', filter: 'none'},
    {name: 'Bubble', icon: 'bubble_chart', filter: 'none'},
    {name: 'Donut', icon: 'donut_chart', filter: 'none'},
    {name: 'Pie', icon: 'pie_chart', filter: 'none'},
    {name: 'Scatter', icon: 'scatter_chart', filter: 'none'},
    {name: 'Candlestick', icon: 'candlestick_chart', filter: 'none'},
  ]

  menuBoardTypes = [
    {name: 'Flowers', icon: 'list', filter: 'MMJ'},
    {name: 'Category', icon: 'list', filter: ''},

  ] as ValueTypeList[];

  menuBoardType: ValueTypeList
  // categories$ = Observable<Categories>
  categories$      : Observable<IMenuItem[]>;
  constructor(
    private siteService        : SitesService,
    private gridDataService    : GridsterDataService,
    private dialogRef          : MatDialogRef<GridComponentPropertiesComponent>,
    public layoutService       : GridsterLayoutService,
    private menuService        : MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog             : MatDialog,
    private fb                 : FormBuilder,
    private _snackBar          : MatSnackBar,) {

    if (data) {
      this.dashBoardContent = data;
    }
}

  ngOnInit() {
    this.fillForm();
    const site = this.siteService.getAssignedSite();
    this.categories$    = this.menuService.getListOfCategoriesAll(site)
  }

  onCancel(event) {
    this.dialogRef.close()
  }

  setCardType(item: ValueTypeList) {
    this.cardType = item.name;
    this.setCardTypeValuesList(item.name);
    console.log('this.cardValueType', this.cardValueTypes)
    console.log('type', item)
    if (this.inputForm) {
      this.inputForm.controls['type'].setValue(item.name)
    }
  }
  setRangeType(type: string) {
    if (this.inputForm) {
      this.inputForm.controls['rangeType'].setValue(type)
    }
  }

  setCardTypeValuesList(type: string) {

    const cardValueType  = [
      {name: 'Top Products', filter: 'report', icon: ''},
      {name: 'Sales Totals', filter: 'report', icon: ''},
      {name: 'Tax',          filter: 'report', icon: ''},

      {name: 'Sales',        filter: 'report', icon: ''},
      {name: 'Order Count',  filter: 'report', icon: ''},
      {name: 'Avg Count',    filter: 'report', icon: ''},

      {name: 'Square',        filter: 'table', icon: ''},
      {name: 'Round',         filter: 'table', icon: ''},
      {name: 'Half Found',    filter: 'table', icon: ''},
    ]

    if (type === 'tables') { type = 'table'}
    if (type === 'chart') { type = 'report'}
    this.cardValueTypes = cardValueType.filter( data => data.filter == type)

    if (type === 'menu') {
      this.cardValueTypes = this.menuBoardTypes;

    }

  }

  setCategory(id: number) {
    if (this.inputForm) {
      this.inputForm.controls['categoryID'].setValue(id)
    }
  }

  setCardValueType(type: string) {
    this.cardValueType = type;
    if (this.inputForm) {
      this.inputForm.controls['cardValueType'].setValue(type)
    }
  }

  receiveData() {

  }

  fillForm() {
    this.initForm();
    if (!this.dashBoardContent) {
      this.dashBoardContent = {} as DashboardContentModel;
      return
    }
    this.initFormData();
  }

  initForm() {
    this.inputForm = this.fb.group( {
      id       : [''],
      username : [''],
      name     : [''],
      type     : [''], //preset types, menu, report widget, restaurant/ operation layout.
      jSONBject: [''],
      active   : [''],
      rangeType: [''],
      cardValueType: [''],
      menuType   : [''],
      categoryID : [''],
    })
    return this.inputForm
  };

  initFormData() {
    const site     = this.siteService.getAssignedSite();
    this.inputForm.patchValue(this.dashBoardContent)
  }

  update(event): void {
    const site = this.siteService.getAssignedSite();
    if (!this.inputForm) { return }
    let result = ''
    let model = this.inputForm.value as DashboardContentModel;
    //set values of dashboardmodel
    // model = this.setValues(model)

    // if (model.id) {
    //   const  model$ = this.gridDataService.updateGrid(site, model);
    //   this.publish(model$)
    // }

    // if (!model.id) {
    //   const  model$ = this.gridDataService.addGrid(site, model);
    //   this.publish(model$)
    // }

  };

  publish(model$: Observable<DashboardContentModel>) {
    model$.subscribe(
      {
        next : data =>{
          this.notifyEvent('Saved', "Saved")
        },
        error: err => {
            this.notifyEvent(err, "Failure")
        }
      }
    )
  }

  updateExit(event) {
    this.update(event)
    this.dialogRef.close()
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}
