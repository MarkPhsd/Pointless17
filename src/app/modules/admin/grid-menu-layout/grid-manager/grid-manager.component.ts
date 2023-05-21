import { Component,  OnDestroy,  OnInit, Renderer2 } from '@angular/core';
import { GridsterLayoutService   } from 'src/app/_services/system/gridster-layout.service';
import { DashboardModel  } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridManagerEditComponent } from '../grid-manager-edit/grid-manager-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { Subscription } from 'rxjs';
import { NavigationService } from 'src/app/_services/system/navigation.service';

@Component({
  selector: 'menu-manager',
  templateUrl: './grid-manager.component.html',
  styleUrls: ['./grid-manager.component.scss']
})
export class GridManagerComponent implements OnInit, OnDestroy {

  dashboardModel: DashboardModel
  layoutID      : number;
	// Components variables
  toggle: boolean;
  modal: boolean;
  accordionStep = 3;
  matToolbarColor = 'primary';
  inputForm: UntypedFormGroup;
  allowDesign: boolean;
  hideMenu   : boolean;

  _dashboard : Subscription;
  isSafari        : any;
  constructor(
              private dialog             : MatDialog,
              private router             : Router,
              public  layoutService: GridsterLayoutService,
              private fb                 : UntypedFormBuilder,
              private auth               : AuthenticationService,
              private navigationService  : NavigationService,
              private _renderer          : Renderer2,
              ){};

	// On component init we store Widget Marketplace in a WidgetModel array
	ngOnInit(): void {

    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    this.renderTheme();
    this.inputForm = this.fb.group({type: ['']})
    this.refresh();
    if (this.auth.isAuthorized)  {
      this.allowDesign = true;
    }
    this.initSubscriptions();

	}

  renderTheme() {
    const theme = localStorage.getItem('angularTheme')
    this._renderer.removeClass(document.body, 'dark-theme');
    this._renderer.removeClass(document.body, 'light-theme');
    this._renderer.addClass(document.body, theme);
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._dashboard) {this._dashboard.unsubscribe()  }
  }

  goHome() {
    this.navigationService.navHome();
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
    const path = "/menu-board"
    this.layoutService.stateChanged = false
    this.router.navigate([path]);
  }

  setStep(value: number) {
    this.accordionStep = value
    console.log(value)
  }

	onDrag(event, identifier) {
		event.dataTransfer.setData('widgetIdentifier', identifier);
    this.layoutService.itemChange(null);
	}

  toggleDesignMode() {

    if (!this.layoutService.designerMode){
      console.log(this.layoutService.designerMode)
      localStorage.setItem('dashBoardDesignerMode', 'true')
      this.layoutService.toggleDesignerMode(true)
      return
    }

    if (this.layoutService.designerMode){
      localStorage.setItem('dashBoardDesignerMode', 'false')
      this.layoutService.toggleDesignerMode(false)
      return
    }

  }

  hide() {
    this.hideMenu = true;
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
    this.layoutService.dashboardModel = null;
    this.layoutService.dashboardContentModel = null;
    this.layoutService.dashboardID = 0;
    this.layoutService.updateDashboardModel(null)
    this.openEditor(0)
  }

  editGrid() {
    if (this.layoutService.dashboardModel) {
      this.openEditor(this.layoutService.dashboardModel.id)
    }
  }

  setLayout(dashboard: DashboardModel) {
    this.layoutID       = dashboard.id;
    this.dashboardModel = dashboard;
  }

  openEditor(id: number) {
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
