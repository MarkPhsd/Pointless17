import { Injectable } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridsterItem, GridType, } from 'angular-gridster2';
import { UUID } from 'angular2-uuid';
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel, DashBoardProperties, GridsterSettings, WidgetModel, widgetRoles } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDataService } from '../gridster/gridster-data.service';
import { SitesService } from '../reporting/sites.service';
import { BehaviorSubject, catchError, Observable, of, switchMap } from 'rxjs';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { StrainBoardComponent } from 'src/app/modules/tv-menu/strainBoard/strain-board/strain-board.component';
import { CategoryItemsBoardComponent } from 'src/app/modules/tv-menu/category-items-board/category-items-board.component';
import { PosOrderItemsComponent } from 'src/app/modules/posorders/pos-order/pos-order-items/pos-order-items.component';
import { PosOrderBoardComponent } from 'src/app/modules/posorders/pos-order/pos-order-board/pos-order-board.component';
import { OrderHeaderDemographicsBoardComponent } from 'src/app/modules/posorders/pos-order/order-header-demographics-board/order-header-demographics-board.component';
import { OrderTotalBoardComponent } from 'src/app/modules/posorders/pos-order/order-total-board/order-total-board.component';
import { IFrameComponent } from 'src/app/shared/widgets/i-frame/i-frame.component';
import { YoutubePlayerComponent } from 'src/app/shared/widgets/youtube-player/youtube-player.component';
import { LimitValuesCardComponent } from 'src/app/modules/posorders/limit-values-card/limit-values-card.component';
import { ISetting, ISite } from 'src/app/_interfaces';
import { CardDashboardComponent } from 'src/app/modules/admin/reports/card-dashboard/card-dashboard.component';
import { MenuItemCardDashboardComponent } from 'src/app/modules/menu/menu-item-card/menu-item-card.component';
import { SettingsService } from './settings.service';
import { TiersWithPricesComponent } from 'src/app/modules/menu/tierMenu/tiers-with-prices/tiers-with-prices.component';
import { LastImageDisplayComponent } from 'src/app/shared/widgets/last-image-display/last-image-display.component';
import { MenuSectionComponent } from 'src/app/modules/display-menu/display-menu-list/menu-section/menu-section.component';
import { FormBuilder } from '@angular/forms';
import { CatalogScheduleInfoComponent } from 'src/app/modules/admin/products/price-schedule/catalog-schedule-info/catalog-schedule-info.component';
import { CatalogScheduleInfoListComponent } from 'src/app/modules/admin/products/price-schedule/catalog-schedule-info-list/catalog-schedule-info-list.component';
export interface IComponent {
  id: string;
  componentRef: string;
}
export interface ValueTypeList {
  filter: string;
  name  : string;
  icon  : string;
  usesRange: boolean;
}

//https://tiberiuzuld.github.io/angular-gridster2/api
//https://stackblitz.com/edit/gridster-in-angular?file=app%2Fapp.component.ts

@Injectable({
  providedIn: 'root'
})
export class GridsterLayoutService {

  designerMode = false; //: boolean;

  public widgetCollection: WidgetModel[];
  public dashboardCollection: DashboardModel[];
  public dashboardID: number;
  public dashboardContentModel: DashboardContentModel;
  public layout: GridsterItem[] = [];
  public components: IComponent[] = [];
  public dropId: string;
  // protected options: GridsterConfig;
  public dashboardId: number;
	public dashboardModel: DashboardModel;
	public dashboardArray: DashboardContentModel[];

  gridSetting: GridsterSettings
  public _gridSetting         = new BehaviorSubject<GridsterSettings>(null);
  public gridSetting$        = this._gridSetting.asObservable();

  public _options         = new BehaviorSubject<boolean>(null);
  public options$        = this._options.asObservable();

  public _dashboardModel      = new BehaviorSubject<DashboardModel>(null);
  public dashboardModel$        = this._dashboardModel.asObservable();

  public _dashboardModels      = new BehaviorSubject<DashboardModel[]>(null);
  public dashboardModels$        = this._dashboardModels.asObservable();

  public _saveChanges      = new BehaviorSubject<boolean>(null);
  public saveChanges$        = this._saveChanges.asObservable();

  dashboardProperties: DashBoardProperties;
  sites: ISite[];

