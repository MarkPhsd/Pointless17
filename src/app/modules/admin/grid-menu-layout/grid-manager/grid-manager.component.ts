import { Component,  OnDestroy,  OnInit } from '@angular/core';
import { GridsterLayoutService   } from 'src/app/_services/system/gridster-layout.service';
import { DashboardModel  } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridManagerEditComponent } from '../grid-manager-edit/grid-manager-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { Subscription } from 'rxjs';
@Component({
  selector: 'menu-manager',
  templateUrl: './grid-manager.component.html',
  styleUrls: ['./grid-manager.component.scss']
})
export class GridManagerComponent implements OnInit, OnDestroy {

  dashboardModel: DashboardModel;
  layoutID      : number;
	// Components variables
  toggle: boolean;
  modal: boolean;

  matToolbarColor = 'primary';
  inputForm: FormGroup;
  allowDesign: boolean;

  _dashboard : Subscription;




  constructor(
              private dialog             : MatDialog,
              private router            : Router,
              public layoutService: GridsterLayoutService,
              private fb: FormBuilder,
              private auth: AuthenticationService,
              ){};

	// On component init we store Widget Marketplace in a WidgetModel array
	ngOnInit(): void {
    this.inputForm = this.fb.group({type: ['']})
    this.refresh();
    this.layoutService.toggleDesignerMode(false);
    if (this.auth.isAuthorized)  {
      this.allowDesign = true;
    }
    this.initSubscriptions();
	}

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._dashboard) {
      this._dashboard.unsubscribe()
    }
  }

  initSubscriptions() {
    this._dashboard = this.layoutService._dashboardModel.subscribe(data => {
      this.dashboardModel = data
    })
  }

  saveChanges() {
    this.layoutService.itemChange(null)
  }

  listMenu(id: number) {
    this.layoutService.forceRefresh(id)
  }

  refresh() {
		// We make a get request to get all widgets from our REST API
    // const id = this.layoutService.dashboardModel.id;
		this.layoutService.getWidgets().subscribe(widgets => {
			this.layoutService.widgetCollection = widgets;
		});
    this.layoutService.refreshCollection()
  }

  reset() {
    this.layoutService.refreshCollection()
    const path = "/menu-manager/"
    this.layoutService.stateChanged = false
    this.router.navigate([path]);
  }

	onDrag(event, identifier) {
		event.dataTransfer.setData('widgetIdentifier', identifier);
    this.layoutService.itemChange(null);
	}

  toggleDesignMode() {
    this.layoutService.toggleDesignerMode(!this.layoutService.designerMode)
  }
	// Method call when toggle button is clicked in navbar
	toggleMenu(): void {
		this.toggle = !this.toggle;
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
	}

  addGrid() {
    this.layoutService.dashboardCollection = null;
    this.dashboardModel = null;
    this.layoutService.dashboardModel = null;
    this.layoutService.dashboardContentModel = null;
    this.layoutService.dashboardID = 0;
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
