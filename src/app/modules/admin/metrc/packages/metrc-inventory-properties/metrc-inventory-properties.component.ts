import { Component, OnInit, Input, Output , EventEmitter} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { MenuService } from 'src/app/_services';
import { IItemFacilitiyBasic } from 'src/app/_services/metrc/metrc-facilities.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'metrc-inventory-properties',
  templateUrl: './metrc-inventory-properties.component.html',
  styleUrls: ['./metrc-inventory-properties.component.scss']
})
export class MetrcInventoryPropertiesComponent implements OnInit {

  @Input() inputForm   :      FormGroup;
  @Input() package     :      METRCPackage;
  @Input() facility            = {} as IItemFacilitiyBasic;
  @Output() outputMenuItem    = new EventEmitter<any>();
  @Output() outputVendor      = new EventEmitter<any>();

  //(outputMenuItem)="getSelectedMenuItem($event)"
// (outputVender)  ="getSelectedVendorItem($event)"

  facilityLicenseNumber: string;
  productionBatchNumber: string;
  menuItem             : any ;
  site                 : ISite;

  constructor(
    private siteService: SitesService,
    private menuService: MenuService,
  ) { }

  ngOnInit(): void {
    this.site=   this.siteService.getAssignedSite()
  }

  getVendor(event) {

    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.displayName} - ${facility.metrcLicense}`
      this.outputVendor.emit(facility)
    }
  }

  getStrain(event) {
    const itemStrain = event
    if (itemStrain) {
      if (itemStrain.id) {
        this.menuService.getMenuItemByID(this.site, itemStrain.id).subscribe(data => {
          this.menuItem = data

          this.outputMenuItem.emit(data)
          }
        )
      }
    }
  }



}