  public rangeTypes = ['year', 'month', 'date', 'week', 'hour','currentDay']

  public menuBoardTypes = [
    {name: 'Menu Section',     icon: 'list',    filter:  'menu'},
    {name: 'Flowers',          icon: 'list',    filter:  'menu'},
    {name: 'Category',         icon: 'list',    filter:  'menu'},
    {name: 'Specials',         icon: 'list',    filter:  'menu'},
    {name: 'Product',          icon: 'product', filter:  'menu'},
    {name: "catalogschedule", icon: 'cart' ,   filter:  'menu'},
    {name: "catalogschedules", icon: 'cart' ,   filter:  'menu'},
    {name: 'FlowerPrices',     icon: 'list',    filter:  'menu'},
    {name: 'POSOrder',         icon: 'cart'   , filter:  'order'},
    {name: 'ClientInfo',       icon: 'cart'   , filter:  'order'},
    {name: 'OrderTotal',       icon: 'cart'   , filter:  'order'},
    {name: 'Limits',           icon: 'production_quantity_limits'   , filter:  'order'},
  ] as ValueTypeList[];

  public cardTypesList =  [
    {name: 'chart'  ,  icon: 'bar_chart', filter: 'none'},
    {name: 'report' ,  icon: 'list',  filter: 'none'},
    {name: 'menu'   ,  icon: 'menu',  filter: 'none'},
    {name: 'tables' ,  icon: 'table', filter: 'none'},
    {name: 'order'  ,  icon: 'shopping_cart',  filter: 'none'},
    {name: 'youtube',  icon: 'smart_display',  filter: 'smart_display'},
    {name: 'iframe' ,  icon: 'whatshot',  filter: 'whatshot'},
    {name: 'text' ,    icon: 'text',  filter: 'textwhatshot'},
    {name: 'image' ,   icon: 'image',  filter: 'image'},

  ] as ValueTypeList[];

