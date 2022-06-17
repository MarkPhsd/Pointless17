import { Component, EventEmitter, OnInit,Input, Output  } from '@angular/core';
import { Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'default-receipt-selector',
  templateUrl: './default-receipt-selector.component.html',
  styleUrls: ['./default-receipt-selector.component.scss']
})

export class DefaultReceiptSelectorComponent implements OnInit {

  @Input()  receipt           : ISetting;
  @Input()  receiptName       : string;
  @Input()  receiptID         : any;
  @Input()  receiptList       : Observable<any>;
  @Output() outPutReceiptName : EventEmitter<any> = new EventEmitter();

  constructor(private settingsService: SettingsService,
              private siteService: SitesService) { }

  async ngOnInit() {
    //this requires we get the receiptID, then assign it to the item as the default item, selected item.
    if (this.receiptID) {
      const site = this.siteService.getAssignedSite();
      const item$ = this.settingsService.getSetting(site, this.receiptID).subscribe(data=> {
        if (data) {
          this.receipt = data;
          this.receiptName = data?.value
        }
      })
    }
  }

  setReceipt() {
    const site = this.siteService.getAssignedSite();
    const item$ = this.settingsService.getSetting(site, this.receiptID)
    item$.subscribe(data=> {
      this.receipt = data;
      console.log('data', data)
      this.outPutReceiptName.emit(this.receipt)
    })
  }
}

// function site(site: any, receiptID: any) {
//   throw new Error('Function not implemented.');
// }
