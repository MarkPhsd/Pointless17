import { Component,  Inject, OnInit,
} from '@angular/core';
import { AWSBucketService, ContactsService,   } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { ClientTypeService, IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { clientType, IUserProfile } from 'src/app/_interfaces';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { FbClientTypesService } from 'src/app/_form-builder/fb-client-types.service';
import { StoreCredit, StoreCreditMethodsService } from 'src/app/_services/storecredit/store-credit-methods.service';
import { StoreCreditService } from 'src/app/_services/storecredit/store-credit.service';
import { Observable, of } from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { EditButtonsStandardComponent } from 'src/app/shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { ValueFieldsComponent } from '../../products/productedit/_product-edit-parts/value-fields/value-fields.component';

@Component({
  selector: 'app-store-credit-editor',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    EditButtonsStandardComponent,ValueFieldsComponent,
  SharedPipesModule],
  templateUrl: './store-credit-editor.component.html',
  styleUrls: ['./store-credit-editor.component.scss']
})
export class StoreCreditEditorComponent implements OnInit {

  id                     :any;
  bucketName             :string;
  awsBucketURL           :string;
  inputForm              :UntypedFormGroup;
  jsonObjectForm         : UntypedFormGroup;
  storeCredit            : StoreCredit;
  client$   : Observable<IUserProfile>;
  action$: Observable<any>;
  constructor(
    private storeCreditService      : StoreCreditService,
    private storeCreditMethodsService: StoreCreditMethodsService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private awsBucket               : AWSBucketService,
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
          if (data.cardNum) {
            data.cardNum =  data.cardNum.trim()
          }
          this.id         = data.id
          if (this.storeCredit.clientID) {
            this.client$    = this.contactsService.getContact(site,this.storeCredit.clientID)
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
        this.client$ = this.contactsService.getContact(site, this.storeCredit.clientID)
        this.storeCreditService.save(site, this.storeCredit).subscribe( data => {
          data.cardNum = data.cardNum.trim();
          data.cardData = data.cardData.trim();
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
    this.client$ = this.contactsService.getContact(site, this.storeCredit.clientID)
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
        // this.snack.open(`Update item. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
        this.siteService.notify('Error:' + error.toString(), "close", 5000, 'red', 'top' )
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
    this.action$ = this.storeCreditService.delete(site,this.storeCredit.cardNum).pipe(
      switchMap( data =>{
        this.snack.open("Item deleted", "Success", {duration:2000, verticalPosition: 'top'})
        this.onCancel(event)
        return of(data)
    }),catchError(data => {
      this.siteService.notify('Error:' + data.toString(), "close", 5000, 'red', 'top' )
      return of(data)
    }))
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }



}

