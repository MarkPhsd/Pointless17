import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel } from '../grid-models';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { MenuService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { json } from 'stream/consumers';
import { itemsAnimation } from 'src/app/_animations/list-animations';
export interface ValueTypeList {
  filter: string;
  name  : string;
  icon  : string;
}

export interface ItemValue {
  name: string;
  id: string;
  active: boolean;
}
@Component({
  selector: 'app-grid-component-properties',
  templateUrl: './grid-component-properties.component.html',
  styleUrls: ['./grid-component-properties.component.scss']
})

export class GridComponentPropertiesComponent implements OnInit {

  dashBoardContent: DashboardContentModel;
  inputForm       : FormGroup;
  rangeTypes      = ['year', 'month', 'date', 'week', 'hour','currentDay']

  cardTypes  = [
    {name: 'chart', icon: 'bar_chart', filter: 'none'},
    {name: 'report', icon: 'list', filter: 'none'},
    {name: 'menu', icon: 'menu', filter: 'none'},
    {name: 'tables', icon: 'table', filter: 'none'},
  ] as ValueTypeList[];

  itemValue       : ItemValue;
  cardType        : string;
  cardValueTypes  = [] as ValueTypeList[];

  cardValueType: string;
  listItemID   : string;

  chartTypes = [
    {name: 'Bar', icon: 'bar_chart', filter: 'none'},
    {name: 'Line', icon: 'show_chart', filter: 'none'},
    {name: 'Bubble', icon: 'bubble_chart', filter: 'none'},
    {name: 'Donut', icon: 'donut_chart', filter: 'none'},
    {name: 'Pie', icon: 'pie_chart', filter: 'none'},
    {name: 'Scatter', icon: 'scatter_chart', filter: 'none'},
    {name: 'Candlestick', icon: 'candlestick_chart', filter: 'none'},
  ] as ValueTypeList[];

  menuBoardTypes = [
    {name: 'Flowers', icon: 'list', filter: 'MMJ'},
    {name: 'Category', icon: 'list', filter: ''},
    {name: 'Specials', icon: 'list', filter: ''},
  ] as ValueTypeList[];

  menuBoardType    : ValueTypeList
  categories$      : Observable<IMenuItem[]>;
  specials$        : Observable<IPriceSchedule[]>;
  list$            : Observable<any[]>;
  list             : any[];

  constructor(
    private siteService        : SitesService,
    private dialogRef          : MatDialogRef<GridComponentPropertiesComponent>,
    public layoutService       : GridsterLayoutService,
    private menuService        : MenuService,
    private priceScheduleService: PriceScheduleService,
    @Inject(MAT_DIALOG_DATA) public data: any,
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
    this.specials$      = this.priceScheduleService.getList(site);
  }

  onCancel(event) {this.dialogRef.close()}

  setCardType(item: ValueTypeList) {
    this.cardType = item.name;
    this.setCardTypeValuesList(item.name);
    if (this.inputForm) { this.inputForm.controls['type'].setValue(item.name) }
  }

  setRangeType(type: string) {
    if (this.inputForm) { this.inputForm.controls['rangeType'].setValue(type) }
  }

  setCardTypeValuesList(type: string) {

    const cardValueType  = [
      {name: 'Top Products', filter: 'report', icon: ''},
      {name: 'Sales Totals', filter: 'report', icon: ''},
      {name: 'Tax',          filter: 'report', icon: ''},

      {name: 'Sales',        filter: 'report', icon: ''},
      {name: 'Order Count',  filter: 'report', icon: ''},
      {name: 'Avg Count',    filter: 'report', icon: ''},

      {name: 'Square',       filter: 'table', icon: ''},
      {name: 'Round',        filter: 'table', icon: ''},
      {name: 'Half Found',   filter: 'table', icon: ''},
    ]

    if (type === 'tables') { type = 'table'}
    if (type === 'chart') { type = 'report'}
    this.cardValueTypes = cardValueType.filter( data => data.filter == type)

    if (type === 'menu') {
      this.cardValueTypes = this.menuBoardTypes;
    }
  }

  setCategory(value: string) {
    this.listItemID = value;
    this.setSelectValue(value)
  }

  setCardValueType(type: string) {
    this.cardValueType = type;
    //set the list type to look up
    this.refreshTypeList(type);
    if (this.inputForm) { this.inputForm.controls['cardValueType'].setValue(type)  }
  }

  refreshTypeList(type: string) {
    this.list$      = null;
    this.listItemID = null;
    const site      = this.siteService.getAssignedSite();
    if (type === 'Category') {
      this.list$ = this.menuService.getListOfCategoriesAll(site)
    }
    if (type === 'Specials') {
      this.list$  = this.priceScheduleService.getList(site);
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
    this.inputForm = this.fb.group({
      id           : [''],
      username     : [''],
      name         : [''],
      type         : [''], //preset types, menu, report widget, restaurant/ operation layout.
      active       : [''],
      rangeType    : [''],
      cardValueType: [''],
      menuType     : [''],
      listItemID   : [''],
    })
    return this.inputForm
  };

  initFormData() {
    const site = this.siteService.getAssignedSite();
    let object = {} as DashBoardComponentProperties;

    const item = this.dashBoardContent.properties
    if (!item) {
      object               = {} as DashBoardComponentProperties;
      object.name          = this.dashBoardContent.name;
      object.id            = this.dashBoardContent.id;
      object.type          = '';
      object.cardValueType = '';
      object.listItemID    = '';
    }

    if (item) {
      let item = JSON.parse(this.dashBoardContent.properties) as DashBoardComponentProperties;
      object.name          = item?.name;
      object.id            = this.dashBoardContent.id;
      object.dateFrom      = item?.dateFrom;
      object.dateTo        = item?.dateTo;
      object.rangeType     = item?.rangeType;
      object.type          = item?.type;
      object.menuType      = item?.menuType;
      object.lengthOfRange = item?.lengthOfRange;
      object.listItemID    = item?.listItemID;
      object.cardValueType = item?.cardValueType;
    }

    //refesh form values and local variables
    this.inputForm.patchValue(object);
    if (object.type)            { this.cardType = object?.type };
    if (object.cardValueType)   { this.cardValueType = object?.cardValueType  };

    this.setCardTypeValuesList(object.type);

    this.refreshTypeList(this.cardValueType);
    if (object.listItemID) {  this.listItemID = object?.listItemID; }

    if (object.listItemID) { this.setSelectValue(object?.listItemID); }

  }

  update(event): void {
    //update the DashboardContentModel in memory
    const content = this.updateCard();
    // then slice out the current DashboardContentModel from the DashboardModel
    // apply the updated DashboardContentModel
    const dashBoard = this.layoutService.dashboardModel;
    const id        = content.id;
    const list      = dashBoard.dashboard.filter( data =>
       {return data.id != id}
    )

    dashBoard.dashboard =  list
    dashBoard.dashboard.push(content);
    this.updateDashBoard(dashBoard)
  };

  updateCard(): DashboardContentModel {
    const site = this.siteService.getAssignedSite();
    if (!this.inputForm) { return }
    const id            = this.dashBoardContent.id;
    const content       = this.dashBoardContent;
    let model           = this.inputForm.value as DashBoardComponentProperties;
    model.listItemID    = this.listItemID;
    model.id            = this.dashBoardContent.id;
    model.cardValueType = this.cardValueType;
    model.type          = this.cardType;
    model.name          = model.name;
    content.component   = null;
    const jsonObject    = JSON.stringify(model);
    content.properties  = jsonObject;
    return content;
  }

  updateDashBoard(dashBoard: DashboardModel) {
    this.layoutService.dashboardModel = dashBoard;
    this.layoutService.dashboardArray = this.layoutService.dashboardArray
    this.layoutService.saveDashBoard();
  }

  setSelectValue(value: string) {
    if (value) {
      if (this.inputForm) {
        const item =   JSON.parse(JSON.stringify(value))
        this.inputForm.controls['listItemID'].setValue(value);
        this.itemValue = item
      }
    }
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
