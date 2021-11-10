import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { IOrderItem, ISetting } from 'src/app/_interfaces';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { FbSettingsService } from 'src/app/_form-builder/fb-settings.service';
import { tap } from 'rxjs/operators';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { IPOSOrderItem } from 'src/app/_interfaces/transactions/posorderitems';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { LabelaryService, zplLabel } from 'src/app/_services/labelary/labelary.service';

@Component({
  selector: 'app-htmledit-printing',
  templateUrl: './htmledit-printing.component.html',
  styleUrls: ['./htmledit-printing.component.scss']
})

export class HTMLEditPrintingComponent implements OnInit {

  get name()        { return this.inputForm.get("name") as FormControl;}
  get item()        { return this.inputForm.get("text") as FormControl;}
  get header()      { return this.inputForm.get("header") as FormControl;}
  get footer()      { return this.inputForm.get("footer") as FormControl;}
  get payment()     { return this.inputForm.get("payment") as FormControl;}
  get orderType()   { return this.inputForm.get("orderType") as FormControl;}

  @ViewChild('printsection') printsection: ElementRef;
  @Input() setting: ISetting;
  setting$        : Observable<ISetting>;
  inputForm       : FormGroup;

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
  subFooterText    : string;

  labelImage$               : Observable<any>;
  labelImage64              : string;

  receiptLayoutSetting  : ISetting;
  receiptStyles         : ISetting;

  interpolatedItemTexts = [] as string[];
  interpolatedHeaderTexts = {} as string[];
  interpolatedFooterTexts = [] as string[];
  interpolatedPaymentsTexts = [] as string[];
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

    console.log('thisprinterDiwthValue', this.printerWidthValue)
    if (this.printerWidthValue) {

    }
  }

  async ngOnInit() {
    this.isLabel = true
    this.initializeForm()
    this.initSubComponent( this.setting, this.receiptStyles )
    this.isLabel = true
  }

  async initializeForm()  {
    this.initFormFields();
    this.refresh();
  };

  refresh() {
    if (!this.inputForm || !this.setting) { return }
      const site = this.siteService.getAssignedSite();
      this.setting$ = this.settingsService.getSetting(site, this.setting.id).pipe( )
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
    this.interpolatedHeaderTexts    = this.renderingService.refreshStringArrayData(this.setting.option5, this.order)
  }
  refreshItemData() {
    this.interpolatedItemTexts      = this.renderingService.refreshStringArrayData(this.setting.text, this.items)
  }

  refreshFooterData() {
    this.interpolatedFooterTexts    = this.renderingService.refreshStringArrayData(this.setting.option6, this.order)
  }

  refreshPaymentsFooter() {
    this.interpolatedPaymentsTexts  = this.renderingService.refreshStringArrayData(this.setting.option7, this.payments)
  }

  refreshSubFooter() {
    console.log(this.orderTypes)
    this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.setting.option8, this.orderTypes )
  }

  initSubComponent(receiptPromise, receiptStylePromise) {
    try {
      if (receiptPromise && receiptStylePromise) {
        //init sub coomponent
        this.receiptLayoutSetting =  receiptPromise
        this.headerText           =  this.receiptLayoutSetting.option6
        this.footerText           =  this.receiptLayoutSetting.option5
        this.itemsText            =  this.receiptLayoutSetting.text
        this.paymentsText         =  this.receiptLayoutSetting.option7
        this.subFooterText        =  this.receiptLayoutSetting.option8
      }
    } catch (error) {
      console.log(error)
    }
  }

  async refreshLabelImage() {
    if (!this.setting) {return}
    const item = this.fakeData.getInventoryItemTestData();
    this.labelImage64 = await this.printingService.refreshInventoryLabel(this.setting.text, item)
  }

  setPrinterWidthValue() {
    if (!this.setting) {
      return
    }
    console.log(this.setting.option9)
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
