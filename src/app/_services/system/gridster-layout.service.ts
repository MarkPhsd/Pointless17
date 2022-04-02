import { Injectable } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { UUID } from 'angular2-uuid';
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { ActivatedRoute } from '@angular/router';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDashboardService } from './gridster-dashboard.service';
import { GridsterDataService } from '../gridster/gridster-data.service';
import { SitesService } from '../reporting/sites.service';

export interface IComponent {
  id: string;
  componentRef: string;
}

@Injectable({
  providedIn: 'root'
})
export class GridsterLayoutService {

  public dashboardID: number;

  public dashboardContentModel: DashboardContentModel;
  public layout: GridsterItem[] = [];
  public components: IComponent[] = [];
  public dropId: string;
  // protected options: GridsterConfig;

  public dashboardId: number;
	public dashboardModel: DashboardModel;
	public dashboardArray: DashboardContentModel[];

	protected componentCollection = [
		{ name: "Line Chart"    , componentInstance: CardComponent },
		{ name: "Doughnut Chart", componentInstance: CardComponent },
		{ name: "Radar Chart"   , componentInstance: CardComponent }
	];

  public options: GridsterConfig = {

      gridType: "fit",
      enableEmptyCellDrop: true,
      emptyCellDropCallback: this.onDrop,
      pushItems: true,
      swap: true,
      pushDirections: { north: true, east: true, south: true, west: true },
      resizable: { enabled: true },
      itemChangeCallback: this.itemChange.bind(this),
      draggable: {
        enabled: true,
        // ignoreContent: true,
        // dropOverItems: true,
        // dragHandleClass: "drag-handler",
        // ignoreContentClass: "drag",
      },
      displayGrid: "always",
      minCols: 10,
      minRows: 10

  };

  constructor(
    private siteService    : SitesService,
    private gridDataService: GridsterDataService,
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

	itemChange() {
    this.saveDashBoard()
  }

  saveDashBoard() {
    const site     = this.siteService.getAssignedSite();
    let jsonObject = JSON.stringify(this.dashboardModel);
    this.dashboardModel.jSONBject = jsonObject
    // let parsed: DashboardModel = JSON.parse(tmp);
    // this.serialize(parsed.dashboard);
    console.log(this.dashboardModel);
    this.gridDataService.updateGrid(site, this.dashboardModel).subscribe(
      {
        next: data => {
          console.log('saved',data)
        },
        error: err => {
          console.log('save failed', err)
        }
      }
    );
  }

  onDrop(ev) {
		const componentType = ev.dataTransfer.getData("widgetIdentifier");
    console.log(componentType)
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
    let item = {
      cols: 5,
      rows: 5,
      x: 0,
      y: 0,
      component: CardComponent,
      name: "Doughnut Chart",
      id: 0,
      properties: itemProperties,
    } as DashboardContentModel;

    if (!this.dashboardArray){ this.dashboardArray = [] as DashboardContentModel[]}
    this.dashboardArray.push(item);
    this.dashboardModel.dashboard = this.dashboardArray;
    console.log('this.dashboardModel', this.dashboardModel)
    return this.dashboardArray;

	}

  	// Super TOKENIZER 2.0 POWERED BY NATCHOIN
	parseJson(dashboardModel: DashboardModel) {
		// We loop on our dashboardCollection
    console.log('json', dashboardModel)
    if (!dashboardModel.dashboard) { return }

		dashboardModel.dashboard.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (dashboard.component === component.name) {
					// If it is, we replace our serialized key by our component instance
					dashboard.component = component.componentInstance;
				}
			});
		});

	}

	serialize(dashboardModel) {
		// We loop on our dashboardCollection

    console.log('json', dashboardModel)
    if (!dashboardModel.dashboard) { return }
		dashboardModel.forEach(dashboard => {
			// We loop on our componentCollection
			this.componentCollection.forEach(component => {
				// We check if component key in our dashboardCollection
				// is equal to our component name key in our componentCollection
				if (dashboard.name === component.name) {
					dashboard.component = component.name;
				}
			});
		});
	}

}
