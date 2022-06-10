import { Component,  Inject, OnInit,
} from '@angular/core';
import { AWSBucketService, ContactsService,   } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { ClientTypeService, IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { clientType, IUserProfile } from 'src/app/_interfaces';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbClientTypesService } from 'src/app/_form-builder/fb-client-types.service';
import { StoreCredit, StoreCreditMethodsService } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-store-credit-editor',
  templateUrl: './store-credit-editor.component.html',
  styleUrls: ['./store-credit-editor.component.scss']
})
export class StoreCreditEditorComponent implements OnInit {

  id                     :any;
  bucketName             :string;
  awsBucketURL           :string;
  inputForm              :FormGroup;
  jsonObjectForm         : FormGroup;
  storeCredit            : StoreCredit;
  client$   : Observable<IUserProfile>;

  constructor(
    private storeCreditService      : StoreCreditService,
    private storeCreditMethodsService: StoreCreditMethodsService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private awsBucket               : AWSBucketService,
    private fbClientTypesService    : FbClientTypesService,
    private contactsService         : ContactsService,
    private dialogRef               : MatDialogRef<StoreCreditEditorComponent>,
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

 initializeForm()  {
    this.initFormFields()
    if (this.inputForm && this.id) {
      const site = this.siteService.getAssignedSite();
      this.storeCreditService.getStoreCredit(site, this.id).subscribe(data =>
        {
          this.storeCredit = data
          this.id         = data.id
          if (this.storeCredit.clientID) {
            this.client$    = this.contactsService.getContact(site,this.storeCredit.clientID.toString())
          }
          this.inputForm.patchValue(data)
        }
      )
    } else {
      this.storeCredit = {} as StoreCredit;
      this.inputForm.patchValue(this.storeCredit)
    }
  };

  initFormFields() {
    this.inputForm  = this.storeCreditMethodsService.getStoreCreditForm(this.inputForm)
  }

  assignCustomer(event) {
    if (event) {
      const user = event as IUserProfile;
      if (user) {
        const site                = this.siteService.getAssignedSite();
        this.storeCredit.clientID = user.id
        this.storeCredit.userName = user.userName;
        this.storeCredit.accountNumber = user.accountNumber;
        this.client$ = this.contactsService.getContact(site, this.storeCredit.clientID.toString())
        this.storeCreditService.save(site, this.storeCredit).subscribe( data => {
          this.inputForm.patchValue(data)
        })

      }
    }
  }

  removeCustomer() {
    if (!this.storeCredit) { return }
    const site                = this.siteService.getAssignedSite();
    this.storeCredit.clientID = 0
    this.storeCredit.userName = '';
    this.storeCredit.accountNumber = '';
    this.client$ = this.contactsService.getContact(site, this.storeCredit.clientID.toString())
    this.storeCreditService.save(site, this.storeCredit).subscribe( data => {
      this.inputForm.patchValue(data)
    })
  }

  updateItem(event) {
    let result: boolean;
    if (this.inputForm.valid) {
      const site = this.siteService.getAssignedSite()
      let storeCredit = this.inputForm.value as StoreCredit;
      return  this.storeCreditService.save(site, storeCredit)
    }
    this.snack.open('Form not valid', 'Failed', {duration:2000, verticalPosition: 'top'})
  };

  updateItemExit(event) {
    const storeCredit$ =  this.updateItem(event)
    if (!storeCredit$) { return }
    storeCredit$.subscribe( {
      next: data => {
            this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'top'})
            this.onCancel(event);
        },
      error: error => {
        this.snack.open(`Update item. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
        }
      }
    )
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {
    const site = this.siteService.getAssignedSite()
    if (!this.storeCredit) {
      this.snack.open("Item note initiated", "Success", {duration:2000, verticalPosition: 'top'})
      return
    }
    this.storeCreditService.delete(site,this.storeCredit.id).subscribe( data =>{
        this.snack.open("Item deleted", "Success", {duration:2000, verticalPosition: 'top'})
        this.onCancel(event)
    })
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }



}

