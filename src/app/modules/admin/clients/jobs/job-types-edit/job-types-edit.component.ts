import { Component,  Inject, OnInit,
} from '@angular/core';
import { AWSBucketService,  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { jobTypes } from 'src/app/_interfaces';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { FbClientTypesService } from 'src/app/_form-builder/fb-client-types.service';
import { Observable, switchMap , of, catchError} from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { JobTypesService } from 'src/app/_services/people/job-types.service';

@Component({
  selector: 'app-job-types-edit',
  templateUrl: './job-types-edit.component.html',
  styleUrls: ['./job-types-edit.component.scss']
})
export class JobTypesEditComponent implements OnInit {
  message: string;
  inputForm: UntypedFormGroup;
  jobType: jobTypes;
  action$ : Observable<any>;
  id: number;
  jobType$: Observable<jobTypes>;

  constructor(
    private jobTypeService         : JobTypesService,
    private siteService              : SitesService,
    private snack                   : MatSnackBar,
    private awsBucket               : AWSBucketService,
    public  fbClientTypesService    : FbClientTypesService,
    public  userAuthService         : UserAuthorizationService,
    private fb                      : UntypedFormBuilder,
    private dialogRef: MatDialogRef<JobTypesEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)

  {
    if (data) {
      this.id = data
      const site = this.siteService.getAssignedSite()
      this.jobType$ = this.jobTypeService.getType(site, this.id).pipe(
        switchMap(data => {
          this.jobType = data;
          this.initForm();
          this.inputForm.patchValue(data)
          return of(data)
        })
      )
    }
  }

  ngOnInit() {
    if (!this.jobType) {
      this.jobType = {} as jobTypes;
      this.initForm();
    }
    this.userAuthService.isAdmin
  };


  initForm() {
    this.inputForm = this.fb.group({
      name: [],
      id: [],
    })
  }

  updateItem(event, close: boolean) {
    let result: boolean;
    if (this.inputForm.valid) {
      const site = this.siteService.getAssignedSite()
      let item = this.inputForm.value as jobTypes;
      console.log(item)
      const item$ = this.jobTypeService.saveType(site, item)

      this.message =  ''
      this.action$ =  item$.pipe(
        switchMap( data =>  {
            this.message = "Saved"
            this.jobType = data;
            this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'top'})
              if (close) {this.onCancel(null); }
              return of(data)
            }
        ));

      }
  };

  updateItemExit(event) {
    this.updateItem(event, true)
  }

  onCancel(event) {
    this.dialogRef.close('closed');
  }

  deleteItem(event) {
    // const warn = window.confirm('Are you sure you want to delete this item?')
    // if (!warn) { return }

    const site = this.siteService.getAssignedSite()
    if (!this.jobType) {
      this.snack.open("Item does not exist.", "Success", {duration:2000, verticalPosition: 'top'})
      return
    }

    if (this.jobType.id == undefined) {
      this.snack.open(`Delete failed id not found`, "Failed", {duration:2000, verticalPosition: 'top'})
      return;
    }

    this.action$ = this.jobTypeService.delete(site, this.jobType.id).pipe(
      switchMap( data => {
      if (!data.id) {
        this.message = 'Item not deleted.'
        this.action$ = null;
        this.message =''
        this.snack.open(`Delete failed. ${data}`, "Failed", {duration:2000, verticalPosition: 'top'})
        return
      }
      this.message = 'Item deleted.'
      this.snack.open("Item deleted", "Success", {duration:2000, verticalPosition: 'top'})
      this.onCancel(event)
      return of(data)
    }),
    catchError(error => {
      console.log('error', error)
      this.snack.open("Item not deleted" + error, "Check again", {duration:2000, verticalPosition: 'top'})
      return of(null)
    }))
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }
}
