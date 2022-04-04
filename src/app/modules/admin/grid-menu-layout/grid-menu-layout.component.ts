import { Component, OnInit, Input } from '@angular/core';
import { GridsterLayoutService,IComponent  } from 'src/app/_services/system/gridster-layout.service';
import {CompactType, DisplayGrid, Draggable, GridsterConfig, GridsterItem, GridType, PushDirections, Resizable} from 'angular-gridster2';
import { DashBoardComponentProperties, DashboardContentModel, DashboardModel, DashBoardProperties } from 'src/app/modules/admin/grid-menu-layout/grid-models';

// COMPONENTS
import { CardComponent } from 'src/app/modules/admin/reports/card/card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialog } from '@angular/material/dialog';
import { GridComponentPropertiesComponent } from './grid-component-properties/grid-component-properties.component';
import {  Subscription } from 'rxjs';

@Component({
  selector: 'grid-menu-layout',
  templateUrl: './grid-menu-layout.component.html',
  styleUrls: ['./grid-menu-layout.component.scss']
})
export class GridMenuLayoutComponent implements OnInit {

  @Input() layoutID : any;
  options: GridsterConfig;
  // get options(): GridsterConfig {
  //   return this.layoutService.options;
  // }
  get layout(): GridsterItem[] {
    return this.layoutService.layout;
  }
  get components(): IComponent[] {
    return this.layoutService.components;
  }

  componentPropertiesList: DashBoardComponentProperties[];
  _dashboard : Subscription;

	aButtonDisabled          = true;
	bButtonDisabled          = true;
  @Input() designerMode    = true;

  gridsteritemclass= 'gridster-item';

	inputs = {
		hello: 'world from input',
    disabledVehicleAView: this.aButtonDisabled,
		disabledVehicleBView: this.bButtonDisabled,
		something: () => 'can be really complex'
  };

  inputsList: any[];

  outputs = {
		onSomething: (type) => alert(type)
  }

  backgroundColor = '#82a1ad';
  opacity         = 5;

	constructor(
    public layoutService  : GridsterLayoutService,
    private dialog        : MatDialog,
  )
  {}

	ngOnInit() {
    this.updateGridsterUserMode(this.designerMode);
    // this.options = {
		// 	gridType: "fit",
		// 	enableEmptyCellDrop: true,
		// 	emptyCellDropCallback: this.layoutService.onDrop,
		// 	swap: true,
    //   swapWhileDragging: false,
		// 	// pushItems: true,
		// 	// pushDirections: { north: true, east: true, south: true, west: true },
		// 	resizable: { enabled: true },
		// 	// itemChangeCallback: this.itemChange.bind(this),
    //   itemChangeCallback : this.modifyChanges.bind(this),
    //   allowMultiLayer    : true,
		// 	draggable: {
		// 		enabled: true,
		// 		// ignoreContent: true,
		// 		// dropOverItems: true,
		// 		// dragHandleClass: "drag-handler",
		// 		// ignoreContentClass: "drag",
		// 	},
    //   minCols: 250,
		// 	minRows: 250,
    //   mobileBreakpoint: 640,
    //   maxLayerIndex: 100,
    //   defaultLayerIndex:1,
		// };

    this.options = {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.OnDragAndResize,
      pushItems: true,
			// pushDirections: { north: true, east: true, south: true, west: true },
      swap             : true,
      swapWhileDragging: true,
      allowMultiLayer  : true,
      resizable: { enabled: true },
      enableEmptyCellDrop: true,
			emptyCellDropCallback: this.layoutService.onDrop,
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

    this.initSubscription();
	}

  saveChanges() {
    this.itemChange()
  }

  modifyChanges() {
    this.layoutService.stateChanged = true
    console.log(this.layoutService.stateChanged)
  }

  updateGridsterUserMode(mode: boolean) {
    this.designerMode    = mode;
    if (mode) {
      this.gridsteritemclass= 'gridster-item';
    }
    if (!mode) {
      this.gridsteritemclass= 'gridster-item-user';
    }
  }

  initSubscription() {
     this._dashboard = this.layoutService._dashboardModel.subscribe(data => {
      // this.layoutService.getData(this.layoutService.dashboardID);
      if (!data) {
        this.layoutService.forceRefresh(null);
        return;
      }
      if (this.layoutService.dashboardProperties) {
        this.backgroundColor = this.layoutService.dashboardProperties.backgroundColor;
        this.opacity         = this.layoutService.dashboardProperties.opacity;
      }
    })
  }

	openItemSettings(item) {
    this.openEditor(item)
	}

  itemChange() {
    this.layoutService.itemChange(null)
  }

  onDrop(ev) {
    const content =  this.layoutService.onDrop(ev)
  }

	changedOptionsEvent() {
		this.options.api.optionsChanged();
	}

  changedOptions(): void {
    if (this.options.api && this.options.api.optionsChanged) {
      this.options.api.optionsChanged();

    }
  }

	removeItem(item) {
    this.layoutService.removeCard(item)
    this.layoutService.saveDashBoard();
	}

  openEditor(item: DashboardContentModel) {
    console.log(item)
    let dialogRef: any;
    dialogRef = this.dialog.open(GridComponentPropertiesComponent,
      { width:        '650px',
        minWidth:     '399px',
        height:       '650px',
        minHeight:    '650px',
        data : item
      },
    )
  }
  getBorderRadius(value:any) {
    if (value) {
      return `${value}px`
    }
    if (!value) {
      return '5px'
    }
  }
  getBorder(value:any) {
    if (value) {
      return `${value}px`
    }
    if (!value) {
      return '1px'
    }
  }
  getOpacity(value:any) {
    if (value) {
      return `${value}`
    }
    if (!value) {
      return '100'
    }
  }
  getLayer(value:any) {
    if (value) {
      return `${value}`
    }
    if (!value) {
      return 1
    }
  }
}
