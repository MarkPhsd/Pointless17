import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';
import { DashboardModel, DashBoardProperties } from '../grid-models';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GridsterLayoutService } from 'src/app/_services/system/gridster-layout.service';

@Component({
  selector: 'app-grid-manager-edit',
  templateUrl: './grid-manager-edit.component.html',
  styleUrls: ['./grid-manager-edit.component.scss']
})
export class GridManagerEditComponent implements OnInit {

  types = ['Menu', 'Report', 'Seating/Table Layout']
  id          : number;
  inputForm   : FormGroup;
  bucketName  : string;
  awsBucketURL: string;

  dashboardModel : DashboardModel;
  dashboardModel$: Observable<DashboardModel>;

  inputProperties: FormGroup;
  dashBoardProperties: DashBoardProperties;
  backgroundColor: string;
  opacity: number;


	constructor(
              private siteService        : SitesService,
              private gridDataService    : GridsterDataService,
              private dialogRef          : MatDialogRef<GridManagerEditComponent>,
              public layoutService       : GridsterLayoutService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog             : MatDialog,
              private fb                 : FormBuilder,

  ) {
    const site           = this.siteService.getAssignedSite();

    if (this.layoutService.dashboardModel) {
      this.id              = data.id;
      this.dashboardModel = this.layoutService.dashboardModel;
      return
    }

    if (data) {
      this.id              = data.id;
      this.dashboardModel$ = this.gridDataService.getGrid(site,  this.id);
    }

  };

  ngOnInit() {
    this.fillForm();
  }

  onCancel(event) {
    this.dialogRef.close()
  }

  fillForm() {
    this.initForm();
    if (!this.dashboardModel) {
      this.dashboardModel = {} as DashboardModel;
      return
    }
    this.initFormData();
    this.initPropertiesForm(this.dashboardModel);
  }

  setType(type: string) {
    if (this.inputForm) {
      this.inputForm.controls['type'].setValue(type)
    }
  }

  initPropertiesForm(model: DashboardModel) {
    this.inputProperties = this.fb.group( {
      backgroundColor   : [''],
      image             : [''],
      opacity           : ['']
    })
    if (model) {
      if (model.userName) {
        const jsonObject = JSON.parse(model.userName) as DashBoardProperties;
        this.backgroundColor = jsonObject.backgroundColor
        this.opacity = jsonObject.opacity;
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
    return this.inputForm
  };

  initFormData() {
    const site     = this.siteService.getAssignedSite();
    this.inputForm.patchValue(this.dashboardModel)
  }

  delete(event) {
    this.layoutService.notifyEvent('This method is not an option', 'disabled')
  }

  setValues(model: DashboardModel) {
    if (this.dashboardModel) {
      this.dashboardModel.name   = model.name;
      this.dashboardModel.type   = model.type;
      this.dashboardModel.active = model.active;
      this.dashboardModel.id     = model.id;
    }
    const properties = {} as DashBoardProperties
    properties.backgroundColor = this.backgroundColor;
    properties.opacity = this.opacity;
    const properitesJson = JSON.stringify(properties);
    this.dashboardModel.userName = properitesJson;
    const json = JSON.stringify(this.dashboardModel);
    this.dashboardModel.jsonObject = json;
    return this.dashboardModel;
  }

  update(event): void {
    if (!this.inputForm) { return }
    let model = this.inputForm.value as DashboardModel;
    model = this.setValues(model)
    this.layoutService.saveModel(model)
  };

  updateExit(event) {
    this.update(event)
    this.dialogRef.close()
  }

  formatLabel(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    this.opacity = value;
    return value;
  }


}

