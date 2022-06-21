
import { Component,  Inject, OnInit } from '@angular/core';
import { AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormGroup } from '@angular/forms';
import { IServiceType } from 'src/app/_interfaces';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { FbServiceTypeService } from 'src/app/_form-builder/fb-service-type.service';
import { tap } from 'rxjs/operators';

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
        const serviceType$ = this.serviceTypeService.getType(site, this.id).pipe(
            tap(data => {
              this.serviceType = data
              this.id         = data.id
              this.inputForm.patchValue(this.serviceType)
            }
          )
        );
        serviceType$.subscribe(
          data => {
            this.serviceType = data
            this.id          = data.id
        })
      }

      if (!this.id)  {
        this.serviceType = {} as IServiceType;
        this.inputForm.patchValue(this.serviceType)
      }

    };

    initFormFields() {
      this.inputForm  = this.fbServiceTypeService.initForm(this.inputForm)
    }

    updateItem(event: any)  {

      if (!this.inputForm.valid) { return }
      const site = this.siteService.getAssignedSite()
      const serviceType = this.inputForm.value as IServiceType;
      const product$ = this.serviceTypeService.saveServiceType(site, serviceType)

      product$.subscribe(
        {next: data => {
          this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'top'})
            if (event) {
              this.onCancel(event);
            }
          }, error: error => {
            this.snack.open(`Update failed. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
          }
        }
      )
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
