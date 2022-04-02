import { Component, OnInit, Input } from '@angular/core';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { GridsterLayoutService,IComponent  } from 'src/app/_services/system/gridster-layout.service';

import { DashboardContentModel, DashboardModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';

// COMPONENTS
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialog } from '@angular/material/dialog';
import { GridComponentPropertiesComponent } from './grid-component-properties/grid-component-properties.component';

@Component({
  selector: 'grid-menu-layout',
  templateUrl: './grid-menu-layout.component.html',
  styleUrls: ['./grid-menu-layout.component.scss']
})
export class GridMenuLayoutComponent implements OnInit {

  @Input() layoutID : any;

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
    public layoutService  : GridsterLayoutService,
    private _route        : ActivatedRoute,
    private siteService   : SitesService,
    private gridData      : GridsterDataService,
    private dialog        : MatDialog,
    private router        : Router,
    private _ds           : GridsterDashboardService)
  {}

	ngOnInit() {
    // if (!this.layoutService.dashboardModel) {
    //   this.router.navigate(['menu-manager'])
    //   return;
    // }
	  this.initSubscription();
	}

  initSubscription() {
    this._route.params.subscribe( data => {
      this.layoutID = +data["id"];
      this.getData();
    })
  }

	display(event) {

	}

	getData() {
		// We get the id in get current router dashboard/:id
		// this._route.params.subscribe(params => {
		// 	// + is used to cast string to int
		// 	this.layoutService.dashboardId = +params["id"];
		// 	// We make a get request with the dashboard id
		// 	this._ds.getDashboard(this.layoutService.dashboardId).subscribe(dashboard => {
		// 		// We fill our dashboardCollection with returned Observable
		// 		this.layoutService.dashboardCollection = dashboard;
		// 		// We parse serialized Json to generate components on the fly
		// 		this.layoutService.parseJson(this.layoutService.dashboardCollection);
		// 		// We copy array without reference
		// 		this.layoutService.dashboardArray = this.layoutService.dashboardCollection.dashboard.slice();
		// 	});
		// });
    const site = this.siteService.getAssignedSite();
    const gridData$ = this.gridData.getGrid(site,this.layoutID)

    gridData$.subscribe({
      next: data => {
        this.layoutService.dashboardModel = data
        this.layoutService.parseJson(data)
        // console.log('gridData subscribe', data)
        this.layoutService.dashboardArray =  data.dashboard;
      }
    })
	}

	openItemSettings(item) {
    if (!item || !item.properties)
    this.openEditor(item)
	}

	itemChange() {
    this.layoutService.itemChange()
	}

  onDrop(ev) {
    console.log('drop', ev)
    const content =  this.layoutService.onDrop(ev)
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

  openEditor(item: DashboardContentModel) {
    let dialogRef: any;
    dialogRef = this.dialog.open(GridComponentPropertiesComponent,
      { width:        '500px',
        minWidth:     '500px',
        height:       '650px',
        minHeight:    '650px',
        data : item
      },
    )
  }
}
