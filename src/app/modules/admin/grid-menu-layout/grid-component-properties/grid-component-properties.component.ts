import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel } from '../grid-models';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridsterLayoutService, ValueTypeList } from 'src/app/_services/system/gridster-layout.service';
import { MenuService } from 'src/app/_services';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { HttpClient } from '@angular/common/http';

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
  action$: Observable<any>;


  message         : string[];

  dashBoardContent: DashboardContentModel;
  inputForm       : UntypedFormGroup;

  cardValueTypes  = this.layoutService.cardValueTypesList
  cardTypes  = this.layoutService.cardTypesList;
  menuBoardTypes = this.layoutService.menuBoardTypes;
  rangeTypes    =  this.layoutService.rangeTypes;
  cardValueTypesTemp = []


  itemValue      : ItemValue;
  productName     : string;
  image           : string;
  //used for filter and UI
  cardType       : string;
  chartType      : string;
  cardValueType  : string;

  listItemName   : string;
  listItemID     : number;
  //mat-slider requires variable.
  opacity        : number;
  //mat-slider requires variable.
  border         : number;
  //mat-slider requires variable.
  borderRadius   : number;
   //mat-slider requires variable.
  refreshTime    : number;
  layerIndex     : number;
  disableActions : boolean;
  rangeType      : string;

  //mat-slider requires variable.
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
    private httpClient: HttpClient,
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
    this.initForm();
    const site          = this.siteService.getAssignedSite();
    this.categories$    = this.menuService.getListOfCategoriesAll(site)
    this.specials$      = this.priceScheduleService.getList(site);
  }

  onCancel(event) {this.dialogRef.close()}

  setImage(event) {
    this.image = event;
    this.inputForm.patchValue({image: event})
  }

  setCardType(item: ValueTypeList) {
    this.cardType = item.name;
    this.setCardTypeValuesList(item.name);
  }

  setRangeType(type: string) {
    this.rangeType = type
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
            this.listItemID  = data.id
            this.productName = data.name;
            this.inputForm.patchValue({productName: data.name})
            this.inputForm.patchValue({listItemID: data.id})
            // this.updateCard(this.inputForm)
          }
        )
      }
    }
  }

  getProductName(id, cardType, valueType) {
    if (!cardType) {return }
    if (cardType.toLowerCase()  != 'menu') { return }
    if (valueType.toLowerCase() != 'product') { return }
    const site = this.siteService.getAssignedSite();
    this.menuService.getMenuItemByID(site, id).subscribe(data => {
        this.productName = data.name;
      }
    )
  }

  setCategory(value: any) {
    this.cardValueType = this.inputForm.controls['cardValueType'].value;
    // console.log(this.cardValueType,'value', value)
    if (this.cardValueType == 'Menu Section') {
      const item = {name: value?.name,active: value?.active, id: value?.id}  as ItemValue
      // this.listItemID = JSON.stringify(item)
      this.listItemID = value?.id;
      this.productName = value?.productName;
      this.setSelectValue(item)
      console.log('item', item, this.listItemID)
      return
    }
    this.listItemID = value;
    this.setSelectValue(value)
  }

  setCardValueType(type: string) {
    this.initRange(type)
    this.refreshTypeList(type);
    if (this.inputForm) { this.inputForm.patchValue({cardValueType: type})  }
  }

  refreshTypeList(type: string) {
    this.list$      = null;
    this.listItemID = null;
    console.log('refreshTypelist', type)
    const site      = this.siteService.getAssignedSite();
    if (type === 'Category') {
      this.list$ = this.menuService.getListOfCategoriesAll(site)
    }
    if (type === 'Specials') {
      this.list$  = this.priceScheduleService.getList(site);
    }
    if (type === 'Menu Section') {
      this.list$  = this.priceScheduleService.getMenuListItems(site);
    }
  }

  receiveData() {
  }

  initForm() {
    this.inputForm = this.layoutService.initGridFormProperties()
    if (!this.dashBoardContent) {
      this.dashBoardContent = {} as DashboardContentModel;
      return
    }
    this.initFormData();
  }

  //dashboard properties
  //contains both the object as one property
  //and then the properites along witht he object as all the other features.
  //it needs to have the object as a separate feature beacuse of how we
  //iterate the cards on the grid.
  initFormData() {
    const site = this.siteService.getAssignedSite();
    let item = {} as  DashBoardComponentProperties
    if (!item) {  item = this.initItem()  }
    if (this.dashBoardContent.properties) {
      item = JSON.parse(this.dashBoardContent.properties) as DashBoardComponentProperties;
      item.id  = this.dashBoardContent.id;
    }

    //establish default range value.
    this.rangeValue  = +item?.rangeValue
    if (!item.layerIndex ) { item.layerIndex = 1;}

    this.setDefaultValues(item)
    this.setCardTypeValuesList(item?.type);
    this.refreshTypeList(item?.cardValueType);
    this.initRange( item?.cardValueType);
    if (item.listItemID) {  this.listItemID = item?.listItemID; };
    if (item.productName) {  this.productName = item?.productName; };

    const selectValue = {id: item?.listItemID, name: item?.productName};
    if (item.listItemID) { this.setSelectValue( selectValue ) }

    this.inputForm.patchValue(item);
  }

  initItem() {
    let  item          = {} as DashBoardComponentProperties;
    item.name          = this.dashBoardContent?.name;
    item.id            = this.dashBoardContent?.id;
    item.type          = '';
    item.cardValueType = '';
    item.listItemID    = 0;
    item.productName   =''
    return item;
  }

  setDefaultValues(item) {
    this.cardType     = ''
    this.border       = 0
    this.borderRadius = 5
    this.opacity      = 0
    this.layerIndex   = 1
    this.productName  = item?.productName;
    this.image        = item?.image;
    if (item.type)            { this.cardType = item?.type };
    if (item.border)          { this.border = item?.border  };
    if (item.borderRadius)    { this.borderRadius = item?.borderRadius };
    if (item.opacity)         { this.opacity = item?.opacity  };
    if (item.layerIndex)      { this.layerIndex = item?.layerIndex };
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

  update(event){
    this.action$ = this._update(event);
  }

  updateExit(event) {
    this.action$ = this._update(event).pipe(switchMap(data => {
      setTimeout(data => {
        this.dialogRef.close()
      },100)
      return of(data)
    }))
  }

  _update(event) {
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
    this.updateDashBoard(dashBoard);
    return this.layoutService.saveModelUpdate()
  };

  updateCard(form: UntypedFormGroup): DashboardContentModel {
    const site = this.siteService.getAssignedSite();
    if (!form) {return  }
    const id              = this.dashBoardContent.id;
    let content           = this.dashBoardContent;
    let model             = form.value as DashBoardComponentProperties;
    model.listItemID      = this.listItemID;
    model.id              = this.dashBoardContent.id;

    //can't be stored inform.
    model.layerIndex      = this.layerIndex;
    model.border          = this.border;
    model.borderRadius    = this.borderRadius;
    model.opacity         = this.opacity;
    model.refreshTime     = this.refreshTime;
    model.rangeValue      = this.rangeValue;
    content = this.setComponentName(model, content)
    if (content.component)  {content.component   = ''}
    content.name        = model.name;

    if (!this.validateCard(model)) {return}
    const jsonObject    = JSON.stringify(model);
    content.properties  = jsonObject;
    this.dashBoardContent.properties = content.properties ;
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

    if (model?.cardValueType.toLowerCase() ===  'text'){
      content.componentName = 'text'
      return content
    }

    if (model?.cardValueType.toLowerCase() ===  'image'){
      content.componentName = 'image'
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

    if ( model.type === 'order') {  return true;  }

    if (model.type != 'youtube' && model.type != 'iframe' ) {
      if (!model.cardValueType)  {
        this.message.push("No Card Type Value assigned.")
        result = false
      }
    }
    return  result;
  }

  getDefaultCCS() {
    let styles$ = this.httpClient.get('assets/htmlTemplates/MenuSectionStyles.txt', {responseType: 'text'}).pipe(
      switchMap(styles => {
        this.inputForm.patchValue({ccs: styles})
        return of(styles)
    }))
    this.action$ = styles$
  }

  setSelectValue(value: any) {
    if (value) {
      if (this.inputForm) {
        if (this.inputForm.controls['cardValueType'].value == 'Menu Section') {
          this.inputForm.patchValue({listItemID: value?.id, productName: value?.name})
          console.log('value', value)
          return;
        }
        this.inputForm.patchValue({listItemID: value?.id})
        this.inputForm.patchValue({productName: value?.name})
        this.itemValue = value
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
