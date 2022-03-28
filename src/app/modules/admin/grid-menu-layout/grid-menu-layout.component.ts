import { Component, OnInit, Input } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { GridsterLayoutService,IComponent  } from 'src/app/_services/system/gridster-layout.service';

import { DashboardContentModel, DashboardModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';

// COMPONENTS
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { ActivatedRoute } from '@angular/router';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';

@Component({
  selector: 'grid-menu-layout',
  templateUrl: './grid-menu-layout.component.html',
  styleUrls: ['./grid-menu-layout.component.scss']
})
export class GridMenuLayoutComponent implements OnInit {

  @Input() layoutID : number;

  get options(): GridsterConfig {
    return this.layoutService.options;
  }
  get layout(): GridsterItem[] {
    return this.layoutService.layout;
  }
  get components(): IComponent[] {
    return this.layoutService.components;
  }

	aButtonDisabled = true;
	bButtonDisabled = true;

	inputs = {
		hello: 'world from input',
		disabledVehicleAView: this.aButtonDisabled,
		disabledVehicleBView: this.bButtonDisabled,
		something: () => 'can be really complex'
	  };

	  outputs = {
		onSomething: (type) => alert(type)
  }

	constructor(
    public layoutService: GridsterLayoutService,
    private _route: ActivatedRoute,
    private _ds: GridsterDashboardService)
    {}


	ngOnInit() {
		// Grid options
		this.getData();
	}

	display(event) {

	}

	getData() {
		// We get the id in get current router dashboard/:id
		this._route.params.subscribe(params => {
			// + is used to cast string to int
			this.layoutService.dashboardId = +params["id"];
			// We make a get request with the dashboard id
			this._ds.getDashboard(this.layoutService.dashboardId).subscribe(dashboard => {
				// We fill our dashboardCollection with returned Observable
				this.layoutService.dashboardCollection = dashboard;
				// We parse serialized Json to generate components on the fly
				this.layoutService.parseJson(this.layoutService.dashboardCollection);
				// We copy array without reference
				this.layoutService.dashboardArray = this.layoutService.dashboardCollection.dashboard.slice();
			});
		});
	}

	openItemSettings(id) {
		//open modal popup.
	}

	itemChange() {

	}

	changedOptions() {
		this.options.api.optionsChanged();
	}

	removeItem(item) {
		this.layoutService.dashboardArray.splice(
			this.layoutService.dashboardArray.indexOf(item),
		);
		this.itemChange();
	}
}
