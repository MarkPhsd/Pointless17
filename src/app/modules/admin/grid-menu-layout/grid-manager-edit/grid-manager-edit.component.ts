import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { GridsterDataService } from 'src/app/_services/gridster/gridster-data.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { GridsterDashboardService } from 'src/app/_services/system/gridster-dashboard.service';
import { DashboardModel } from '../grid-models';
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

	constructor(
              private siteService        : SitesService,
              private gridDataService    : GridsterDataService,
              private dialogRef          : MatDialogRef<GridManagerEditComponent>,
              public layoutService       : GridsterLayoutService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog             : MatDialog,
              private fb                 : FormBuilder,
              private _snackBar          : MatSnackBar,
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
  }

  setType(type: string) {
    if (this.inputForm) {
      this.inputForm.controls['type'].setValue(type)
    }
  }

  initForm() {
    this.inputForm = this.fb.group( {
      id       : [''],
      username : [''],
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
    this.notifyEvent('This method is not an option', 'disabled')
  }

  setValues(model: DashboardModel) {
    if (this.dashboardModel) {
      this.dashboardModel.name   = model.name;
      this.dashboardModel.type   = model.type;
      this.dashboardModel.active = model.active;
      this.dashboardModel.id     = model.id;
    }
    return this.dashboardModel;
  }

  update(event): void {
    const site = this.siteService.getAssignedSite();
    if (!this.inputForm) { return }
    let result = ''
    let model = this.inputForm.value as DashboardModel;
    //set values of dashboardmodel
    model = this.setValues(model)

    if (model.id) {
      const  model$ = this.gridDataService.updateGrid(site, model);
      this.publish(model$)
    }

    if (!model.id) {
      const  model$ = this.gridDataService.addGrid(site, model);
      this.publish(model$)
    }

  };

  publish(model$: Observable<DashboardModel>) {
    model$.subscribe(
      {
        next : data =>{
          this.notifyEvent('Saved', "Saved")
        },
        error: err => {
            this.notifyEvent(err, "Failure")
        }
      }
    )
  }

  updateExit(event) {
    this.update(event)
    this.dialogRef.close()
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}

