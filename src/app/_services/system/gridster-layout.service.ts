import { Injectable } from '@angular/core';
import { DisplayGrid, GridsterConfig, GridsterItem, GridType, } from 'angular-gridster2';
import { UUID } from 'angular2-uuid';
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel, DashBoardProperties, WidgetModel, widgetRoles } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDataService } from '../gridster/gridster-data.service';
import { SitesService } from '../reporting/sites.service';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StrainBoardComponent } from 'src/app/modules/tv-menu/strainBoard/strain-board/strain-board.component';
import { AuthenticationService } from './authentication.service';
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
export interface IComponent {
  id: string;
  componentRef: string;
}

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

  public _dashboardModel      = new BehaviorSubject<DashboardModel>(null);
  public dashboardModel$        = this._dashboardModel.asObservable();

  public _dashboardModels      = new BehaviorSubject<DashboardModel[]>(null);
  public dashboardModels$        = this._dashboardModels.asObservable();

  dashboardProperties: DashBoardProperties;
  sites: ISite[];
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
		{ name: "Category"    , componentInstance: CategoryItemsBoardComponent },
    { name: "Product"     , componentInstance: MenuItemCardDashboardComponent},
		{ name: "Flowers"     , componentInstance: StrainBoardComponent },
    { name: "FlowerPrices", componentInstance: TiersWithPricesComponent},

		{ name: "Chart"       , componentInstance: CardDashboardComponent },
    { name: "report"      , componentInstance: CardComponent },

    { name: "POSOrder"    , componentInstance: PosOrderBoardComponent },
    { name: "ClientInfo"  , componentInstance: OrderHeaderDemographicsBoardComponent },
    { name: "OrderTotal"  , componentInstance: OrderTotalBoardComponent },
    { name: "Limits"      , componentInstance: LimitValuesCardComponent },
    { name: "lastItemAdded" , componentInstance: LastImageDisplayComponent },

    { name: "Iframe"      , componentInstance: IFrameComponent },
    { name: "YouTube"     , componentInstance: YoutubePlayerComponent },
    // { name: "youtube"       , componentInstance: YoutubePlayerComponent },
	];

  stateChanged: boolean;

  public options: GridsterConfig = {

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

  };

  constructor(
    private siteService    : SitesService,
    private gridDataService: GridsterDataService,
    private _snackBar      : MatSnackBar,
    private router         : Router,
    private authService    : AuthenticationService,
    private settingsService: SettingsService,
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

  updateDashboardModel(dashboard:DashboardModel) {
    if (dashboard) {
      this.dashboardModel = dashboard;
      this.dashboardArray = dashboard.dashboard;
    }
    this._dashboardModel.next(dashboard)
    if (dashboard) {
      this.refreshCollection();
    }
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

  itemChange(item) {
    if (item) { {
        if (!this.dashboardModel.dashboard) {
          this.dashboardModel.dashboard = []
        }
       this.dashboardModel.dashboard.push(item)
      }
    }
    try {
      this.dashboardModel.dashboard = this.dashboardArray;

      let  tmp = JSON.stringify(this.dashboardModel);

      let parsed: DashboardModel = JSON.parse(tmp);
      this.serialize(parsed);
      this.dashboardModel.jsonObject  = tmp;
      this.saveModel(this.dashboardModel);
    } catch (error) {
      console.log(error)
    }
  }

  saveDashBoard() {
    this.dashboardModel.jsonObject  = null;
    const json = JSON.stringify(this.dashboardModel)
    this.dashboardModel.jsonObject = json;
    this.saveModel(this.dashboardModel)
  }

  deleteModel(model:DashboardModel) {
    const site     = this.siteService.getAssignedSite();
    this.gridDataService.deleteGrid(site, model.id).subscribe(data => {
      this.refreshCollection();
    })

  }

  saveModel(model:DashboardModel) {
    const site     = this.siteService.getAssignedSite();
    this.dashboardArray = null
    this.dashboardModel = null
    let forceRefreshList = false;
    if (model.id == 0) { forceRefreshList = true}
    // console.log(model)
    this.gridDataService.saveGrid(site, model).subscribe(
      {
        next: data => {
          if (data.errorMessage) {
            this.notifyEvent('Error Occured: ' + data.errorMessage, 'Failed')
          }
          this.dashboardArray = data.dashboard;
          this.dashboardModel = data;
          this.stateChanged = false
          this.updateDashboardModel(data)
          this.forceRefresh(data.id);
          if (forceRefreshList) {
            this.refreshCollection();
          }
        },
        error: err => {
          this.forceRefresh(null);
          this.notifyEvent('Save failed: ' + err, 'Failed')
          console.log('save failed', err)
        }
      }
    );
  }

  publish(model$: Observable<DashboardModel>) {
    model$.subscribe(
      {
        next : data =>{
          this.notifyEvent('Saved', "Saved")
          this.updateDashboardModel(data)
        },
        error: err => {
            this.notifyEvent(err, "Failure")
        }
      }
    )
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

    if (this.authService.isAuthorized)  {
      this.designerMode = mode

      const designerMode = localStorage.getItem('dashBoardDesignerMode')
      if (designerMode === 'true' || designerMode === 'false') {
        mode = (designerMode == 'true')
        if (designerMode) {
          this.designerMode = mode
        }
      }


    }  else {
      this.designerMode = false;
    }

    this.options.draggable = { enabled: mode}
    this.options.resizable = { enabled: mode}
    this.changedOptions();
  }

  initGridDesignerMode() {
    const designerMode = localStorage.getItem('dashBoardDesignerMode')
    let mode = (designerMode == 'true')
    this.designerMode = mode;
    this.options.draggable = { enabled: mode}
    this.options.resizable = { enabled: mode}
  }


  changedOptions(): void {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }

  forceChangeOptions(): void {
    this.initGridDesignerMode();
    this.options.api.optionsChanged();
  }

  reloadRoute(route) {
    this.router.navigateByUrl('/menu-board', { skipLocationChange: true }).then(() => {
        this.router.navigate(route);
    });
  }

  forceRefresh(id: number) {
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
    collection$.subscribe(dashboards => {
      this._dashboardModels.next(dashboards)
			this.dashboardCollection = dashboards;
      this.initGridDesignerMode()
      this.changedOptions();
      if (!this.dashboardModel) {
        if (dashboards[0]) {

        }
      } else {
        // this.forceRefresh(this.dashboardModel.id.toString())
      }
		});
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
    item.name = 'POSOrder'
    item.identifier = 'order'
    item.icon = 'shopping_cart'
    item.type = 'order'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'ClientInfo'
    item.identifier = 'clientinfo'
    item.icon = 'person'
    item.type = 'order'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'OrderTotal'
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

  onDrop(ev) {
		const componentType = ev.dataTransfer.getData("widgetIdentifier");
    // console.log(componentType)

    if (!this.dashboardArray) {
      this.dashboardArray = [] as DashboardContentModel[]
    }
    if (!this.dashboardModel.dashboard) {
      this.dashboardModel.dashboard= [] as DashboardContentModel[]
    }

    let id = this.getRandomInt(1, 100000)// +this.dashboardArray.length + 1

		switch (componentType) {
      case 'youtube' :
        this.applyItem(id, 'YouTube', 'YouTube', YoutubePlayerComponent );
        return;
      case 'iframe' :
        this.applyItem(id, 'IFrame', 'IFrame', IFrameComponent );
        return;
      case 'clientinfo' :
        this.applyItem(id, 'ClientInfo', 'ClientInfo', OrderHeaderDemographicsBoardComponent );
        return
      case 'limits' :
        this.applyItem(id, 'Limits', 'Limits', LimitValuesCardComponent );
         return
      case 'lastitemadded' :
        this.applyItem(id, 'lastItemAdded', 'LastItemAdded'  , LastImageDisplayComponent );
        return
      case 'ordertotal' :
        this.applyItem(id, 'OrderTotal', 'OrderTotal', OrderTotalBoardComponent );
        return
      case 'order' :
        this.applyItem(id, 'POSOrder', 'POSOrder', PosOrderItemsComponent );
        return
      case 'chart' :
        this.applyItem(id, 'Chart', 'Chart', CardComponent );
        return
      case 'menu' :
        this.applyItem(id, 'Category', 'Category', CategoryItemsBoardComponent );
        return
      case 'menuitem' :
        this.applyItem(id, "Menu Item", 'MenuItem', MenuItemCardDashboardComponent );
        return
      case 'flowerprices' :
       this.applyItem(id, "Flower Prices", 'FlowerPrices', TiersWithPricesComponent );
        return
    }
	}

  applyItem(id: number, name: string, componentName: string, component: any) {
    if (!this.dashboardArray) { return }
    // console.log(name,componentName)
    const properties = {} as DashBoardComponentProperties;
    properties.name = componentName;
    let jsonString = ''

    if (componentName) {

      const types = this.componentCollection.filter(data =>
         { return data.name.toLowerCase() === componentName.toLowerCase()}
      )

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

      if (componentName.toLowerCase() === 'lastItemAdded') {
        properties.type = 'menu'
        properties.cardValueType = 'Product'
      }

      // case 'limits' :
      //   this.applyItem(id, 'lastItemAdded', 'Last Item Added'  , LastImageDisplayComponent );
      //   return

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

      jsonString = JSON.stringify(properties)

    }

    const  item = {
      componentName: componentName,
      cols      : 40,
      rows      : 40,
      x         : 0,
      y         : 0,
      component : component,
      name      : name,
      id        :  id,
      properties: jsonString,
    } as DashboardContentModel;

    this.itemChange(item);
    if (this.dashboardModel) {
      if (!this.dashboardModel.dashboard) {
        this.dashboardModel.dashboard = [] as DashboardContentModel[]
      }
      this.dashboardModel.dashboard.push(item)
    }
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
        this.updateDashboardModel(data)
      }
    })
	}

  getDataOBS(id: number, ignoreManager?: boolean): Observable<DashboardModel> {
    const site = this.siteService.getAssignedSite();

    if (id == 0 || id == undefined) {
      if (ignoreManager) {
        this.router.navigateByUrl('/menu-manager')
        // return of(null)
        // console.log('ignore managemr')
      }
    }

    let gridData$ = this.gridDataService.getGrid(site, id)
    // console.log('getDataOBS')

    return gridData$.pipe(
      switchMap( data => {
        // console.log('site', site.url);
        // console.log('grd data', data);
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

        // console.log('dashboard model', data)
        this.updateDashboardModel(data)

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

    if (!dashboardModel.dashboard) {
      dashboardModel.dashboard = [] as DashboardContentModel[]
    }

		dashboardModel.dashboard.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
        if (dashboard.componentName.toLowerCase() === component.name.toLowerCase()) {
					dashboard.component = component.componentInstance;
				}
			});
		});
	}

  initComponentComplexData(item: DashboardContentModel): DashboardContentModel {
    const properties = JSON.parse(item.properties)
    // console.log(properties)
    item.object = this.getDateRange(properties);
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
				if (dashboard.componentName.toLowerCase() === component.name.toLowerCase()) {
					dashboard.component = component.name;
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

}
