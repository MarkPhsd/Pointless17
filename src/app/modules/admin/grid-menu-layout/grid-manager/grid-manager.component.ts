import { Component,  OnDestroy,  OnInit, Renderer2 } from '@angular/core';
import { GridsterLayoutService   } from 'src/app/_services/system/gridster-layout.service';
import { DashboardModel  } from 'src/app/modules/admin/grid-menu-layout/grid-models';
import { GridManagerEditComponent } from '../grid-manager-edit/grid-manager-edit.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { AuthenticationService } from 'src/app/_services';
// import { NavigationService } from 'src/app/_services/system/navigation.service';

@Component({
  selector: 'menu-manager',
  templateUrl: './grid-manager.component.html',
  styleUrls: ['./grid-manager.component.scss']
})
export class GridManagerComponent implements OnInit, OnDestroy {

  dashboardModel: DashboardModel
  layoutID   : number;
	// Components variables
  toggle     : boolean;
  modal      : boolean;
  accordionStep = 3;
  matToolbarColor = 'primary';
  inputForm  : UntypedFormGroup;
  allowDesign: boolean;
  hideMenu   : boolean;
  action$    : Observable<any>;
  _dashboard : Subscription;
  isSafari   : any;
  pathID     : string;

  constructor(
              private dialog             : MatDialog,
              private router             : Router,
              public  layoutService      : GridsterLayoutService,
              private navigationService  : NavigationService,
              private _renderer          : Renderer2,
              public route               : ActivatedRoute,
              private authenticationService: AuthenticationService,
              private fb: FormBuilder ){};



  
	// On component init we store Widget Marketplace in a WidgetModel array
	ngOnInit(): void {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.renderTheme();
    this.inputForm = this.fb.group({type: ['']})
    this.refresh();
    if (this.authenticationService.isAuthorized)  {
      this.allowDesign = true;
    }
    this.initSubscriptions();
	}


  refreshGrid() {
    this.layoutService.refreshDashBoard(this.dashboardModel?.id)
  }

  initSubscriptions() {
    this._dashboard = this.layoutService._dashboardModel.subscribe(data => {
      this.dashboardModel = data;
      this.autoRoute(data)
    })
  }

  autoRoute(data) {
    this.pathID = this.route.snapshot.paramMap.get('id');

    if (data && this.pathID)  { }
    if (!data && this.pathID) {
      this.action$ = this.layoutService.getDataOBS(+this.pathID , true).pipe(switchMap(data => {
        this.layoutService.refreshDashBoard(+this.pathID)
        this.layoutService.updateDashboardModel(data, true)
        return of(data)
      }))
      return;
    }

    if (this.pathID) {
      this.layoutService.refreshDashBoard(+this.pathID)
    }
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

  saveChanges() {
    this.layoutService.itemChange()
  }

  listMenu(id: number) {
    this.layoutService.refreshDashBoard(id)
  }

  refresh() {
		// We make a get request to get all widgets from our REST API
    // if (this.layoutService.dashboardModel) {
      this.action$ =  this.layoutService.getWidgets().pipe(
        switchMap(widgets => {
          this.layoutService.widgetCollection = widgets;
          return this.layoutService.refreshCollection()
      }))
    // }
  }

  // refreshCollection
  // publish
  // saveModel
  // deleteModel
  // saveDashBoard
  // itemChange
  reset() {
    this.layoutService.refreshCollection()
    const path = "/menu-board"
    this.layoutService.stateChanged = false
    this.router.navigate([path]);
  }

  setStep(value: number) {
    this.accordionStep = value
  }

	onDrag(event, identifier) {
		event.dataTransfer.setData('widgetIdentifier', identifier);
    console.log('event', event, identifier)
    // this.action$ = this.layoutService.itemChange() //
	}

  toggleDesignMode() {
    const user = this.authenticationService._user.value
    if (!user) {
      return;
    }
    if (user?.roles === 'admin' || user?.roles === 'manager') {
      this.layoutService.designerMode = !this.layoutService.designerMode;
      this.layoutService.toggleDesignerMode( this.layoutService.designerMode)
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
    this.layoutService.updateDashboardModel(null, true)
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
      { width:        '90vw',
        minWidth:     '90vw',
        height:       '70vh',
        minHeight:    '70vh',
        data : id
      },
    )
  }
}
