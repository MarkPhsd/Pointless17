import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IProduct, ISetting } from 'src/app/_interfaces';
import { Observable } from 'rxjs';
import { ElectronService } from 'ngx-electron';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
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

  refreshDefaultLabel() {
    const site = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSettingByName(site, 'ZPLTemplate');
    zplTemp$.subscribe(data => {
      if (!data){ return }
       this.zplSetting  = data
       this.refreshLabelImage(data);
    })
  }

  refreshLabelSettings(id: number) {
    if (!id) {
      return this.outPutLabelID.emit(0)
    }
    const site = this.siteService.getAssignedSite();
    const zplTemp$ = this.settingService.getSetting(site, id);
    this.outPutLabelID.emit(id)
    zplTemp$.subscribe(data => {
      if (!data){ return }
       this.zplSetting  = data
       this.refreshLabelImage(data);
    })
  }

  refreshLabelImage(zplSetting: ISetting) {
    const site = this.siteService.getAssignedSite();
    if (!zplSetting) { return }
    if(this.inventoryItem) {
      this.refreshLabel(zplSetting, this.inventoryItem)
      return
    }
    if (this.product) {
      this.refreshLabel(zplSetting, this.product)
      return
    }
    const item  =  this.fakeData.getInventoryItemTestData();
    this.refreshLabel(zplSetting, item)
  }

  refreshLabel(zplSetting: ISetting, item: any) {
    if (!zplSetting) { return }
    this.printingService.refreshInventoryLabel(zplSetting.text, item).then(
      data => {
       this.outPutLabelID.emit(zplSetting.id);
       this.outputLabelSetting.emit(zplSetting);
       this.labelImage64 = data
      }
    )
  }

}
