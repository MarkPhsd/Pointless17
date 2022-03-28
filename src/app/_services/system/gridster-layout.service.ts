import { Injectable } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { UUID } from 'angular2-uuid';
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { ActivatedRoute } from '@angular/router';
import { DashboardContentModel, DashboardModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDashboardService } from './gridster-dashboard.service';

export interface IComponent {
  id: string;
  componentRef: string;
}

@Injectable({
  providedIn: 'root'
})
export class GridsterLayoutService {

  public dashBoardModel: DashboardModel;
  public dashboardContentModel: DashboardContentModel;
  public layout: GridsterItem[] = [];
  public components: IComponent[] = [];
  public dropId: string;
  // protected options: GridsterConfig;
  public  dashboardId: number;
  public dashboardCollection: DashboardModel;
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

  constructor(private _ds: GridsterDashboardService) { }

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
    const { components } = this;
    const comp: IComponent = components.find(c => c.id === this.dropId);

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
    this.dashboardCollection.dashboard = this.dashboardArray;
    let tmp = JSON.stringify(this.dashboardCollection);
    let parsed: DashboardModel = JSON.parse(tmp);
    this.serialize(parsed.dashboard);
    console.log(this.dashboardArray);
    this._ds.updateDashboard(this.dashboardId, parsed).subscribe();
  }

  onDrop(ev) {
		const componentType = ev.dataTransfer.getData("widgetIdentifier");
		switch (componentType) {
			case "radar_chart":
				return this.dashboardArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: CardComponent,
					name: "Radar Chart",
					id: 0,
					properties:  ''
				});
			case "line_chart":
				return this.dashboardArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: CardComponent,
					name: "Line Chart",
					id: 0,
					properties: '0'
				});
			case "doughnut_chart":
				return this.dashboardArray.push({
					cols: 5,
					rows: 5,
					x: 0,
					y: 0,
					component: CardComponent,
					name: "Doughnut Chart",
					id: 0,
					properties: ''
				});
		}
	}

  	// Super TOKENIZER 2.0 POWERED BY NATCHOIN
	parseJson(dashboardCollection: DashboardModel) {
		// We loop on our dashboardCollection
		dashboardCollection.dashboard.forEach(dashboard => {
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

	serialize(dashboardCollection) {
		// We loop on our dashboardCollection
		dashboardCollection.forEach(dashboard => {
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