  public cardValueTypesList  = [
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

  public cartTypeCollection  = [
    { type: "arcdiagram" , icon: '' },
    { type: "area" , icon: '' },
    { type: "arearange" , icon: '' },
    { type: "areaspline" , icon: '' },
    { type: "areasplinerange" , icon: '' },
    { type: "bar" , icon: 'bar_chart' },
    { type: "bellcurve" , icon: '' },
    { type: "boxplot" , icon: '' },
    { type: "bubble" , icon: 'bubble_chart' },
    { type: "bullet" , icon: '' },
    { type: "column" , icon: '' },
    { type: "columnpyramid" , icon: '' },
    { type: "columnrange" , icon: '' },
    { type: "cylinder" , icon: '' },
    { type: "dependencywheel" , icon: '' },
    { type: "dumbbell" , icon: '' },
    { type: "errorbar" , icon: '' },
    { type: "funnel" , icon: '' },
    { type: "funnel3d" , icon: '' },
    { type: "gauge" , icon: '' },
    { type: "heatmap" , icon: '' },
    { type: "histogram" , icon: '' },
    { type: "item" , icon: '' },
    { type: "line" , icon: 'show_chart' },
    { type: "lollipop" , icon: '' },
    { type: "networkgraph" , icon: '' },
    { type: "organization" , icon: '' },
    { type: "packedbubble" , icon: '' },
    { type: "pareto" , icon: '' },
    { type: "pie" , icon: 'pie_chart' },
    { type: "polygon" , icon: '' },
    { type: "pyramid" , icon: '' },
    { type: "pyramid3d" , icon: '' },
    { type: "sankey" , icon: '' },
    { type: "scatter" , icon: 'scatter_chart' },
    { type: "scatter3d" , icon: '' },
    { type: "solidgauge" , icon: '' },
    { type: "spline" , icon: '' },
    { type: "streamgraph" , icon: '' },
    { type: "sunburst" , icon: '' },
    { type: "tilemap" , icon: '' },
    { type: "timeline" , icon: '' },
    { type: "treemap" , icon: '' },
    { type: "variablepie" , icon: '' },
    { type: "variwide" , icon: '' },
    { type: "vector" , icon: '' },
    { type: "venn" , icon: '' },
    { type: "waterfall" , icon: '' },
    { type: "windbarb" , icon: '' },
    { type: "wordcloud" , icon: '' },
    { type: "xrange" , icon: '' },
  ]

	protected componentCollection = [
		{ name: "Category"    ,  componentInstance  : CategoryItemsBoardComponent },
    { name: "Product"     ,  componentInstance  : MenuItemCardDashboardComponent},
    { name: "MenuSections" , componentInstance  : MenuSectionComponent},
		{ name: "Flowers"     ,  componentInstance  : StrainBoardComponent },
    { name: "FlowerPrices",  componentInstance  : TiersWithPricesComponent},
    { name: "catalogschedule",  componentInstance  : CatalogScheduleInfoComponent},
    { name: "catalogschedules",  componentInstance  : CatalogScheduleInfoListComponent},

		{ name: "Chart"       , componentInstance  : CardDashboardComponent },
    { name: "report"      , componentInstance  : CardComponent },

    { name: "POSOrder"    , componentInstance:   PosOrderBoardComponent },
    { name: "ClientInfo"  , componentInstance:   OrderHeaderDemographicsBoardComponent },
    { name: "OrderTotal"  , componentInstance:   OrderTotalBoardComponent },
    { name: "Limits"      , componentInstance:   LimitValuesCardComponent },
    { name: "lastItemAdded" , componentInstance: LastImageDisplayComponent },

    { name: "Iframe"      , componentInstance: IFrameComponent },
    { name: "YouTube"     , componentInstance: YoutubePlayerComponent },
    // { name: "youtube"       , componentInstance: YoutubePlayerComponent },
	];

  stateChanged: boolean;

  options = {
    gridType: "fit",
    enableEmptyCellDrop: true,
    emptyCellDropCallback: this.onDrop,
    itemChangeCallback: this.itemChange.bind(this),

    pushItems: true,
    swap: true,
    pushDirections: { north: true, east: true, south: true, west: true },

    resizable: { enabled: true },
    draggable: {
      dragHandleClass: "drag-handler",
      dropOverItems: true,
      enabled: true
    },

    displayGrid: "always",
    minCols: 50,
    minRows: 50
} as GridsterConfig

  // options: GridsterConfig
  // public options: GridsterConfig = {
  //   gridType: GridType.Fit,
  //   displayGrid: DisplayGrid.OnDragAndResize, // displayGrid: "always",
  //   enableEmptyCellDrop: true,
  //   emptyCellDropCallback: this.onDrop,
  //   itemChangeCallback: this.itemChange.bind(this),

  //   // emptyCellDropCallback: this.onDrop,
  //   // itemChangeCallback : this.modifyChanges.bind(this),
  //   // resizable: { enabled: true },
  //   // enableEmptyCellDrop: true,

  //   pushItems: true,
  //   swap: true,
  //   pushDirections: { north: true, east: true, south: true, west: true },

  //     // swapWhileDragging: true,
  //     // allowMultiLayer  : true,

  //   resizable: { enabled: true },
  //   draggable: {
  //     dragHandleClass: "drag-handler",
  //     dropOverItems: true,
  //     enabled: true
  //   },
  //   minCols: 50,
  //   minRows: 50,
  //   maxCols: 100,
  //   maxRows: 100,
  //   maxItemRows: 100,
  //   maxItemCols: 100,
  //   maxItemArea: 1000000,
  //   mobileBreakpoint: 640,
  // };

  setOptions(options) {
    this.options = options
  }

  setDefaultOptions() {
    // this.options = this.getDefaultOptions();

    if (!this.options || this.options == undefined)  {
      // console.log(this.options);
      return
    }
    if ( this.options.api == undefined) {
      return;
    }
    this.options.api.optionsChanged();
  }

  getDefaultOptions() {

    return {
			gridType: "fit",
			enableEmptyCellDrop: true,
			emptyCellDropCallback: this.onDrop,
			itemChangeCallback: this.itemChange.bind(this),

      pushItems: true,
			swap: true,
			pushDirections: { north: true, east: true, south: true, west: true },

			resizable: { enabled: true },
      draggable: {
        dragHandleClass: "drag-handler",
        dropOverItems: true,
        enabled: true
      },

			displayGrid: "always",
			minCols: 50,
			minRows: 50
  } as GridsterConfig

    return {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.OnDragAndResize,
      pushItems: true,
      // pushDirections: { north: true, east: true, south: true, west: true },
      swap             : true,
      swapWhileDragging: true,
      allowMultiLayer  : true,
      resizable: { enabled: true },
      enableEmptyCellDrop: true,
      emptyCellDropCallback: this.onDrop,
      itemChangeCallback : this.modifyChanges.bind(this),
      draggable: {
        enabled: true
      },
      // draggable: { enabled: false},
      // resizable: { enabled: true},
      minCols: 100,
      minRows: 100,
      maxCols: 100,
      maxRows: 100,
      maxItemRows: 100,
      maxItemCols: 100,
      maxItemArea: 1000000,
      mobileBreakpoint: 640,
      api: {}
    }
    // return {
    //   gridType: 'fit',
    //   enableEmptyCellDrop: true,
    //   pushItems: true,
    //   swap: true,
    //   pushDirections: { north: true, east: true, south: true, west: true },
    //   resizable: { enabled: true },
    //   draggable: {
    //     enabled: true,
    //     ignoreContent: true,
    //     dropOverItems: true,
    //     dragHandleClass: 'drag-handler',
    //     ignoreContentClass: 'no-drag'
    //   },
    //   displayGrid: 'always',
    //   minCols: 10,
    //   minRows: 10,
    //   api: {}
    // };

    return {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.OnDragAndResize,
      pushItems: true,
			pushDirections: { north: true, east: true, south: true, west: true },
      swap             : true,
      swapWhileDragging: true,
      allowMultiLayer  : true,
      resizable: { enabled: true },
      enableEmptyCellDrop: true,
			emptyCellDropCallback: this.onDrop,
      itemChangeCallback : this.modifyChanges.bind(this),
      // draggable: {
      //   enabled: true
      // },

      draggable: {
        enabled: true,
        ignoreContent: true,
        dropOverItems: true,
        dragHandleClass: 'drag-handler',
        ignoreContentClass: 'no-drag'
      },
      // draggable: { enabled: false},
      // resizable: { enabled: true},
      minCols: 100,
			minRows: 100,
      maxCols: 100,
      maxRows: 100,
      maxItemRows: 100,
      maxItemCols: 100,
      maxItemArea: 1000000,
      mobileBreakpoint: 640,
    };
  }

  constructor(
    private siteService    : SitesService,
    private gridDataService: GridsterDataService,
    private _snackBar      : MatSnackBar,
    private router         : Router,
    private settingsService: SettingsService,
    private fb: FormBuilder,
  ) {
  }

  addItem(): void {
    this.layout.push({
      cols: 5,
      id: UUID.UUID(),
      rows: 5,
      x: 0,
      y: 0
    });
  }

  getGridsterDesignSettings(): Observable<ISetting> {
    const site     = this.siteService.getAssignedSite();
    return this.settingsService.getSettingByName(site, 'GridsterSettings')
  }

  updateDashboardModel(dashboard:DashboardModel, refresh:boolean) {
    if (dashboard) {
      this.dashboardModel = dashboard;
      this.dashboardArray = dashboard.dashboard;
    }
    this._dashboardModel.next(dashboard)
    if (dashboard && refresh) {
      return this.refreshCollection();
    }
    return of(null)
  }

  deleteItem(id: string): void {
    const item = this.layout.find(d => d.id === id);
    this.layout.splice(this.layout.indexOf(item), 1);
    const comp = this.components.find(c => c.id === id);
    this.components.splice(this.components.indexOf(comp), 1);
  }

  setDropId(dropId: string): void {
    this.dropId = dropId;
  }

  dropItem(dragId: string): void {
    const { components }    = this;
    const comp: IComponent  = components.find(c => c.id === this.dropId);
    const updateIdx: number = comp ? components.indexOf(comp) : components.length;
    const componentItem: IComponent = {
      id: this.dropId,
      componentRef: dragId
    };
    this.components = Object.assign([], components, { [updateIdx]: componentItem });
  }

  getComponentRef(id: string): string {
    const comp = this.components.find(c => c.id === id);
    return comp ? comp.componentRef : null;
  }

  deleteModel(model:DashboardModel) {
    const site     = this.siteService.getAssignedSite();
    return this.gridDataService.deleteGrid(site, model.id).pipe(
      switchMap(data => {
        this.refreshCollection();
        return of(data)
      }
    ))
  }

  saveDashBoard() {
    this.dashboardModel.jsonObject  = null;
    const json = JSON.stringify(this.dashboardModel)
    this.dashboardModel.jsonObject = json;
    return  this.saveModel(this.dashboardModel, false)
  }

  saveModel(model:DashboardModel, refresh: boolean) {
    const site     = this.siteService.getAssignedSite();
    let forceRefreshList = false;
    if (model.id == 0) { forceRefreshList = true}
    return this.gridDataService.saveGrid(site, model).pipe(
      switchMap(data => {
        if (data ) {
          if (data.errorMessage) {
            this.notifyEvent('Error Occured: ' + data.errorMessage, 'Failed')
          }
          this.stateChanged = false
          if (refresh) {
            this.updateDashboardModel(data, false)
            this.refreshDashBoard(data?.id);
          }
        }
        return of(data)
      }),catchError( err => {
        this.refreshDashBoard(null);
        this.notifyEvent('Save failed: ' + err, 'Failed')
        console.log('save failed', err)
        return of(err)
      }
    ));
  }

  publish(model$: Observable<DashboardModel>) {
    return  model$.pipe(
      switchMap(data => {
        this.notifyEvent('Saved', "Saved")
        this.updateDashboardModel(data, false)
        return of(data)
      }
    ))
  }

  redirectTo(uri:string, item: any){
    if (item.id == 0) {
      this.router.navigateByUrl('/menu-manager')
      return
    }
    this.getData(item.id);
    this.router.navigateByUrl('/menu-manager', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
  }

  toggleDesignerMode(mode) {
    if (!this.options) { this.setDefaultOptions()}
    this.designerMode = mode;
    this.options.draggable = { enabled: this.designerMode}
    this.changedOptions();

  }

  initGridDesignerMode() {

    try {
      const designerMode = localStorage.getItem('dashBoardDesignerMode')
      let mode = (designerMode == 'true')
      this.designerMode = mode;
      if (!this.options || !this.options.api) { this.setDefaultOptions()}
      this.options.draggable = { enabled: mode}
      this.options.resizable = { enabled: mode}
      this.options.api.optionsChanged();
    } catch (error) {
      // console.log('error', error)
    }

  }

  changedOptions(): void {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
    this._options.next(true)
  }

  forceChangeOptions(): void {
    this.initGridDesignerMode();
    this._options.next(true)
  }

  reloadRoute(route) {
    this.router.navigateByUrl('/menu-board', { skipLocationChange: true }).then(() => {
        this.router.navigate(route);
    });
  }

  refreshDashBoard(id: number) {
    if (id != 0) {
      if (id == null) { return }
      const path = "/menu-board/grid-menu-layout/";
      const item = {id:id};
      this.stateChanged = false;
      const route = [path, item]
      this.reloadRoute(route);
      this.router.navigate([path, item]);
    }
  }

  refreshCollection() {
    const collection$ = this.getCollection()
    return collection$.pipe(
      switchMap( dashboards => {
        this._dashboardModels.next(dashboards)
        this.dashboardCollection = dashboards;
        this.initGridDesignerMode()
        this.changedOptions();
        if (!this.dashboardModel) {
          if (dashboards[0]) {
          }
        } else {
        }
        return of(dashboards)
		}));
  }

  getCollection() {
    const site = this.siteService.getAssignedSite();
		// We make get request to get all dashboards from our REST API
		return this.gridDataService.getGrids(site)
  }

  	// Return Array of WidgetModel
	getWidgets(): Observable<Array<WidgetModel>> {

    let list = [] as WidgetModel[]

    let item = {} as WidgetModel;
    item.name = 'Chart'
    item.identifier = 'chart'
    item.icon = 'analytics'
    item.type = 'analytics'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Report'
    item.identifier = 'Report'
    item.icon = 'list'
    item.type = 'analytics'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Menu'
    item.identifier = 'menu'
    item.icon = 'category'
    item.type = 'menu'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Menu Item'
    item.identifier = 'menuitem'
    item.icon = 'inventory'
    item.type = 'menu'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Menu Section'
    item.identifier = 'menusection'
    item.icon = 'menu'
    item.type = 'menu'
    list.push(item);

    item = {} as WidgetModel;
    item.name       = 'catalog schedule'
    item.identifier = 'catalogschedule'
    item.icon = 'menu'
    item.type = 'menu'
    list.push(item);

    item = {} as WidgetModel;
    item.name       = 'catalog schedules'
    item.identifier = 'catalogschedules'
    item.icon = 'menu'
    item.type = 'menu'
    list.push(item);

    item = {} as WidgetModel;
    item.name       = 'POSOrder'
    item.identifier = 'order'
    item.icon = 'shopping_cart'
    item.type = 'order'
    list.push(item);

    item = {} as WidgetModel;
    item.name       = 'ClientInfo'
    item.identifier = 'clientinfo'
    item.icon = 'person'
    item.type = 'order'
    list.push(item);

    item = {} as WidgetModel;
    item.name       = 'OrderTotal'
    item.identifier = 'ordertotal'
    item.icon = 'credit_card'
    item.type = 'order'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'lastItemAdded'
    item.identifier = 'lastitemadded'
    item.type = 'order'
    item.icon = 'last_page'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Limits'
    item.identifier = 'limits'
    item.type = 'order'
    item.icon = 'production_quantity_limits'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Iframe'
    item.identifier = 'iframe'
    item.icon = 'whatshot'
    item.type = 'advertising'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Youtube'
    item.identifier = 'youtube'
    item.icon = 'smart_display'
    item.type = 'advertising'
    list.push(item);
		return of(list) ;
	}

  getRandomInt(min, max) : number{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  initDashboard() {
    if (!this.dashboardArray) {
      this.dashboardArray = [] as DashboardContentModel[]
    }
    if (!this.dashboardModel)  {
      this.dashboardModel = { } as DashboardModel;
    }
    if (!this.dashboardModel.dashboard) {
      this.dashboardModel.dashboard= [] as DashboardContentModel[]
    }
  }

  onDrop(ev) {

		const componentType = ev.dataTransfer.getData("widgetIdentifier");

    this.initDashboard()
    let model = [] as DashboardContentModel[];
    let id = this.getRandomInt(1, 100000)// +this.dashboardArray.length + 1

    console.log('component type', componentType)
		switch (componentType) {
      case 'youtube' :
        model =  this.applyItem(id, 'YouTube', 'YouTube', YoutubePlayerComponent, ev);
        break;
      case 'iframe' :
        model =   this.applyItem(id, 'IFrame', 'IFrame', IFrameComponent, ev);
        break;
      case 'clientinfo' :
        model =   this.applyItem(id, 'ClientInfo', 'ClientInfo', OrderHeaderDemographicsBoardComponent, ev);
        break;
      case 'limits' :
        model =    this.applyItem(id, 'Limits', 'Limits', LimitValuesCardComponent, ev);
        break;
      case 'lastitemadded' :
        model =    this.applyItem(id, 'lastItemAdded', 'LastItemAdded'  , LastImageDisplayComponent , ev);
        break;
      case 'ordertotal' :
        model =    this.applyItem(id, 'OrderTotal', 'OrderTotal', OrderTotalBoardComponent, ev);
        break;
      case 'order' :
        model =    this.applyItem(id, 'POSOrder', 'POSOrder', PosOrderItemsComponent , ev);
        break;
      case 'chart' :
        model =     this.applyItem(id, 'Chart', 'Chart', CardComponent , ev);
        break;
      case 'menu' :
        model =     this.applyItem(id, 'Category', 'Category', CategoryItemsBoardComponent , ev);
        break;
      case 'menuitem' :
        model =    this.applyItem(id, "Menu Item", 'MenuItem', MenuItemCardDashboardComponent , ev);
        break;
      case 'flowerprices' :
        model =     this.applyItem(id, "Flower Prices", 'FlowerPrices', TiersWithPricesComponent , ev);
        break;
      case 'catalogschedule' :
          model =    this.applyItem(id, "Catalog Schedule", 'catalogschedule', CatalogScheduleInfoComponent , ev);
          break;
      case 'catalogschedules' :
          model =    this.applyItem(id, "Catalog Schedules", 'catalogschedules', CatalogScheduleInfoComponent , ev);
          break;
      case 'menusection' :
        model =    this.applyItem(id, "Menu Section", 'MenuSections', MenuSectionComponent , ev);
        break;

    }
    // console.log('model', model)
    return model;

	}

  applyItem(id: number, name: string, componentName: string, component: any, ev: any) {

    if (componentName) {
      const properties = {} as DashBoardComponentProperties;
      properties.name = componentName;
      let jsonString = ''

      const types = this.componentCollection.filter(data =>
         { return data.name.toLowerCase() === componentName.toLowerCase()}
      )

      console.log('apply item componentName', componentName)
      if (componentName.toLowerCase() === 'catalogschedule'.toLowerCase()) {
        properties.type = 'menu'
        properties.cardValueType = 'catalogschedule'
      }

      if (componentName.toLowerCase() === 'catalogschedules'.toLowerCase()) {
        properties.type = 'menu'
        properties.cardValueType = 'catalogschedulelist'
      }

      if (componentName.toLowerCase() === 'posorder') {
        properties.type = 'order'
        properties.cardValueType = 'POSOrder'
      }
      if (componentName.toLowerCase() === 'clientinfo') {
        properties.type = 'order'
        properties.cardValueType = 'ClientInfo'
      }
      if (componentName.toLowerCase() === 'limits') {
        properties.type = 'order'
        properties.cardValueType = 'limits'
      }
      if (componentName.toLowerCase() === 'lastitemadded') {
        properties.type = 'order'
        properties.cardValueType = 'lastItemAdded'
      }
      if (componentName.toLowerCase() === 'ordertotal') {
        properties.type = 'order'
        properties.cardValueType = 'OrderTotal'
      }

      if (componentName.toLowerCase() === 'menuitem') {
        properties.type = 'menu'
        properties.cardValueType = 'Product'
      }




      if (componentName.toLowerCase() === 'MenuSections'.toLowerCase()) {
        properties.type = 'menu'
        properties.cardValueType = 'Menu Section'
      }

      if (componentName.toLowerCase() === 'menu' || componentName.toLowerCase() === 'menu') {
        properties.type = 'menu'
      }

      if (types && types.length>0) {
        const type  = types[0].name.toLowerCase()
        if (type === 'category'){

        }
        if (type === 'category'){

        }
        if (type === 'category'){

        }
      }



      const x = ev?.target?.offsetTop;
      const y = ev?.target?.offsetLeft;

      // console.log('x,y', x, y)
      jsonString = JSON.stringify(properties)
      const  item = {
        componentName: componentName,
        cols      : 10,
        rows      : 10,
        x         : +x,
        y         : +y,
        component : component,
        name      : name,
        id        :  id,
        properties: jsonString,
      } as DashboardContentModel;

      this.dashboardArray.push(item)
    }

    return this.dashboardArray;
  }

  itemChange():  Observable<any> {
    return this.saveModelUpdate()
  }

  saveModelUpdate() {
    this.initDashboard()
    this.dashboardModel.dashboard = this.dashboardArray;
    let  tmp = JSON.stringify(this.dashboardModel);
    // console.log('tep model', tmp)
    let parsed: DashboardModel = JSON.parse(tmp);
    // console.log('tep model', parsed)
    this.serialize(parsed);
    // console.log('tep model', parsed)
    this.dashboardModel.jsonObject  = tmp;
    return this.saveModel(this.dashboardModel, false);
  }

  modifyChanges() {
    this.stateChanged = true
  }

  getData(id: number) {
    const site = this.siteService.getAssignedSite();
    if (id == 0 || id == undefined) {
      this.router.navigateByUrl('/menu-manager')
      return
    }

    const gridData$ = this.gridDataService.getGrid(site, id)
    gridData$.subscribe({
      next: data => {
        this.dashboardModel = data
        this.dashboardProperties = {}  as DashBoardProperties
        if (this.dashboardModel.userName) {
          this.dashboardProperties = JSON.parse(data.userName)  as DashBoardProperties
        }

        if (this.dashboardModel.widgetRolesJSON) {
          this.dashboardModel.widgetRoles = JSON.parse(data.widgetRolesJSON)  as widgetRoles[]
        }

        this.parseJson(data)
        this.dashboardArray =  data.dashboard;
        this.dashboardArray.forEach(data => {
          data.layerIndex = 1;
          if (data.properties) {
            data.object = JSON.parse(data.properties)
            if (data?.object?.layerIndex)  {
              data.layerIndex = data?.object?.layerIndex
            }
          }
        })
        this.updateDashboardModel(data, true)
      }
    })
	}

  getDataOBS(id: number, ignoreManager?: boolean): Observable<DashboardModel> {
    const site = this.siteService.getAssignedSite();

    if (id == 0 || id == undefined) {
      if (ignoreManager) {
        this.router.navigateByUrl('/menu-manager')
      }
    }

    let gridData$ = this.gridDataService.getGrid(site, id)

    return gridData$.pipe(
      switchMap( data => {
        this.dashboardModel = data
        this.dashboardProperties = {}  as DashBoardProperties
        if (this.dashboardModel.userName) {
          this.dashboardProperties = JSON.parse(data.userName)  as DashBoardProperties
        }

        if (this.dashboardModel.widgetRolesJSON) {
          this.dashboardModel.widgetRoles = JSON.parse(data.widgetRolesJSON)  as widgetRoles[]
        }

        this.parseJson(data)
        this.dashboardArray =  data.dashboard;
        this.dashboardArray.forEach(data => {
          data.layerIndex = 1;
          if (data.properties) {
            data.object = JSON.parse(data.properties)
            if (data?.object?.layerIndex)  {
              data.layerIndex = data?.object?.layerIndex
            }
          }
        })

        this.updateDashboardModel(data, true)
        return of(data)
      })
    );

    return gridData$;
	}

  removeCard(item) {
    const dashBoard = this.dashboardModel;
    const list = dashBoard.dashboard.filter( data => data.id != item.id)
    dashBoard.dashboard = list;
    this.dashboardArray = list;
    this.dashboardModel.dashboard = list;
  }

  parseJson(dashboardModel: DashboardModel) {
		// We loop on our dashboardCollection
    if (!dashboardModel.dashboard) {    dashboardModel.dashboard = [] as DashboardContentModel[]  }
		dashboardModel.dashboard.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
        if (dashboard.componentName) {
          if (dashboard.componentName.toLowerCase() === component.name.toLowerCase()) {
            dashboard.component = component.componentInstance;
          }
        }
			});
		});
	}

  initComponentComplexData(item: DashboardContentModel): DashboardContentModel {
    const properties = JSON.parse(item.properties)
    item.object      = this.getDateRange(properties);
    return item;
  }

  //date range type is year month day etc.
  getDateRange(item: DashBoardComponentProperties ) {
    //if dateRangeReport then use the filter variable date ranges.
    //otherwise use
    if (!item?.dateRangeReport) {
      //then we have to figure out the date range
      if (item.rangeValue) {
        if (item.rangeType === 'year') {

        }
        if (item.rangeType === 'month') {

        }
        if (item.rangeType === 'week') {

        }
        if (item.rangeType === 'date') {

        }
      }
    }
    return item;
  }

	serialize(dashboardModel: DashboardModel) {
    if (!dashboardModel.dashboard) {
      return
    }

		dashboardModel.dashboard.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
        if (dashboard.componentName) {
          console.log('serialize', dashboard.componentName, component.name.toLowerCase())
          if (dashboard.componentName.toLowerCase() === component.name.toLowerCase()) {
            dashboard.component = component?.name;
          }
        }
			});
		});
	}

    notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


  initGridFormProperties() {
    return this.fb.group({
      id            : [''], //
      name          : [''], // : string;
      roles         : [''], // : widgetRoles[]
      menuType      : [''], // : string;
      listItemID     : [''], //: string;
      opacity        : [''], //: number;
      borderRadius   : [''], //: number;
      border         : [''], //: number;
      layerIndex       : [''], //: number;
      disableActions : [''], //: boolean;
      disableActionView: [''],
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

      autoPlay       : [''], //: boolean;
      url            : [''], //: string;
      autoRepeat     : [''], //: boolean;

      refreshTime    : [''], //: number;
      rangeValue     : [''], //: number;
      dateRangeReport: [''], //: boolean;
      productName    : [''], //: boolean;

      text: [],
      image  : [],//      = item?.image;
      ccs: [],
    })
  }

}
