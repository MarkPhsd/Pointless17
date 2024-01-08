import { Component, OnInit, Input } from '@angular/core';
import { GridsterLayoutService,IComponent  } from 'src/app/_services/system/gridster-layout.service';
import { GridsterConfig, GridsterItem, } from 'angular-gridster2';
import { DashBoardComponentProperties, DashboardContentModel, DashBoardProperties,  } from 'src/app/modules/admin/grid-menu-layout/grid-models';

// COMPONENTS
import { MatDialog } from '@angular/material/dialog';
import { GridComponentPropertiesComponent } from './grid-component-properties/grid-component-properties.component';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { AuthenticationService, AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ISite } from 'src/app/_interfaces';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NavigationService } from 'src/app/_services/system/navigation.service';

@Component({
  selector: 'grid-menu-layout',
  templateUrl: './grid-menu-layout.component.html',
  styleUrls: ['./grid-menu-layout.component.scss']
})
export class GridMenuLayoutComponent implements OnInit {

  action$: Observable<any>;
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

  backgroundblendmode = 'normal'
  backgroundColor     = '#82a1ad';
  opacity             = 1;
  image               = ''
  bucket:             string;

  pixelminHeight     = '100%';
  pixelHeight        = 'calc(100vh - 1em - 50px) ';
  pixelWidth         = '100%'

  sites: ISite[];

	constructor(
    public layoutService  : GridsterLayoutService,
    private dialog        : MatDialog,
    public authService    : AuthenticationService,
    private awsservice    : AWSBucketService,
    private  sitesService     : SitesService,
    public route              : ActivatedRoute,
    private navigationService : NavigationService,
  )
  {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const site = this.sitesService.getAssignedSite();
      this.action$ = this.initGrid(+id)
      return;
    }
    this.initSites(id);
  }

  initSites(id) {
    this.action$ =  this.sitesService.getSites().pipe(
      switchMap( data => {
        this.sites  = data;
        this.layoutService.sites = data;
        return of(null)
      }
    )).pipe(switchMap(data => {
      return this.initGrid(+id)
    }))
	}

  //if we don't have to do sites.
  initGrid(id: number) {
    this.initGridsterSettings()
    if ( id ) {
      return  this.layoutService.getDataOBS(+id)
    }
  }

  initGridsterSettings() {
    this.initDesigerMode()
    this.updateGridsterUserMode(this.designerMode);
    this.initSubscription();
    this.changedOptions();
    this.layoutService.changedOptions();
  }

  initSubscription() {
    this.sitesService.sites$.subscribe(data => {
      this.sites = data
    })

    this._dashboard = this.layoutService._dashboardModel.subscribe(data => {
      this.layoutService.dashboardModel = data;

      if (!data) {
        // console.log('no layout service subscription')
        return;
      }

      if (data.userName) {
        this.layoutService.dashboardProperties = JSON.parse(data.userName) as DashBoardProperties
      }

      this.backgroundblendmode = 'normal'
      this.backgroundColor     = 'white';
      this.opacity             = 1;
      this.image               = ''


      if (this.layoutService.dashboardProperties) {

        this.backgroundColor = this.layoutService.dashboardProperties.backgroundColor;
        this.opacity         = this.layoutService.dashboardProperties.opacity;
        this.backgroundblendmode = this.layoutService.dashboardProperties.backgroundblendmode;
        this.image  = this.bucket + this.layoutService.dashboardProperties.image;

        this.pixelminHeight     = '100%';
        this.pixelHeight        = 'calc(100vh - 1em - 50px)'
        this.pixelWidth         = '100%'

        this.pixelminHeight = this.layoutService.dashboardProperties.pixelHeight;
        this.pixelHeight = this.layoutService.dashboardProperties.pixelHeight;
        this.pixelWidth  = this.layoutService.dashboardProperties.pixelWidth;

        let rows = 100;
        let cols = 100;
        if (this.layoutService.dashboardProperties.gridRows) {
          rows =  this.layoutService.dashboardProperties.gridRows
        }
        if (this.layoutService.dashboardProperties.gridColumns) {
          cols =   this.layoutService.dashboardProperties.gridColumns
        }

        if (this.sites) {
          this.layoutService.options.sites = this.sites;
        }
        this.layoutService.options.minCols = cols;
        this.layoutService.options.minRows = rows;
        this.layoutService.options.maxCols = cols;
        this.layoutService.options.maxRows = rows;
        this.layoutService.options.maxItemRows = rows;
        this.layoutService.options.maxItemCols = cols;
        this.layoutService.changedOptions();
      }
    })
  }

  initDesigerMode() {
    const designerMode = localStorage.getItem('dashBoardDesignerMode')
    if (designerMode === 'true' || designerMode === 'false') {
      const mode = (designerMode == 'true')
      if (designerMode) {
        this.designerMode = mode
        this.layoutService.designerMode = mode;
      }
    }
  }


  saveChanges() {
    this.itemChange()
  }

  updateGridsterUserMode(mode: boolean) {
    this.layoutService.designerMode    = mode;
    if (mode) {
      this.gridsteritemclass= 'gridster-item';
    }
    if (!mode) {
      this.gridsteritemclass= 'gridster-item-user';
    }
  }

	openItemSettings(item) {
    this.openEditor(item)
	}

  itemChange() {
    this.layoutService.itemChange(null)
  }

  onDrop(ev) {
    const content = this.layoutService.onDrop(ev)
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
    let dialogRef: any;
    dialogRef = this.dialog.open(GridComponentPropertiesComponent,
      { width:        '650px',
        minWidth:     '650px',
        height:       '850px',
        minHeight:    '850px',
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
