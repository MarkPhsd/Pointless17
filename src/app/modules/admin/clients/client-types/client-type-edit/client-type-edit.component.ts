

import { Component,  Inject, OnInit,
  } from '@angular/core';
import { AWSBucketService,  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { clientType } from 'src/app/_interfaces';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbClientTypesService } from 'src/app/_form-builder/fb-client-types.service';

@Component({
  selector: 'app-client-type-edit',
  templateUrl: './client-type-edit.component.html',
  styleUrls: ['./client-type-edit.component.scss']
})
export class ClientTypeEditComponent implements OnInit {

  id                     :any;
  clientType             :clientType;
  bucketName             :string;
  awsBucketURL           :string;
  inputForm              :FormGroup;

  constructor(
    private clientTypeService       : ClientTypeService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private awsBucket               : AWSBucketService,
    private fbClientTypesService    : FbClientTypesService,
    private dialogRef: MatDialogRef<ClientTypeEditComponent>,
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
      this.clientTypeService.getClientType(site, this.id).subscribe(data =>
        {
            this.clientType = data
            this.id         = data.id
            this.inputForm.patchValue(data)
          }
      )
    } else {
      this.clientType = {} as clientType
      this.inputForm.patchValue(this.clientType)
    }

  };

  initFormFields() {
    this.inputForm  = this.fbClientTypesService.initForm(this.inputForm)
  }

  async updateItem(event): Promise<boolean> {
    let result: boolean;

    return new Promise(resolve => {
        if (this.inputForm.valid) {
        const site = this.siteService.getAssignedSite()
        const product$ = this.clientTypeService.saveClientType(site, this.inputForm.value)
        product$.subscribe( data => {
          this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'top'})
          resolve(true)
        }, error => {
          this.snack.open(`Update item. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
          resolve(false)
        })
        }
      }
    )

  };

  async updateItemExit(event) {
    const result = await this.updateItem(event)
    if (result) {
      this.onCancel(event);
    }
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite()
    if (!this.clientType) {
      this.snack.open("Item note initiated", "Success", {duration:2000, verticalPosition: 'top'})
      return
    }
    this.clientTypeService.delete(site,this.clientType.id).subscribe( data =>{
        this.snack.open("Item deleted", "Success", {duration:2000, verticalPosition: 'top'})
        this.onCancel(event)
    })
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }



}
