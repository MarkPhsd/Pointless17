import { Injectable } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { UUID } from 'angular2-uuid';
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel, DashBoardProperties, WidgetModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDashboardService } from './gridster-dashboard.service';
import { GridsterDataService } from '../gridster/gridster-data.service';
import { SitesService } from '../reporting/sites.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { StrainBoardComponent } from 'src/app/modules/tv-menu/strainBoard/strain-board/strain-board.component';

export interface IComponent {
  id: string;
  componentRef: string;
}

@Injectable({
  providedIn: 'root'
})
export class GridsterLayoutService {

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

	protected componentCollection = [
		{ name: "Chart"     , componentInstance: CardComponent },
		{ name: "Chart"     , componentInstance: CardComponent },
		{ name: "Flowers"   , componentInstance: StrainBoardComponent }
	];

  stateChanged: boolean;

  // public options: GridsterConfig = {

  //   gridType: "fit",
  //   enableEmptyCellDrop: true,
  //   emptyCellDropCallback: this.onDrop,
  //   pushItems: true,
  //   swap: true,
  //   pushDirections: { north: true, east: true, south: true, west: true },
  //   resizable: { enabled: true },
  //   itemChangeCallback: this.itemChange.bind(this),
  //   draggable: {
  //     enabled: true,
  //     // ignoreContent: true,
  //     // dropOverItems: true,
  //     // dragHandleClass: "drag-handler",
  //     // ignoreContentClass: "drag",
  //   },
  //   displayGrid: "always",
  //   minCols: 250,
  //   minRows: 250,

  // };

  constructor(
    private siteService    : SitesService,
    private gridDataService: GridsterDataService,
    private _snackBar      : MatSnackBar,
    private router         : Router,
    private _ds            : GridsterDashboardService) { }

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
    this.getData(item.id);
    this.router.navigateByUrl('/menu-manager', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
  }

  forceRefresh(id: any) {
    if (!id) {
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
    const site = this.siteService.getAssignedSite();
		// We make get request to get all dashboards from our REST API
		this.gridDataService.getGrids(site).subscribe(dashboards => {
			this.dashboardCollection = dashboards;
      if (!this.dashboardModel) {
        if (dashboards[0]) {
          // const dashboard = dashboards[0]
          // console.log(dashboard.id, dashboard)
          // this.forceRefresh(dashboard.id)
        }

      } else {
        // this.forceRefresh(this.dashboardModel.id.toString())
      }
		});
  }

  onDrop(ev) {
		const componentType = ev.dataTransfer.getData("widgetIdentifier");
    // console.log(componentType)
		// switch (componentType) {
		// 	case "radar_chart":
    //     let item = {
		// 			cols: 5,
		// 			rows: 5,
		// 			x: 0,
		// 			y: 0,
		// 			component: CardComponent,
		// 			name: "Radar Chart",
		// 			id: 0,
		// 			properties:  ''
		// 		} as DashboardContentModel;
    //     return this.dashboardArray.push(item);
		// 	case "line_chart":
    //      item = {
		// 			cols: 5,
		// 			rows: 5,
		// 			x: 0,
		// 			y: 0,
		// 			component: CardComponent,
		// 			name: "Line Chart",
		// 			id: 0,
		// 			properties: '0'
    //     } as DashboardContentModel;
    //     return this.dashboardArray.push(item);
		// 	case "doughnut_chart":
    //      item = {
		// 			cols: 5,
		// 			rows: 5,
		// 			x: 0,
		// 			y: 0,
		// 			component: CardComponent,
		// 			name: "Doughnut Chart",
		// 			id: 0,
		// 			properties: ''
    //     } as DashboardContentModel;
    //     this.dashboardArray.push(item);
		// }

    const itemProperties = {} as  DashBoardComponentProperties;
    if (!this.dashboardArray) {
      this.dashboardArray = [] as DashboardContentModel[]
    }

    let id = +this.dashboardArray.length + 1
    console.log(ev)
    let item = {
      cols: 50,
      rows: 50,
      x: 40,
      y: 40,
      component: CardComponent,
      name: "Chart",
      componentName: 'Chart',
      id:  id,
      properties: '',
    } as DashboardContentModel;

    this.itemChange(item)

	}

  getData(id: number) {
    const site = this.siteService.getAssignedSite();
    const gridData$ = this.gridDataService.getGrid(site, id)

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
    if (!dashboardModel.dashboard) {
      dashboardModel.dashboard = [] as DashboardContentModel[]
    }
		dashboardModel.dashboard.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (dashboard.componentName === component.name) {
					// If it is, we replace our serialized key by our component instance
					dashboard.component = component.componentInstance;
				}
			});
		});
	}

	serialize(dashboardModel: DashboardModel) {
		// We loop on our dashboardCollection
    if (!dashboardModel.dashboard) { return }
		dashboardModel.dashboard.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (dashboard.componentName === component.name) {
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
