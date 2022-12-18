import { Component,  Inject, OnInit,
  } from '@angular/core';
import { AWSBucketService,  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { FormGroup } from '@angular/forms';
import { ClientTypeService, IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { clientType } from 'src/app/_interfaces';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FbClientTypesService } from 'src/app/_form-builder/fb-client-types.service';
import { Observable, switchMap , of, catchError} from 'rxjs';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-client-type-edit',
  templateUrl: './client-type-edit.component.html',
  styleUrls: ['./client-type-edit.component.scss']
})
export class ClientTypeEditComponent implements OnInit {

  id                     :any;
  clientType             :clientType;
  clientType$             :Observable<clientType>;
  action$                : Observable<any>;
  message                = ''
  bucketName             :string;
  awsBucketURL           :string;
  inputForm              :FormGroup;
  jsonObjectForm         : FormGroup;


  authCodes = [ { id: 1, name: 'Admin'}, {id: 2, name: 'Manager'}, {id: 3, name: 'Employee'}, {id: 4, name: 'User'}, {id: 5, name: 'API'}]
  constructor(
    private clientTypeService       : ClientTypeService,
    private siteService             : SitesService,
    private snack                   : MatSnackBar,
    private awsBucket               : AWSBucketService,
    public fbClientTypesService    : FbClientTypesService,
    public userAuthService         : UserAuthorizationService,
    private dialogRef: MatDialogRef<ClientTypeEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)

  {
    if (data) {
      this.id = data
    }
  }

  ngOnInit() {
    this.initializeForm()
    this.userAuthService.isAdmin
  };

  initializeForm()  {

    this.inputForm = this.initFormFields();
    console.log('id', this.id)
    if (this.inputForm && (!this.id || this.id == undefined)) {
      // const data = {} as clientType;
      // this.clientType = data;
      // this.inputForm.patchValue(data)
      // this.initJSONObjectForm(data.jsonObject)

      this.clientType$= this.initEmptyClientType();
      return ;
    }


    if (this.inputForm && this.id) {
      const site = this.siteService.getAssignedSite();
      this.clientType$ = this.clientTypeService.getClientType(site, this.id).pipe(
        switchMap( data => {
          if (data) {
            this.clientType = data
            this.id         = data.id
            this.inputForm.patchValue(data)
            this.initJSONObjectForm(data.jsonObject)
            return of(data)
          }
          if (!data) {
            return this.initEmptyClientType();
          }
        }
      ))
    }

  };

  initEmptyClientType() {
    this.clientType = {} as clientType
    this.inputForm.patchValue(this.clientType)
    const object = {} as IUserAuth_Properties;
    this.jsonObjectForm =  this.fbClientTypesService.initUserAuthForm(this.jsonObjectForm)
    this.jsonObjectForm.patchValue(object);
    return of(this.clientType)
  }

  initFormFields() {
    this.inputForm  = this.fbClientTypesService.initForm(this.inputForm)
    return this.inputForm;
  };

  initJSONObjectForm(jsonObject: string) {
    this.jsonObjectForm =  this.fbClientTypesService.initUserAuthForm(this.jsonObjectForm)

    if (jsonObject) {
      let object = JSON.parse(jsonObject) as IUserAuth_Properties;
      object = this.initUserAuth(object)
      this.jsonObjectForm.patchValue(object);
    }

    if (!jsonObject) {
      const object = {} as IUserAuth_Properties;
      this.jsonObjectForm.patchValue(object);
    }
  }

  updateItem(event, close: boolean) {
    let result: boolean;
    if (this.inputForm.valid) {
      const site = this.siteService.getAssignedSite()
      let item = {} as IUserAuth_Properties
      if (this.jsonObjectForm) {
        item = this.jsonObjectForm.value as IUserAuth_Properties;
        item = this.initUserAuth(item)
      }
      let clientType = this.inputForm.value as clientType;
      clientType.jsonObject = JSON.stringify(item);

      const item$ = this.clientTypeService.saveClientType(site, clientType)

      this.message =  ''
      this.action$ =  item$.pipe(
        switchMap( data =>  {
            this.message = "Saved"
            this.clientType = data;
            this.snack.open('Item Updated', 'Success', {duration:2000, verticalPosition: 'top'})
              if (close) {this.onCancel(null); }
              return of(data)
            }
          // ,
          // error: error => {
          //   this.snack.open(`Update item. ${error}`, "Failure", {duration:2000, verticalPosition: 'top'})
          //   }
          // }
        ));

      }


  };

  initUserAuth(item: IUserAuth_Properties) : IUserAuth_Properties{
    if (!item.accessDailyReport) {item.accessDailyReport = false};
    if (!item.accessHistoryReports) {item.accessHistoryReports = false}
    if (!item.addEmployee) {item.addEmployee = false}
    if (!item.adjustInventory) {item.adjustInventory = false}
    if (!item.adjustProductCount) {item.adjustProductCount = false}
    if (!item.blindBalanceSheet) {item.blindBalanceSheet = false}
    if (!item.blindClose) {item.blindClose = false}
    if (!item.changeAuths) {item.changeAuths = false}
    if (!item.changeClientType) {item.changeClientType = false}
    if (!item.changeInventoryValue) {item.changeInventoryValue = false}
    if (!item.changeItemPrice) {item.changeItemPrice = false}
    if (!item.closeDay) {item.closeDay = false}
    if (!item.importMETRCPackages) {item.importMETRCPackages = false}
    if (!item.sendEmailBlast) {item.sendEmailBlast = false}
    if (!item.sendTextBlast) {item.sendTextBlast = false}
    if (!item.voidItem) {item.voidItem = false}
    if (!item.voidOrder) {item.voidOrder = false}
    if (!item.voidPayment) {item.voidPayment = false}
    if (!item.deleteClientType) { item.deleteClientType = false }
    if (!item.accessAdmins) { item.accessAdmins = false }
    if (!item.refundItem) {item.refundItem = false}
    if (!item.refundOrder) { item.refundOrder = false }
    if (!item.refundPayment) { item.refundPayment = false }
    if (!item.userAssignedBalanceSheet) { item.userAssignedBalanceSheet = false}
    if (!item.searchBalanceSheets) { item.searchBalanceSheets = false}
    if (!item.deleteEmployee) { item.deleteEmployee = false}
    if (!item.deleteInventory) { item.deleteInventory = false}
    if (!item.deleteProduct) { item.deleteProduct = false}
    return item;
  }

  updateItemExit(event) {
    this.updateItem(event, true)
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteItem(event) {
    // const warn = window.confirm('Are you sure you want to delete this item?')
    // if (!warn) { return }

    const site = this.siteService.getAssignedSite()
    if (!this.clientType) {
      this.snack.open("Item does not exist.", "Success", {duration:2000, verticalPosition: 'top'})
      return
    }

    if (this.clientType.id == undefined) {
      this.snack.open(`Delete failed id not found`, "Failed", {duration:2000, verticalPosition: 'top'})
      return;
    }

    this.action$ = this.clientTypeService.delete(site, this.clientType.id).pipe(
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
