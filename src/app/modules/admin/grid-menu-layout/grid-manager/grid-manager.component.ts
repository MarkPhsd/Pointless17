import { Component, OnInit } from '@angular/core';
import { GridsterLayoutService,IComponent  } from 'src/app/_services/system/gridster-layout.service';
import { DashboardContentModel, DashboardModel, WidgetModel } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridManagerEditComponent } from '../grid-manager-edit/grid-manager-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NumberFilterModel } from 'ag-grid-community';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'menu-manager',
  templateUrl: './grid-manager.component.html',
  styleUrls: ['./grid-manager.component.scss']
})
export class GridManagerComponent implements OnInit {

  dashboardModel: DashboardModel;
  layoutID      : number;
	// Components variables
	 toggle: boolean;
	 modal: boolean;
	 widgetCollection: WidgetModel[];
	 dashboardCollection: DashboardModel[];
   matToolbarColor = 'primary';
  inputForm: FormGroup;

	constructor(private _ds: GridsterDashboardService,
              private siteService: SitesService,
              private dialog             : MatDialog,
              private router            : Router,
              public layoutService: GridsterLayoutService,
              private fb: FormBuilder,
              private gridDataService: GridsterDataService){};

	// On component init we store Widget Marketplace in a WidgetModel array
	ngOnInit(): void {
    this.inputForm = this.fb.group({type: ['']})
    this.refresh();
	}

  listMenu(id: string) {
    this.router.navigate(["/menu-manager/grid-menu-layout/", {id:id}]);
  }

  refresh() {
		// We make a get request to get all widgets from our REST API
		this._ds.getWidgets().subscribe(widgets => {
			this.widgetCollection = widgets;
		});

    const site = this.siteService.getAssignedSite();
		// We make get request to get all dashboards from our REST API
		this.gridDataService.getGrids(site).subscribe(dashboards => {
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

  addGrid() {
    this.openEditor(0)
  }

  editGrid() {
    if (this.layoutService.dashboardModel) {
      this.openEditor(this.layoutService.dashboardModel.id)
    }
  }

  setLayout(dashboard: DashboardModel) {
    this.dashboardModel = dashboard;
    this.layoutID       = dashboard.id;
  }

  openEditor(id: any) {
    let dialogRef: any;

    dialogRef = this.dialog.open(GridManagerEditComponent,
      { width:        '500px',
        minWidth:     '500px',
        height:       '650px',
        minHeight:    '650px',
        data : id
      },
    )
  }
}
