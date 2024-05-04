import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DashboardModel, DashBoardProperties, widgetRoles } from '../grid-models';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';

@Component({
  selector: 'app-grid-manager-edit',
  templateUrl: './grid-manager-edit.component.html',
  styleUrls: ['./grid-manager-edit.component.scss']
})
export class GridManagerEditComponent implements OnInit {

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  public selectedIndex          : number;
  action$: Observable<any>;
  flag: boolean; //for saving

  image: string;
  backgroundblendmode: string;
  backgroundBlendModes = ["normal","multiply","screen","overlay","darken","lighten","color-dodge",
                      "color-burn","hard-light"," soft-light","difference","exclusion","hue",
                      "saturation","color","luminosity" ]
  types = ['Menu', 'Report', 'Seating/Table Layout', 'Order']
  id          : number;
  inputForm   : UntypedFormGroup;
  bucketName  : string;
  awsBucketURL: string;

  dashboardModel : DashboardModel;
  dashboardModel$: Observable<DashboardModel>;

  inputProperties: UntypedFormGroup;
  dashBoardProperties: DashBoardProperties;
  backgroundColor: string;
  opacity: number;

  init: boolean;

	constructor(
              private siteService        : SitesService,
              private gridDataService    : GridsterDataService,
              public layoutService       : GridsterLayoutService,
              private dialogRef          : MatDialogRef<GridManagerEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog             : MatDialog,
              private fb                 : UntypedFormBuilder,

  ) {

    if (data) {
      this.id = data;
      this.init = true;
      this.action$ = this.getDashBoard(data)
    }
    if (!data) {
      this.action$ = this.getDashBoard(0)
    }
  };

  ngOnInit() {
    if (this.init) {
      return
    }
  }

  getDashBoard(id: number) {
    const site  = this.siteService.getAssignedSite();
    if (!id || id == 0) {
      this.dashboardModel = {} as DashboardModel
      console.log('no dashboard fill form', )
      this.fillForm(this.dashboardModel);
      return;
    }
    return this.gridDataService.getGrid(site,  this.id).pipe(switchMap(data => {
      if (!data) {   data = {} as DashboardModel;  }
      console.log('data dashboard fill form', data)
      this.dashboardModel = data as DashboardModel
      this.fillForm(this.dashboardModel);
      return of(data)
    }))
  }

  onCancel(event) {
    this.dialogRef.close()
  }

  setRoles(roles: widgetRoles[]) {
    if (roles) {
      this.dashboardModel.widgetRoles = roles;
      this.dashboardModel.widgetRolesJSON = JSON.stringify(roles);
    }
  }

  setRolesJSON(roles: string) {
    if (roles) {
      this.dashboardModel.widgetRolesJSON = roles
    }
  }

  fillForm(data: DashboardModel) {
    this.initForm();
    this.initFormData(data);
    this.initPropertiesForm(this.dashboardModel);
  }

  setType(type: string) {
    if (this.inputForm) {
      this.inputForm.controls['type'].setValue(type)
    }
  }

  setBlendMode(type: string) {
    if (this.inputForm) {
      this.inputProperties.controls['backgroundblendmode'].setValue(type)
      this.backgroundblendmode = type;
    }
  }

  initPropertiesForm(model: DashboardModel) {

    this.inputProperties = this.fb.group( {
        backgroundColor       : [''],
        image                 : [''],
        opacity               : [''],
        backgroundblendmode   : [''],
        icon                  : [''],
        gridColumns           : [''],
        gridRows              : [''],
        pixelHeight           : [''],
        pixelWidth            : [''],
      }
    )
    this.inputProperties.valueChanges.subscribe(data => {
      this.flag = true
    })
    if (model) {
      if (model.userName) {
        const jsonObject          = JSON.parse(model.userName) as DashBoardProperties;
        this.backgroundColor      = jsonObject.backgroundColor
        this.image                = jsonObject.image
        this.opacity              = jsonObject.opacity;
        this.backgroundblendmode  = jsonObject.backgroundblendmode
        this.inputProperties.patchValue(jsonObject)
      }
    }
  }

  // inputProperties: FormGroup;
  // dashBoardProperties: DashBoardProperties;
  initForm() {
    this.inputForm = this.fb.group( {
      id       : [''],
      userName : [''],
      name     : [''],
      type     : [''], //preset types, menu, report widget, restaurant/ operation layout.
      jSONBject: [''],
      active   : [''],
    })
    return this.inputForm;
  };

  initFormData(data) {
    this.inputForm.patchValue(data)
    this.inputForm.valueChanges.subscribe(data => {
      console.log('data', data)
      this.flag = true
    })
  }


  setValues(model: DashboardModel) {
    if (this.dashboardModel) {
      this.dashboardModel.name   = model.name;
      this.dashboardModel.type   = model.type;
      this.dashboardModel.active = model.active;
      this.dashboardModel.id     = model.id;
    }

    if (this.inputProperties) {
      const properties =  this.inputProperties.value as DashBoardProperties
      properties.backgroundColor   = this.backgroundColor;
      properties.opacity           = this.opacity;
      properties.image             = this.image;
      properties.backgroundblendmode = this.backgroundblendmode;
      const properitesJson = JSON.stringify(properties);
      this.dashboardModel.userName = properitesJson;
    }
    const json = JSON.stringify(this.dashboardModel);
    this.dashboardModel.jsonObject = json;
    return this.dashboardModel;
  }

  delete(event) {
    this.action$ =  this.layoutService.deleteModel(this.dashboardModel).pipe(switchMap(data => {
      setTimeout(() => {
        this.onCancel(null)
      }, 100);
      return of(data)
    }))
  }

  _update() {
    if (!this.inputForm) { return }
    let model = this.inputForm.value as DashboardModel;
    model = this.setValues(model)
    return this.layoutService.saveModel(model, true).pipe(switchMap(data =>
      {
        this.flag = false
        return of(data)
    }));

  };

  update(event) {
    if (!this.inputForm) { return }
    let model = this.inputForm.value as DashboardModel;
    model = this.setValues(model)
    this.action$ = this._update()
  }

  updateExit(event) {
    this.action$ = this._update().pipe(switchMap(data => {
      setTimeout(() => {
        this.onCancel(null)
      }, 100);
      return of(data)
    }))
  }

  receivedImage(event) {
    // this.inputForm.controls['image'].setValue(event)
    this.flag = true
    console.log('image', event)
    this.image = event
    this.inputForm.patchValue({image: event})
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    this.opacity = value;
    this.flag = true;
    return value;
  }
  // Action triggered when user swipes mat-tabs
  swipe(selectedIndex: any, action = this.SWIPE_ACTION.RIGHT) {
    // Out of range
    if ( selectedIndex < 0 || selectedIndex > 1 ) return;

    // Swipe left, next tab
    if (action === this.SWIPE_ACTION.LEFT) {
      const isLast = selectedIndex === 1;
      selectedIndex = isLast ? 0 : selectedIndex + 1;
    }

    // Swipe right, previous tab
    if (action === this.SWIPE_ACTION.RIGHT) {
      const isFirst = selectedIndex === 0;
      selectedIndex = isFirst ? 1 :  selectedIndex - 1;
    }
  }

  selectChange(): void{
    console.log("Selected INDEX: " + this.selectedIndex);
  }
}

