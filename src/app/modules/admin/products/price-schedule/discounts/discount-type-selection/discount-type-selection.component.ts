import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IPriceSchedule, PriceAdjustScheduleTypes } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { Observable, Subscription } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { ItemCategoriesEditComponent } from 'src/app/modules/admin/metrc/items/item-categories-edit/item-categories-edit.component';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';

@Component({
  selector: 'app-discount-type-selection',
  templateUrl: './discount-type-selection.component.html',
  styleUrls: ['./discount-type-selection.component.scss']
})
export class DiscountTypeSelectionComponent implements OnInit {

  @Input()  inputForm        :   FormGroup;

  priceAdjustScheduleTypes$  :   Observable<PriceAdjustScheduleTypes[]>;
  allItems                   :   boolean;
  priceAdjustScheduleTypes   :   PriceAdjustScheduleTypes[];
  selectedAdjustScheduleTypes:   PriceAdjustScheduleTypes;
  value: number;

  get discountOptions() : FormArray {
    return this.inputForm.get('discountOptions') as FormArray;
  }

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data
    })
  }

  constructor(
    private siteService             : SitesService,
    private priceScheduleService    : PriceScheduleService,
    private priceScheduleDataService: PriceScheduleDataService,
  )
  { }

  ngOnInit(): void {
    this.initPriceScheduleAdjustments()
    this.initSubscriptions();
  }

  initPriceScheduleAdjustments() {
    const site = this.siteService.getAssignedSite();
    this.priceAdjustScheduleTypes$ = this.priceScheduleService.getPriceAdjustList(site)
    this.priceAdjustScheduleTypes$.subscribe( data =>  {
      this.priceAdjustScheduleTypes = data;
    })
  }

  selectAdjustScheduleTypes(item) {
    if (!item) { return }
    this.selectedAdjustScheduleTypes = item;
    this.updateInfo();
  }

  updateInfo() {
    if(this.selectedAdjustScheduleTypes && this.priceScheduleTracking)  {
      this.priceScheduleTracking.value = this.value ;
      this.priceScheduleTracking.type  = this.selectedAdjustScheduleTypes.name
      this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
    }
  }

}
