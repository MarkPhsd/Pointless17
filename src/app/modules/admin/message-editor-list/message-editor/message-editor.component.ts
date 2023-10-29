import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, of, Observable, catchError } from 'rxjs';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IRequestMessage, RequestMessageService } from 'src/app/_services/system/request-message.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-message-editor',
  templateUrl: './message-editor.component.html',
  styleUrls: ['./message-editor.component.scss']
})
export class MessageEditorComponent implements OnInit {

  requestMessage      : IRequestMessage;
  action$             : Observable<any>;
  inputForm           : UntypedFormGroup;
  message             =  ""
  performingAction    = false;
  group               : string;
  typeList            = this.messageService.messageTypes
  blogPost$ : Observable<any>;
  blogContent: string;
  slug: string;

  errrMessage: string;

  constructor(private fb: UntypedFormBuilder,
              private messageService: RequestMessageService,
              private siteService: SitesService,
              private _snackBar: MatSnackBar,
              private uiSettings : UISettingsService,
              public labelingService: LabelingService,
              private dialogRef: MatDialogRef<MessageEditorComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any) {

  const site = siteService.getAssignedSite();

  if (!data || !data.id) {
    this.requestMessage = {} as IRequestMessage;
    this.initForm(this.requestMessage)
    return;
  }

  this.performingAction = true;

  this.action$ = this.messageService.getRequestMessage(site, data.id).pipe(
      switchMap( data => {
        this.initForm(data)
        this.performingAction = false
        return of(data)
      }
    ),
    catchError(
        switchMap( error => {
          this.performingAction = false
          this.siteService.notify('Error ' + error, 'Close', 3000, 'red')
          return of(Error)
        }
      )
    )
  )

}

  ngOnInit(): void {
    const i = 0;
  }

  initForm(data) {

    this.requestMessage = data;

    this.group = 'empty';

    if (data && data?.group) {
      this.group = data?.group
    }

    this.inputForm = this.fb.group(
      {
        id     : [],
        name   : [  ,[Validators.required, Validators.max(50)]],
        parameters      : [],
        method          : [],
        type            : [],
        subject         : [],
        roles           : [],
        requestDate     : [],
        requestCompleted: [],
        payload         : [],
        userRequested   : [],
        userID          : [],
        senderName      : [],
        senderID        : [],
        archived        : [],
        message         : [],
        employeeID      : [],
        orderID         : [],
        orderItemID     : [],
        template        : [],
        balanceZero     : [],
      }
    )

    this.requestMessage = data as IRequestMessage;
    this.inputForm.patchValue(data);
  }

  outPutList(event) {
    const item = event;
    const value = JSON.stringify(item);
    this.inputForm.patchValue({menuSections: value})
  }


  updateItem(event): Observable<IRequestMessage> {
    const site = this.siteService.getAssignedSite()

    this.message = ""
    this.performingAction= true;

    if (!this.inputForm.valid) {
      this.siteService.notify('Error occured in form', 'close', 2000, 'red') // ).notifyEvent('Something is wrong with the form. Please confirm', 'Alert')
      return of(null)
    }

    this.requestMessage  = this.inputForm.value as IRequestMessage;
    // this.blog.group       = this.group;
    const item$ = this.messageService.saveMessageData(site, this.requestMessage);
    return item$.pipe(
      switchMap(
        data => {
          this.requestMessage = data;
          this.performingAction = false;
          return of(data);
        }
    ))
  };

  updateSave(event) {
    this.action$ = this.updateItem(event);
  }

  onCancel(event) {
    this.dialogRef.close({complete: true});
  }

  updateItemExit(event) {
    this.performingAction = true
    this.action$ = this.updateItem(event).pipe(
      switchMap ( data => {
        this.performingAction = false;
        this.onCancel(event);
        return of(data);
      }),
      catchError(
          switchMap( error => {
            this.performingAction = false
            this.siteService.notify('Error ' + error, 'Close', 3000, 'red')
            return of(Error)
          }
        )
      )
    );
  };

  archiveItem(event) {
    const site = this.siteService.getAssignedSite()
    if (!this.requestMessage || !this.requestMessage.id ) {
      this._snackBar.open("No item Selected", "Success")
       return
    }

    this.requestMessage.archived = true;
    this.messageService.saveMessageData(site, this.requestMessage).subscribe( data =>{
      this._snackBar.open("Item archived", "Success")
      this.onCancel(event)
    })
  }

  getMessageType(type: string) {
    if (type) {
     const item = this.messageService.messageTypes.find(data => {
        return data.id == type
      })
      return item
    }
  }

}
