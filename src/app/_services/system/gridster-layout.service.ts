import { Injectable } from '@angular/core';
import {CompactType, DisplayGrid, Draggable, GridsterConfig, GridsterItem, GridType, PushDirections, Resizable} from 'angular-gridster2';
import { UUID } from 'angular2-uuid';
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel, DashBoardProperties, WidgetModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDataService } from '../gridster/gridster-data.service';
import { SitesService } from '../reporting/sites.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StrainBoardComponent } from 'src/app/modules/tv-menu/strainBoard/strain-board/strain-board.component';
import { AuthenticationService } from './authentication.service';
import { CategoryItemsBoardComponent } from 'src/app/modules/tv-menu/category-items-board/category-items-board.component';
import { PosOrderItemsComponent } from 'src/app/modules/posorders/pos-order/pos-order-items/pos-order-items.component';
import { MenuitemComponent } from 'src/app/modules/menu/menuitem/menuitem.component';
import { PosOrderBoardComponent } from 'src/app/modules/posorders/pos-order/pos-order-board/pos-order-board.component';
import { OrderHeaderDemographicsBoardComponent } from 'src/app/modules/posorders/pos-order/order-header-demographics-board/order-header-demographics-board.component';
import { OrderTotalBoardComponent } from 'src/app/modules/posorders/pos-order/order-total-board/order-total-board.component';
import { IFrameComponent } from 'src/app/shared/widgets/i-frame/i-frame.component';
import { YoutubePlayerComponent } from 'src/app/shared/widgets/youtube-player/youtube-player.component';
import { LimitValuesCardComponent } from 'src/app/modules/posorders/limit-values-card/limit-values-card.component';
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
  dashboardProperties: DashBoardProperties;

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
		{ name: "Category"      , componentInstance: CategoryItemsBoardComponent },
		{ name: "Flowers"       , componentInstance: StrainBoardComponent },
    { name: "MenuItem"      , componentInstance: MenuitemComponent },

		{ name: "Chart"         , componentInstance: CardComponent },
    { name: "report"         , componentInstance: CardComponent },

    { name: "POSOrder"      , componentInstance: PosOrderBoardComponent },
    { name: "ClientInfo"    , componentInstance: OrderHeaderDemographicsBoardComponent },
    { name: "OrderTotal"    , componentInstance: OrderTotalBoardComponent },
    { name: "Limits"         , componentInstance: LimitValuesCardComponent },

    { name: "Iframe"        , componentInstance: IFrameComponent },
    { name: "YouTube"       , componentInstance: YoutubePlayerComponent },
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
    private  authService   : AuthenticationService,
) { }

  addItem(): void {
    this.layout.push({
      cols: 5,
      id: UUID.UUID(),
      rows: 5,
      x: 0,
      y: 0
    });
  }

  updateDashboardModel(dashboard:DashboardModel) {
    this.dashboardModel = dashboard;
    this.dashboardArray = dashboard.dashboard;
    this._dashboardModel.next(dashboard)
    // collection = this.layoutService.dashboardCollection;
    this.refreshCollection();
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
    this.dashboardModel.dashboard = this.dashboardArray;
    let  tmp = JSON.stringify(this.dashboardModel);

    let parsed: DashboardModel = JSON.parse(tmp);
    this.serialize(parsed);
    this.dashboardModel.jsonObject  = tmp;
    this.saveModel(this.dashboardModel);
  }

  saveDashBoard() {
    this.dashboardModel.jsonObject  = null;
    const json = JSON.stringify(this.dashboardModel)
    this.dashboardModel.jsonObject = json;
    this.saveModel(this.dashboardModel)
  }

  saveModel(model:DashboardModel) {
    const site     = this.siteService.getAssignedSite();
    this.dashboardArray = null
    this.dashboardModel = null
    let forceRefreshList = false;
    if (model.id == 0) { forceRefreshList = true}
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
    }  else {this.designerMode = false;  }
    this.options.draggable = { enabled: this.designerMode}
    this.options.resizable = { enabled: this.designerMode}
    this.changedOptions();
  }

  changedOptions(): void {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    }
  }
  forceChangeOptions(): void {
    // if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();
    // }
  }


  forceRefresh(id: number) {
    if (id == 0) {
      console.log('this id was empty')
      this.router.navigate(["/menu-manager/"]);
      return;
    }
    const path = "/menu-manager/grid-menu-layout/"
    const item = {id:id};
    this.stateChanged = false
    this.getData(+id)
    this.router.navigate([path]);
  }

  refreshCollection() {
    const collection$ = this.getCollection()
    collection$.subscribe(dashboards => {
      console.log(dashboards)
			this.dashboardCollection = dashboards;
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
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Menu'
    item.identifier = 'menu'
    item.icon = 'category'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Menu Item'
    item.identifier = 'menuitem'
    item.icon = 'inventory'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'POSOrder'
    item.identifier = 'order'
    item.icon = 'shopping_cart'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'ClientInfo'
    item.identifier = 'clientinfo'
    item.icon = 'person'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'OrderTotal'
    item.identifier = 'ordertotal'
    item.icon = 'credit_card'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Limits'
    item.identifier = 'limits'
    item.icon = 'production_quantity_limits'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Iframe'
    item.identifier = 'iframe'
    item.icon = 'whatshot'
    list.push(item);

    item = {} as WidgetModel;
    item.name = 'Youtube'
    item.identifier = 'youtube'
    item.icon = 'smart_display'
    list.push(item);

		return of(list) ;
	}

  onDrop(ev) {
		const componentType = ev.dataTransfer.getData("widgetIdentifier");
    console.log(componentType)

    const itemProperties = {} as  DashBoardComponentProperties;
    if (!this.dashboardArray) {
      this.dashboardArray = [] as DashboardContentModel[]
    }
    let item = {} as DashboardContentModel;
    let id = +this.dashboardArray.length + 1

		switch (componentType) {
      case 'youtube' :
        item = {
         cols: 40,
         rows: 40,
         x: 0,
         y: 0,
         component: YoutubePlayerComponent,
         name: "YouTube",
         componentName: 'youtube',
         id:  id,
         properties: '',
       } as DashboardContentModel;
       this.itemChange(item);
       return this.dashboardArray.push(item);
      case 'iframe' :
        item = {
         cols: 40,
         rows: 40,
         x: 0,
         y: 0,
         component: IFrameComponent,
         name: "IFrame",
         componentName: 'IFrame',
         id:  id,
         properties: '',
       } as DashboardContentModel;
       this.itemChange(item);
       return this.dashboardArray.push(item);
      case 'clientinfo' :
         item = {
          cols: 40,
          rows: 40,
          x: 0,
          y: 0,
          component: OrderHeaderDemographicsBoardComponent,
          name: "ClientInfo",
          componentName: 'ClientInfo',
          id:  id,
          properties: '',
        } as DashboardContentModel;
        this.itemChange(item);
        return this.dashboardArray.push(item);
      case 'limits' :
          item = {
           cols: 40,
           rows: 40,
           x: 0,
           y: 0,
           component: LimitValuesCardComponent,
           name: "Limits",
           componentName: 'Limits',
           id:  id,
           properties: '',
         } as DashboardContentModel;
         this.itemChange(item);
         return this.dashboardArray.push(item);
      case 'ordertotal' :
         item = {
          cols: 40,
          rows: 40,
          x: 0,
          y: 0,
          component: OrderTotalBoardComponent,
          name: "OrderTotal",
          componentName: 'OrderTotal',
          id:  id,
          properties: '',
        } as DashboardContentModel;
        this.itemChange(item);
        return this.dashboardArray.push(item);
      case 'order' :
         item = {
          cols: 40,
          rows: 40,
          x: 0,
          y: 0,
          component: PosOrderItemsComponent,
          name: "POSOrder",
          componentName: 'POSOrder',
          id:  id,
          properties: '',
        } as DashboardContentModel;
        this.itemChange(item);
        return this.dashboardArray.push(item);
      case 'chart' :
           item = {
            cols: 40,
            rows: 40,
            x: 0,
            y: 0,
            component: CardComponent,
            name: "Chart",
            componentName: 'Chart',
            id:  id,
            properties: '',
          } as DashboardContentModel;
          this.itemChange(item);
          return this.dashboardArray.push(item);
      case 'menu' :
            item = {
             cols: 40,
             rows: 40,
             x: 0,
             y: 0,
             component: CategoryItemsBoardComponent,
             name: "Category",
             componentName: 'Category',
             id:  id,
             properties: '',
           } as DashboardContentModel;
           this.itemChange(item);
           return this.dashboardArray.push(item);
      case 'menuitem' :
           item = {
            cols: 40,
            rows: 40,
            x: 0,
            y: 0,
            component: MenuitemComponent,
            name: "Menu Item",
            componentName: 'MenuItem',
            id:  id,
            properties: '',
          } as DashboardContentModel;
          this.itemChange(item);
          return this.dashboardArray.push(item);
    }
	}

  modifyChanges() {
    this.stateChanged = true
  }

  getData(id: number) {
    const site = this.siteService.getAssignedSite();
    const gridData$ = this.gridDataService.getGrid(site, id)
    if (id == 0) {
      this.router.navigateByUrl('/menu-manager')
      return
    }
    gridData$.subscribe({
      next: data => {
        this.dashboardModel = data
        this.dashboardProperties = {}  as DashBoardProperties
        if (this.dashboardModel.userName) {
          this.dashboardProperties = JSON.parse(data.userName)  as DashBoardProperties
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

  removeCard(item) {
    const dashBoard = this.dashboardModel;
    const list = dashBoard.dashboard.filter( data => data.id != item.id)
    dashBoard.dashboard = list;
    this.dashboardArray = list;
    this.dashboardModel.dashboard = list;
  }

  // Super TOKENIZER 2.0 POWERED BY NATCHOIN
	parseJson(dashboardModel: DashboardModel) {
		// We loop on our dashboardCollection

    console.log(this.componentCollection)
    console.log(dashboardModel.dashboard)
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

	serialize(dashboardModel: DashboardModel) {
		// We loop on our dashboardCollection
    console.log(this.componentCollection)
    console.log(dashboardModel.dashboard)
    if (!dashboardModel.dashboard) { return }

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
