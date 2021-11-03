import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IProduct, ISetting } from 'src/app/_interfaces';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { MatDialog } from '@angular/material/dialog';
import { FakeDataService } from 'src/app/_services/system/fake-data.service';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { RenderingService } from 'src/app/_services/system/rendering.service';


@Component({
  selector: 'app-label-view-selector',
  templateUrl: './label-view-selector.component.html',
  styleUrls: ['./label-view-selector.component.scss']
})
export class LabelViewSelectorComponent implements OnInit {
  @Output() outputLabelSetting  :      EventEmitter<any> = new EventEmitter();
  @Output() outPutLabelID:      EventEmitter<any> = new EventEmitter();
  labelImage64                  : any;
  @Input() labelList$           : Observable<ISetting[]>;
  @Input() zplSetting           : ISetting;
  @Input() labelID              : number;
  @Input() inventoryItem        : IInventoryAssignment;

  product                       : IProduct
  @Input()  labelImageHeight     = 200;

  @Input() set setProduct(product: IProduct) {
    if (this.labelID) {
      this.product = product;
      this.refreshLabelSettings(this.labelID)
    }
  }
  @Input() set setInventoryAssignment(inventoryAssignment: IInventoryAssignment) {
    if (this.labelID) {
      this.inventoryItem = inventoryAssignment;
      this.refreshLabelSettings(this.labelID)
    }
  }

  constructor( private electronService  : ElectronService,
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
      this.refreshLabelSettings(this.labelID)
      return
    }

    if (!this.labelID) {
      this.refreshDefaultLabel();
      return
    }

  }

  async refreshDefaultLabel() {
    const site = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSettingByName(site, 'ZPLTemplate');
    zplTemp$.subscribe(data => {
      if (!data){ return }
       this.zplSetting  = data
       this.refreshLabelImage(data);
    })
  }

  refreshLabelSettings(id: number) {
    if (!id) {return }
    const site = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSetting(site, id);
    zplTemp$.subscribe(data => {
      if (!data){ return }
       this.zplSetting  = data
       this.refreshLabelImage(data);
    })
  }

  async refreshLabelImage(zplSetting: ISetting) {
    const site = this.siteService.getAssignedSite();
    if (!this.zplSetting) { return }
    if(this.inventoryItem) {
      this.refreshLabel(this.zplSetting.text, this.inventoryItem)
      return
    }
    if (this.product) {
      console.log('this product', this.zplSetting)
      this.refreshLabel(this.zplSetting.text, this.product)
      return
    }
    const item  =  this.fakeData.getInventoryItemTestData();
    this.refreshLabel(this.zplSetting.text, item)
  }

  refreshLabel(text: string, item: any) {
    if (!this.zplSetting) { return }
    this.printingService.refreshInventoryLabel(this.zplSetting.text, item).then(
      data => {
       this.outPutLabelID.emit(this.zplSetting.id);
       this.outputLabelSetting.emit(this.zplSetting);
       this.labelImage64 = data
      }
    )
  }

}
