import { Component, OnInit } from '@angular/core';
import { GridsterLayoutService,IComponent  } from 'src/app/_services/system/gridster-layout.service';
import { DashboardContentModel, DashboardModel, WidgetModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';

@Component({
  selector: 'app-grid-manager',
  templateUrl: './grid-manager.component.html',
  styleUrls: ['./grid-manager.component.scss']
})
export class GridManagerComponent implements OnInit {
	constructor( private _ds: GridsterDashboardService){};

  layoutID: number;
	// Components variables
	 toggle: boolean;
	 modal: boolean;
	 widgetCollection: WidgetModel[];
	 dashboardCollection: DashboardModel[];
   matToolbarColor = 'primary';

	// On component init we store Widget Marketplace in a WidgetModel array
	ngOnInit(): void {
		// We make a get request to get all widgets from our REST API
		this._ds.getWidgets().subscribe(widgets => {
			this.widgetCollection = widgets;
		});

		// We make get request to get all dashboards from our REST API
		this._ds.getDashboards().subscribe(dashboards => {
			this.dashboardCollection = dashboards;
		});
	}

	onDrag(event, identifier) {
		event.dataTransfer.setData('widgetIdentifier', identifier);
	}
	// Method call when toggle button is clicked in navbar
	toggleMenu(): void {
		this.toggle = !this.toggle;
	}
}
