import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { ISetting } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Observable,switchMap,of } from 'rxjs';
import { FbSettingsService } from 'src/app/_form-builder/fb-settings.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ReceiptLayoutComponent } from 'src/app/shared-ui/printing/receipt-layout/receipt-layout.component';

@Component({
  selector: 'app-htmledit-printing',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    ReceiptLayoutComponent,
  SharedPipesModule],
  templateUrl: './htmledit-printing.component.html',
  styleUrls: ['./htmledit-printing.component.scss']
})

export class HTMLEditPrintingComponent implements OnInit {

  // get name()        { return this.inputForm.get("name") as FormControl;}
  // get item()        { return this.inputForm.get("text") as FormControl;}
  // get header()      { return this.inputForm.get("header") as FormControl;}
  // get footer()      { return this.inputForm.get("footer") as FormControl;}
  // get payment()     { return this.inputForm.get("payment") as FormControl;}
  // get orderType()   { return this.inputForm.get("orderType") as FormControl;}

  @ViewChild('printsection') printsection: ElementRef;
  @Input() setting: ISetting;
  setting$        : Observable<ISetting>;
  inputForm       : UntypedFormGroup;
  liveEditForm    : UntypedFormGroup;
  liveEdit        : boolean;

  receiptText = '';
  isLabel:  boolean;
  id        : string;
  items     : any[];
  order     : any;
  payments  : any[];
  orderTypes : any;

  interpolatedItemText  : string;
  interpolatedHeaderText: string;
  interpolatedFooterText: string;
  printerWidthValue = 80*1.6
  setPrinterWidthClass = "receipt-with-80"
  headerText       : string;
  itemsText        : string;
  footerText       : string;
  paymentsText     : string;
  paymentCreditText : string;
  paymentWEICEBT   : string;
  subFooterText    : string;

  imageLabel$               : Observable<any>;
  labelImage64              : string;
  imageLable$: Observable<any>;
  receiptLayoutSetting  : ISetting;
  receiptStyles         : ISetting;

  interpolatedItemTexts = [] as string[];
  interpolatedHeaderTexts = {} as string[];
  interpolatedFooterTexts = [] as string[];
  interpolatedPaymentsTexts = [] as string[];
  interpolatedCreditPaymentsTexts = [] as string[];
  interpolatedWICEBTPaymentsTexts = [] as string[];
  interpolatedSubFooterTexts = [] as string[];

  constructor(
              private settingsService  : SettingsService,
              private siteService      : SitesService,
              private _snackBar        : MatSnackBar,
              private printingService  : PrintingService,
              private fbSettingsService: FbSettingsService,
              private dialogRef        : MatDialogRef<HTMLEditPrintingComponent>,
              public  route            : ActivatedRoute,
              private renderingService : RenderingService,
              private fakeData         : FakeDataService,
              private fb               : UntypedFormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any
              )
  {
    if (data) {
      this.setting = data.setting

      this.printerWidthValue = parseInt(data.option9);
      this.setPrinterWidthValue();

    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }

    // console.log('thisprinterDiwthValue', this.printerWidthValue)
    if (this.printerWidthValue) {

    }
  }

  async ngOnInit() {
    this.isLabel = true
    this.initializeForm()
    this.initSubComponent( this.setting, this.receiptStyles )
    this.isLabel = true
    this.initLiveEditForm();
  }

  async initializeForm()  {
    this.initFormFields();
    this.refresh();
  };

  initLiveEditForm() {
    this.liveEditForm = this.fb.group({
      liveEdit: ['']
    })
    this.liveEditForm.valueChanges.subscribe(data => {
      this.liveEdit = this.liveEditForm.controls['liveEdit'].value;
    })
  }

  refresh() {
    if (!this.inputForm || !this.setting) { return }
      const site = this.siteService.getAssignedSite();
      this.setting$ = this.settingsService.getSetting(site, this.setting.id)

      this.setting$.subscribe(
        data => {
        this.setting = data
        this.inputForm.patchValue(data)
        this.isLabel = true

        this.printerWidthValue = parseInt(data.option9);
        this.setPrinterWidthValue();

        if (!this.setting.description) { return }

        if ( this.setting.description.toLowerCase() != 'labels') { this.isLabel = false  }

        if ( this.setting.description.toLowerCase() === 'labels')
        {
          this.refreshLabelImage();
        } else {
          // this.refreshData()
        }
      }
    )
  }

  refreshOrderData() {
    this.interpolatedHeaderTexts    = this.renderingService.refreshStringArrayData(this.setting.option5, this.order, 'header' )
  }

  refreshItemData() {
    this.interpolatedItemTexts      = this.renderingService.refreshStringArrayData(this.setting.text, this.items, 'items' )
  }

  refreshFooterData() {
    this.interpolatedFooterTexts    = this.renderingService.refreshStringArrayData(this.setting.option6, this.order, 'footer' )
  }

  refreshPaymentsFooter() {
    this.interpolatedPaymentsTexts  = this.renderingService.refreshStringArrayData(this.setting.option7, this.payments, 'payments' )
  }

  refreshCreditPaymentsFooter() {
    this.interpolatedCreditPaymentsTexts  = this.renderingService.refreshStringArrayData(this.setting.option11, this.payments, 'payments' )
  }

  refreshWICEBTPaymentsFooter() {
    this.interpolatedWICEBTPaymentsTexts  = this.renderingService.refreshStringArrayData(this.setting.option10, this.payments, 'payments' )
  }

