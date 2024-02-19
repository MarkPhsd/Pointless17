
import { Component,  Inject, OnInit } from '@angular/core';
import { AWSBucketService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormGroup } from '@angular/forms';
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

  serviceColor: string;
  id                     : number;
  serviceType            : IServiceType;
  bucketName             : string;
  awsBucketURL           : string;
  inputForm              : UntypedFormGroup;
  description            : string;
  action$                : Observable<any>;

  constructor(
    private serviceTypeService      : ServiceTypeService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private fbServiceTypeService    : FbServiceTypeService,
    private dialogRef: MatDialogRef<ServiceTypeEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)

  {
    this.id = 0
    if (data) {
      this.id = data
    }
    if (!data || data == 0) {
      this.id = 0
    }
  }

     ngOnInit() {
      this.initializeForm();
      // this.bucketName =       await this.awsBucket.awsBucket();
      // this.awsBucketURL =     await this.awsBucket.awsBucketURL();
    };

    initializeForm()  {

      this.initFormFields()
      const site = this.siteService.getAssignedSite();
      let service$ : Observable<unknown>;

      if (this.id == 0) {
        // console.log('this id =0')
        const service = {} as IServiceTypePOSPut;
        service$  = this.serviceTypeService.postServiceType(site, service)

      }

      if (this.id != 0) {
        // console.log('this id !0')
        service$  = this.serviceTypeService.getType(site, this.id)  //as Observable<IServiceType>;
      }

      this.action$ = service$.pipe(switchMap(data => {
            this.serviceType = {} as IServiceType;
            if (data) {
              this.serviceType = data as unknown as IServiceType;
              this.id          = this.serviceType.id;
              this.serviceColor = this.serviceType.serviceColor
            }
            this.inputForm.patchValue(this.serviceType)
            return of(data)
          }
        )),catchError( error => {
          this.snack.open(`Issue. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
          return of(error)
        })

      // }

    };

    initFormFields() {
      this.inputForm  = this.fbServiceTypeService.initForm(this.inputForm)
    }

    updateItem(event: any)  {

      if (!this.inputForm.valid) { return }
      const site = this.siteService.getAssignedSite()
      let serviceType = this.inputForm.value ;
      if (this.serviceType) {
        serviceType.serviceColor = this.serviceColor;
      }

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
            this.inputForm.patchValue(this.serviceType)
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

    deleteDefaultProductID1() {
      this.inputForm.patchValue({defaultProductID1: 0})
      this.updateItem(null)
    }

    deleteDefaultProductID2() {
      this.inputForm.patchValue({defaultProductID2: 0})
      this.updateItem(null)
    }

    _deleteDefaultProductID1(event)  {
      this.inputForm.patchValue({defaultProductID1: 0})
      this.updateItem(null)
    }
    _deleteDefaultProductID2(event)  {
      this.inputForm.patchValue({defaultProductID2: 0})
      this.updateItem(null)
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
