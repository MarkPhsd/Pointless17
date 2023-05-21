import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel } from '../grid-models';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';
import { MenuService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
export interface ValueTypeList {
  filter: string;
  name  : string;
  icon  : string;
  usesRange: boolean;
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

  message : string[];
  productName: string;
  dashBoardContent: DashboardContentModel;
  inputForm       : UntypedFormGroup;
  rangeTypes      = ['year', 'month', 'date', 'week', 'hour','currentDay']
  cardValueTypesTemp = []
  cardValueTypes  = [
    // {name: 'Top Products', filter: 'report', icon: ''},
    {name: 'Sales Totals',      filter: 'report', icon: '', usesRange: true},
    {name: 'Tax',               filter: 'report', icon: '', usesRange: true},

    {name: 'Product Sales',     filter: 'report', icon: '', usesRange: true},
    {name: 'Category Sales',    filter: 'report', icon: '', usesRange: true},
    {name: 'Department Sales',  filter: 'report', icon: '', usesRange: true},
    {name: 'Type Sales',        filter: 'report', icon: '', usesRange: true},

    {name: 'Sales',             filter: 'report', icon: '', usesRange: true},
    {name: 'Order Count',       filter: 'report', icon: '', usesRange: true},
    {name: 'Avg Count',         filter: 'report', icon: '', usesRange: true},

    {name: 'Employee Sales Count',  filter: 'report', icon: '', usesRange: true},
    {name: 'Employee Sales',        filter: 'report', icon: '', usesRange: true},

    {name: 'Square',            filter: 'table', icon: '', usesRange: true},
    {name: 'Round',             filter: 'table', icon: '', usesRange: true},
    {name: 'Half Found',        filter: 'table', icon: '', usesRange: true},
  ]

  cardTypes  = [
    {name: 'chart'  ,  icon: 'bar_chart', filter: 'none'},
    {name: 'report' ,  icon: 'list',  filter: 'none'},
    {name: 'menu'   ,  icon: 'menu',  filter: 'none'},
    {name: 'tables' ,  icon: 'table', filter: 'none'},
    {name: 'order'  ,  icon: 'shopping_cart',  filter: 'none'},
    {name: 'youtube',  icon: 'smart_display',  filter: 'smart_display'},
    {name: 'iframe' ,  icon: 'whatshot',  filter: 'whatshot'},

  ] as ValueTypeList[];

  menuBoardTypes = [
    {name: 'Flowers',          icon: 'list',    filter:  'menu'},
    {name: 'Category',         icon: 'list',    filter:  'menu'},
    {name: 'Specials',         icon: 'list',    filter:  'menu'},
    {name: 'Product',          icon: 'product', filter:  'menu'},
    {name: 'FlowerPrices',     icon: 'list',    filter:  'menu'},
    {name: 'POSOrder',         icon: 'cart'   , filter:  'order'},
    {name: 'ClientInfo',       icon: 'cart'   , filter:  'order'},
    {name: 'OrderTotal',       icon: 'cart'   , filter:  'order'},
    {name: 'Limits',           icon: 'production_quantity_limits'   , filter:  'order'},
  ] as ValueTypeList[];

  itemValue      : ItemValue;
  cardType       : string;

  cardValueType  : string;
  listItemID     : string;
  chartType      : string;
  opacity        : number;
  border         : number;
  borderRadius   : number;
  refreshTime    : number;
  layerIndex     : number;
  disableActions : boolean;
  rangeType      : string;
  rangeValue     : number;
  dateRangeReport: boolean;

  _borderRadius: string;
  _border :string;
  _layer : string;

  chartTypes       = [];
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
    private fb                 : UntypedFormBuilder,
    private _snackBar          : MatSnackBar,) {
    if (data) {
      this.dashBoardContent = data;
    }
  }

  ngOnInit() {
    this.chartTypes = this.layoutService.cartTypeCollection;
    if (!this.dashBoardContent) { return }
    this.fillForm();
    const site          = this.siteService.getAssignedSite();
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
    this.rangeType = type
    if (this.inputForm) { this.inputForm.controls['rangeType'].setValue(type) }
  }

  initRange(type: string) {
    this.dateRangeReport = false;
    if (!type) {return}
    const items = this.cardValueTypes.filter( data => data.name === type)
    if (items && items.length>0) {
      if (items && items[0].usesRange) {
        this.dateRangeReport = true;
      }
    }
  }

  getItem(event) {
    const item = event
    if (item) {
      if (item.id) {
        const site = this.siteService.getAssignedSite();
        this.menuService.getMenuItemByID(site, item.id).subscribe(data => {
            this.listItemID  = data.id.toString()
            this.productName = data.name;
            this.inputForm.patchValue({productName: data.name})
            this.inputForm.patchValue({listItemID: data.id})
            this.updateCard(this.inputForm)
          }
        )
      }
    }
  }

  getProductName(id, cardType, valueType) {
    if (!cardType) {return }
    if (cardType.toLowerCase() != 'menu') { return }
    if (valueType.toLowerCase() != 'product') { return }
    const site = this.siteService.getAssignedSite();
    this.menuService.getMenuItemByID(site, id).subscribe(data => {
      this.productName = data.name;
      }
    )
  }

  setCategory(value: string) {
    this.listItemID = value;
    this.setSelectValue(value)
  }

  setCardValueType(type: string) {
    this.cardValueType = type;
    this.initRange(type)
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
      id            : [''], //
      name          : [''], // : string;
      roles         : [''], // : widgetRoles[]
      menuType      : [''], // : string;
      listItemID     : [''], //: string;
      opacity        : [''], //: number;
      borderRadius   : [''], //: number;
      border         : [''], //: number;
      layerIndex     : [''], //: number;

      lengthOfRange  : [''], //: string; //number of range month, year etc
      rangeType      : [''], //: string; //hour, month, day, year
      type           : [''], //: string; //preset types, menu, report widget
      cardValueType  : [''], //: string; //componentName
      dateFrom       : [''], //: string; //not implemented
      dateTo         : [''], //: string; //not implemented
      chartType      : [''], //: string;

      MMJMenu        : [''], //: boolean;
      chartHeight    : [''], //: string;
      chartWidth     : [''], //: string;
      itemID         : [''], //: string;

      disableActions : [''], //: boolean;
      autoPlay       : [''], //: boolean;
      url            : [''], //: string;
      autoRepeat     : [''], //: boolean;

      refreshTime    : [''], //: number;
      rangeValue     : [''], //: number;
      dateRangeReport: [''], //: boolean;
      productName    : [''], //: boolean;
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

      object.MMJMenu       = item?.MMJMenu;
      object.chartHeight   = item?.chartHeight;
      object.chartWidth    = item?.chartWidth;
      object.disableActions= item?.disableActions;
      object.url           = item?.url;
      object.autoPlay      = item?.autoPlay;
      object.autoRepeat    = item?.autoRepeat;
      object.chartType     = item?.chartType;
      object.dateRangeReport = item?.dateRangeReport;

      object.border        = item?.border;
      object.borderRadius  = item?.borderRadius;
      object.opacity       = item?.opacity;
      object.layerIndex    = item?.layerIndex;
      object.refreshTime   = item?.refreshTime;
      object.rangeValue    = item?.rangeValue;
      object.productName   = item?.productName;
    }

    //establish default range value.
    this.rangeValue  = +object?.rangeValue
    if (! object.layerIndex ) { object.layerIndex = 1;}
    this.inputForm.patchValue(object);

    this.cardType = ''
    this.cardValueType = ''
    this.border = 0
    this.borderRadius = 5
    this.opacity    = 0
    this.layerIndex = 1
    this.productName = object?.productName;
    if (object.type)            { this.cardType = object?.type };

    if (object.cardValueType)   { this.cardValueType = object?.cardValueType };
    if (object.border)          { this.border = object?.border  };
    if (object.borderRadius)    { this.borderRadius = object?.borderRadius };
    if (object.opacity)         { this.opacity = object?.opacity  };
    if (object.layerIndex)      { this.layerIndex = object?.layerIndex };

    this.setCardTypeValuesList(object.type);

    this.refreshTypeList(this.cardValueType);
    if (object.listItemID) {  this.listItemID = object?.listItemID; };
    if (object.listItemID) { this.setSelectValue(object?.listItemID); };
    this.initRange(this.cardValueType);
  }

  setCardTypeValuesList(type: string) {

    let cardValueTypes = this.cardValueTypes;

    if (type === 'order') {
      cardValueTypes = this.menuBoardTypes.filter( data => data.filter === type);
      this.cardValueTypesTemp = cardValueTypes;
      return
    }

    if (type === 'tables') { type = 'table'}
    if (type === 'chart')  { type = 'report'}
    cardValueTypes = cardValueTypes.filter( data => data.filter === type)

    if (type == 'report') {
      this.cardValueTypesTemp = cardValueTypes.filter( data => data.filter === type)
      return
    }

    if (type === 'menu') {
      this.cardValueTypesTemp = this.menuBoardTypes.filter( data => data.filter === type)
      return
    }

    this.cardValueTypesTemp = this.cardValueTypes;
  }

  update(event): void {
    //update the DashboardContentModel in memory
    const content = this.updateCard(this.inputForm);
    // then slice out the current DashboardContentModel from the DashboardModel
    // apply the updated DashboardContentModel
    const dashBoard = this.layoutService.dashboardModel;
    if ( content.id) {
      const id        = content.id;
      const list      = dashBoard.dashboard.filter( data =>
        {return data.id != id}
      )
      dashBoard.dashboard =  list
      dashBoard.dashboard.push(content);
    }
    this.updateDashBoard(dashBoard)
  };

  updateCard(form: UntypedFormGroup): DashboardContentModel {
    const site = this.siteService.getAssignedSite();
    if (!form) {return  }
    const id              = this.dashBoardContent.id;
    let content           = this.dashBoardContent;
    let model             = form.value as DashBoardComponentProperties;
    model.listItemID      = this.listItemID;
    model.id              = this.dashBoardContent.id;
    model.cardValueType   = this.cardValueType;
    model.type            = this.cardType;
    model.layerIndex      = this.layerIndex;
    model.border          = this.border;
    model.borderRadius    = this.borderRadius;
    model.opacity         = this.opacity;
    model.refreshTime     = this.refreshTime;
    model.rangeValue      = this.rangeValue;
    model.dateRangeReport = this.dateRangeReport;
    console.log(model)
    if (!this.validateCard(model)) {return}
    content = this.setComponentName(model, content)

    if (content.component)  {content.component   = ''}
    content.name        = model.name;
    const jsonObject    = JSON.stringify(model);
    content.properties  = jsonObject;
    this.dashBoardContent.properties = content.properties ;
    this.fillForm()
    return content;
  }

  setComponentName( model: DashBoardComponentProperties, content: DashboardContentModel,) {

    if (!model.cardValueType) { return content}

    if (model.cardValueType === 'Product') {
      content.componentName = 'product'
      return content
    }

    if (model.type === 'youtube') {
      content.componentName = 'youtube'
      return content
    }

    if (model.type === 'iframe') {
      content.componentName = 'iframe'
      return content
    }

    if (model?.type.toLowerCase() ===  'order'){
      content.componentName = model?.cardValueType
      return content
    }

    if (model?.cardValueType.toLowerCase() ===  'flowers'){
      content.componentName = 'Flowers'
      return content
    }

    if (model?.cardValueType.toLowerCase() ===  'flowerprices'){
      content.componentName = 'FlowerPrices'
      return content
    }

    if (model?.cardValueType.toLowerCase() ===  'category'){
      content.componentName = 'Category'
      return content
    }

    if (model?.cardValueType.toLowerCase() ===  'menuitem'){
      content.componentName = 'MenuItem'
      return content
    }

    if (model?.cardValueType.toLowerCase() ===  'chart'){
      content.componentName = 'chart'
      return content
    }

    if (model?.cardValueType.toLowerCase() ===  'report'){
      content.componentName = 'report'
      return content
    }

    return content
  }

  updateDashBoard(dashBoard: DashboardModel) {
    this.layoutService.dashboardModel = dashBoard;
    this.layoutService.dashboardArray = this.layoutService.dashboardArray
    this.layoutService.saveDashBoard();
  }

  validateCard(model:DashBoardComponentProperties) : boolean {
    let result = true
    this.message = []

    if ( model.type === 'order') {
      return true;
    }

    if (model.type != 'youtube' && model.type != 'iframe' ) {
      if (!model.cardValueType)  {
        this.message.push("No type assigned.")
        result = false
      }
    }
    return  result;
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

  setChartType(value: string) {
    if (value) {
      if (this.inputForm) {
        const item = { chartType: value}
        this.inputForm.patchValue(item)
        this.chartType = value;
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

  // setOpacity(event) {
  //   this.opacity = event
  //   if (this.inputForm) {
  //     this.inputForm.patchValue({opacity: event})
  //   }
  // }
  // setBorder(event){
  //   this.border  = event
  //   if (this.inputForm) {
  //     this.inputForm.patchValue({border: event})
  //   }
  // }
  // setBorderRadius(event){
  //   this.borderRadius = event
  //   if (this.inputForm) {
  //     this.inputForm.patchValue({borderRadius: event})
  //   }
  // }
  // setLayer(event) {
  //   this.layerIndex = event
  //   if (this.inputForm) {
  //     this.inputForm.patchValue({layerIndex: event})
  //   }
  // }

  formatOpacity(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    const item =   {opacity: value }
    return value;
  }
  formatBorder(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    this.border = value;
    this._border  = `${value}px`
    return value;
  }
  formatBorderRadius(value: number) {
    if (value >= 1000) {
      return Math.round(+value / 1000) + 'k';
    }
    this.borderRadius = value;
    this._borderRadius  = `${value}px`
    return value;
  }
  formatLayer(value: number) {
    if (value >= 1000) {
      return Math.round(+value / 1000) + 'k';
    }
    this.layerIndex = value;
    this._layer  = `${value}px`
    return value;
  }
  formatRefreshTime(value: number) {
    if (value >= 1000) {
      return Math.round(+value / 1000) + 'k';
    }
    this.refreshTime = value;
    return value;
  }
  formatRangeValue(value: number) {
    if (value >= 1000) {
      return Math.round(+value / 1000) + 'k';
    }
    this.rangeValue = value;
    return value;
  }

}
