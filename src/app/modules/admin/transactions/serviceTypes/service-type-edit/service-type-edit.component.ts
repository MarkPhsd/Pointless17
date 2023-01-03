
import { Component,  Inject, OnInit } from '@angular/core';
import { AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormGroup } from '@angular/forms';
import { IServiceType, IServiceTypePOSPut } from 'src/app/_interfaces';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { FbServiceTypeService } from 'src/app/_form-builder/fb-service-type.service';
import { catchError, of, switchMap, Observable } from 'rxjs';

@Component({
  selector: 'app-service-type-edit',
  templateUrl: './service-type-edit.component.html',
  styleUrls: ['./service-type-edit.component.scss']
})
export class ServiceTypeEditComponent implements OnInit {

  id                     :any;
  serviceType            :IServiceType;
  bucketName             :string;
  awsBucketURL           :string;
  inputForm              :FormGroup;
  description            : string;
  action$                : Observable<any>;

  constructor(
    private serviceTypeService      : ServiceTypeService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private awsBucket               : AWSBucketService,
    private fbServiceTypeService    : FbServiceTypeService,
    private dialogRef: MatDialogRef<ServiceTypeEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)

  {
    if (data) {
      this.id = data
    }
    this.initializeForm()
  }

    async ngOnInit() {
      this.bucketName =       await this.awsBucket.awsBucket();
      this.awsBucketURL =     await this.awsBucket.awsBucketURL();
    };

    async initializeForm()  {

      this.initFormFields()

      if (this.inputForm && this.id) {
        const site = this.siteService.getAssignedSite();
        const serviceType$ = this.serviceTypeService.getType(site, this.id)

        serviceType$.subscribe(
           {next:  data => {
              this.serviceType = data
              this.id         = data.id

              this.inputForm.patchValue(this.serviceType)
            }, error: error => {
              this.snack.open(`Issue. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
            }
          }
        )
      }

    };

    initFormFields() {
      this.inputForm  = this.fbServiceTypeService.initForm(this.inputForm)
    }

    updateItem(event: any)  {

      if (!this.inputForm.valid) { return }
      const site = this.siteService.getAssignedSite()
      let serviceType = this.inputForm.value ;

      const item$ = this.serviceTypeService.saveServiceType(site, serviceType)
      if (serviceType.retailServiceType) {
        serviceType.retailServiceType = 1;
      } else {
        serviceType.retailServiceType = 0
      }

      this.action$ = item$.pipe(
        switchMap(
         data => {
            this.serviceType = data;
            this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'top'})
            if (event) { this.onCancel(event) }
            return of(data)
          }
        ), catchError(
          error => {
            this.snack.open(`Update failed. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
            return of(error)
          }
        ))

    };

    updateItemExit(event) {
      this.updateItem(true)
    }

    onCancel(event) {
      this.dialogRef.close();
    }

    deleteItem(event) {

      const site = this.siteService.getAssignedSite()
      if (!this.serviceType) {
        this.snack.open("No item initiated.", "Failure", {duration:2000, verticalPosition: 'top'})
        return
      }
        this.serviceTypeService.delete(site, this.serviceType.id).subscribe( data =>{
          this.snack.open("Item deleted", "Success", {duration:2000, verticalPosition: 'top'})
          this.onCancel(event)
      })
    }

    copyItem(event) {
      //do confirm of delete some how.
      //then
    }



}
