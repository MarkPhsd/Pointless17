import { Component, OnInit ,Input, Inject } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { FbSettingsService } from 'src/app/_form-builder/fb-settings.service';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
@Component({
  selector: 'app-edit-cssstyles',
  templateUrl: './edit-cssstyles.component.html',
  styleUrls: ['./edit-cssstyles.component.scss']
})
export class EditCSSStylesComponent implements OnInit {

  @Input()  setting : ISetting;
  inputForm         : UntypedFormGroup;
  id                : string;

  receiptText = '';
  isLabel:  boolean;
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

  receiptStyle$       = this.settingsService.getSettingByNameCached(this.siteService.getAssignedSite(), 'ReceiptStyles').pipe(switchMap(data => { 
    console.log(data.text)
    return of(data)
  })) 
  
  constructor(
    private settingsService  : SettingsService,
    private siteService      : SitesService,
    private fbService        : FbSettingsService,
    private dialogRef        : MatDialogRef<EditCSSStylesComponent>,
    public  route            : ActivatedRoute,
    private renderingService : RenderingService,
    @Inject(MAT_DIALOG_DATA) public data: any
    )
  {
    if (data) {
      this.setting = data
      this.initForm()
    }
  }

  initForm() {
    this.inputForm    = this.fbService.initForm(this.inputForm)
    if (this.setting) {  this.inputForm.patchValue(this.setting)  }
  }

  ngOnInit() {
    console.log('')
    localStorage.removeItem('https://localhost:44309/api/settings/getSettingByName?name=ReceiptStyles')
  }

  async resetDefault() {
    const result = window.confirm('Rest to default styles?')
    if (result) {
      const site = this.siteService.getAssignedSite();
      const setting = await this.settingsService.setDefaultReceiptStyles(site)
      this.setting = setting;
      this.initForm()
    }
  }


  onCancel() {
    this.dialogRef.close(this.setting);
  }

  update() {
    const site = this.siteService.getAssignedSite();
    this.settingsService.putSetting(site, this.setting.id, this.inputForm.value).subscribe(
      { next: data =>  {
          this.notify('Saved', 'Success')
        },
        error: err => {
          this.notify(err, 'Failed')
        }
      }
    )
  }

  deleteCachedStyles() { 

  }

  notify(message, title) {
    this.siteService.notify(message, title,2000)
  }

  refreshOrderData() {
    this.interpolatedHeaderTexts    = this.renderingService.refreshStringArrayData(this.setting.option5, this.order, 'header')
  }
  refreshItemData() {
    this.interpolatedItemTexts      = this.renderingService.refreshStringArrayData(this.setting.text, this.items, 'items')
  }

  refreshFooterData() {
    this.interpolatedFooterTexts    = this.renderingService.refreshStringArrayData(this.setting.option6, this.order, 'footer')
  }

  refreshPaymentsFooter() {
    this.interpolatedPaymentsTexts  = this.renderingService.refreshStringArrayData(this.setting.option7, this.payments, 'payments')
  }

  refreshSubFooter() {
    this.interpolatedSubFooterTexts = this.renderingService.refreshStringArrayData(this.setting.option8, this.orderTypes , 'footer')
  }

  copy() {
    const site = this.siteService.getAssignedSite();
    this.settingsService.postSetting(site, this.inputForm.value).subscribe(data =>  {
      this.notify('Saved', 'Success')
    }, err => {
      this.notify(err, 'Failed')
    })
  }

  delete() {
    const result = window.confirm('Are you sure you want to delete this style sheet?')
    if (result) {
      const site = this.siteService.getAssignedSite();
      this.settingsService.deleteSetting(site, this.setting.id).subscribe(data =>  {
        this.dialogRef.close();
      })
    }
  }


}