  refreshSubFooter() {
    this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.setting.option8, this.orderTypes, 'ordertypes' )
  }

  initSubComponent(receiptPromise, receiptStylePromise) {
    try {
      //init sub coomponent
      if (receiptPromise && receiptStylePromise) {
        this.receiptLayoutSetting =  receiptPromise
        this.headerText           =  this.receiptLayoutSetting.option6
        this.footerText           =  this.receiptLayoutSetting.option5
        this.itemsText            =  this.receiptLayoutSetting.text
        this.paymentsText         =  this.receiptLayoutSetting.option7
        this.subFooterText        =  this.receiptLayoutSetting.option8
        this.paymentsText         =  this.receiptLayoutSetting.option7
        this.paymentWEICEBT       = this.receiptLayoutSetting.option10;
        this.paymentCreditText    = this.receiptLayoutSetting.option11;
        this.subFooterText        =  this.receiptLayoutSetting.option8
      }
    } catch (error) {
      console.log(error)
    }
  }

   refreshLabelImage() {
    if (!this.setting) {return}
    const item = this.fakeData.getInventoryItemTestData();
    this.imageLabel$ = this.printingService.refreshInventoryLabelObs(this.setting.text, item).pipe(
      switchMap(data => {
        this.labelImage64 = data
        return of(data)
      })
    )
  }

  setPrinterWidthValue() {
    if (!this.setting) {
      return
    }
    // console.log(this.setting.option9)
    this.printerWidthValue = parseInt(this.setting.option9);
    if (this.printerWidthValue == 58) {
      this.setPrinterWidthClass = "receipt-width-58"
    }
    if (this.printerWidthValue == 80) {
      this.setPrinterWidthClass = "receipt-width-80"
    }
    if (this.printerWidthValue == 85) {
      this.setPrinterWidthClass = "receipt-width-85"
    }
  }

  interpolateText(item: any, text: string) {
    return this.renderingService.interpolateText(item,text)
  }

  initFormFields() {
    this.inputForm  = this.fbSettingsService.initForm(this.inputForm)
  }

  delete() {
    if (!this.setting) { return }
    const site = this.siteService.getAssignedSite();

    if (this.setting.name === 'ReceiptStyles') {
      //DeleteSettingByName
      const obs$ = this.settingsService.deleteSettingByName(site, this.setting.name)
      obs$.subscribe( data => {
        // this._snackBar.open("Item deleted.", "Success")
      })
    }

    const obs$ = this.settingsService.deleteSetting(site, this.setting.id)
    obs$.subscribe( data => {
      this._snackBar.open("Item deleted.", "Success")
    })
  }

  onCancel() {
    this.dialogRef.close();
  }

  copy() {
    if (this.setting) {
      const site    = this.siteService.getAssignedSite();
      const setting = this.setting;
      const id      = 0;
      this.setting.name  = `${this.setting.name} - new`
      const obs$ = this.settingsService.postSetting(site, setting)
      obs$.subscribe(
        data =>
        {
          this.setting = data
          this._snackBar.open('Copy saved- Please Rename Name .', 'Success')
          this.initFormFields();
          this.refresh();
        }
      )
    }
  }

  update() {
    if (this.setting) {
      const site      = this.siteService.getAssignedSite();
      let setting     = this.setting;
      const id        = this.setting.id;

      if (this.isLabel) {
        this.setting.description = "labels"
      }

      setting.option9 = this.printerWidthValue.toString();
      const obs$ = this.settingsService.putSetting(site, id, setting)
      obs$.subscribe(
        data =>
        {
          this._snackBar.open('Changes saved.', 'Success')
          if (this.isLabel) {
            this.refresh()
            setTimeout(() => {
              this._snackBar.dismiss()
            }, 5000);
          }
        }
      )
    }
  }

}


// refreshData() {
//   // try {
//   //   if (this.orders && this.items && this.payments && this.orderTypes) {
//   //     this.interpolatedHeaderText        =  this.renderingService.interpolateText(this.orders, this.setting.option6)
//   //     this.interpolatedItemText          =  this.renderingService.interpolateText(this.items, this.setting.text)
//   //     this.interpolatedFooterText        =  this.renderingService.interpolateText(this.orders, this.setting.option5)
//   //     this.interpolatedPaymentsTexts     =  this.renderingService.interpolateText(this.payments, this.setting.option7)
//   //     this.interpolatedSubFooterTexts    =  this.renderingService.interpolateText(this.orderTypes, this.setting.option8)
//   //   }
//   // } catch (error) {
//   //   console.log(error)
//   // }

//   // try {
//   //   this.interpolatedHeaderText    =  this.renderingService.interpolateText(this.fakeData.getOrder(), this.setting.option6)
//   //   this.interpolatedItemText      =  this.renderingService.interpolateText(this.fakeData.getItemData(), this.setting.text)
//   //   this.interpolatedFooterText    =  this.renderingService.interpolateText(this.fakeData.getOrder(), this.setting.option5)
//   //   this.interpolatedPaymentsTexts     =  this.renderingService.interpolateText(this.fakeData.getPayments(), this.setting.option7)
//   //   this.interpolatedSubFooterTexts    =  this.renderingService.interpolateText(this.fakeData.getOrderType(), this.setting.option8)
//   // } catch (error) {
//   //   console.log(error)
//   // }
// }
