import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IProduct, ISetting } from 'src/app/_interfaces';
import { Observable, of, switchMap } from 'rxjs';
// import { ElectronService } from 'ngx-electron';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatLegacyOptionModule } from '@angular/material/legacy-core';
import { MatLegacySelectModule } from '@angular/material/legacy-select';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
@Component({
  selector: 'app-label-view-selector',
  standalone: true,
  imports: [CommonModule,FormsModule,MatLegacyOptionModule,MatLegacySelectModule,MatLegacyFormFieldModule],
  templateUrl: './label-view-selector.component.html',
  styleUrls: ['./label-view-selector.component.scss']
})
export class LabelViewSelectorComponent implements OnInit {
  @Output() outputLabelSetting  :      EventEmitter<any> = new EventEmitter();
  @Output() outPutLabelID:      EventEmitter<any> = new EventEmitter();
  @Input() labelList$           : Observable<ISetting[]>;
  @Input() zplSetting           : ISetting;
  @Input() labelID              : number;
  @Input() inventoryItem        : IInventoryAssignment;
  label$ : Observable<any>;

  labelImage64                  : any;
  product                       : IProduct
  @Input()  labelImageHeight     = 200;

  @Input() set setProduct(product: IProduct) {
    this.product = product;
    if (this.labelID) {
      console.log('refresh product label')
      this.refreshLabelSettings(this.labelID)
    }
  }

  @Input() set setInventoryAssignment(inventoryAssignment: IInventoryAssignment) {
    if (this.labelID) {
      this.inventoryItem = inventoryAssignment;
      this.refreshLabelSettings(this.labelID)
    }
  }

  // private electronService  : ElectronService,
  constructor(
              private snack             : MatSnackBar,
              private settingService    : SettingsService,
              private siteService       : SitesService,
              private printingService   : PrintingService,
              private fakeData          : FakeDataService,
              private renderingService  : RenderingService,
              private dialog            : MatDialog,) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();

    this.labelList$       =  this.settingService.getLabels(site);
    if (this.labelID) {
      // console.log('refreshLabelSettings')
      this.refreshLabelSettings(this.labelID)
      return
    }

    if (!this.labelID) {
      // console.log('refreshDefaultLabel')
      this.refreshDefaultLabel();
      return
    }
  }

  get labelImageHeightDescription() {
    return `${this.labelImageHeight}px`
  }

  refreshDefaultLabel() {
    const site = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSettingByName(site, 'ZPLTemplate');
    zplTemp$.subscribe(data => {
      if (!data){
        console.log('no data')
        return
      }
       this.zplSetting  = data
       this.refreshLabelImage(data);
    })
  }

  refreshLabelSettings(id: number) {
    if (!id) {   return this.outPutLabelID.emit(0)  }
    const site = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSetting(site, id);
    this.outPutLabelID.emit(id);
    zplTemp$.subscribe(data => {
      if (!data){
        console.log('no data')
        return
      }
      this.zplSetting  = data
      this.refreshLabelImage(data);
    })
  }

  refreshLabelImage(zplSetting: ISetting) {
    const site = this.siteService.getAssignedSite();
    if (!zplSetting) { return }

    // console.log('product', this.product)
    if(this.inventoryItem) {
      // console.log('refresh inventory item', this.inventoryItem)
      this.refreshLabel(zplSetting, this.inventoryItem)
      return
    }
    if (this.product) {
      // console.log('refresh product item', this.product)
      this.refreshLabel(zplSetting, this.product)
      return
    };

    // console.log('refresh fake data')
    // const item  =  this.fakeData.getInventoryItemTestData();
    // this.refreshLabel(zplSetting, item)
  }

  refreshLabel(zplSetting: ISetting, item: any) {

    if (!zplSetting) { return }
    if (!zplSetting.text) { return }
    if (!item) { return }

    const template = zplSetting.text;
    const labeldata  = item;
    // console.log('label template', template)
    // console.log('label data', labeldata)
    this.label$ = this.printingService.refreshInventoryLabelOBS(template, labeldata).pipe(
      switchMap(data => {
        if (!data){
          console.log('refreshLabel no data')
          return
        }
        // console.log('refreshLabel Info', data)
        this.outPutLabelID.emit(zplSetting.id);
        this.outputLabelSetting.emit(zplSetting);
        this.labelImage64 = data
        return of(data)
      })
    )
  }

}
