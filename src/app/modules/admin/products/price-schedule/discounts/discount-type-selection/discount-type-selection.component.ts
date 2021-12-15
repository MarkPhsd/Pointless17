import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { IPriceSchedule, PriceAdjustScheduleTypes } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, Subscription } from 'rxjs';
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

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  initPriceScheduleAdjustments() {
    const site = this.siteService.getAssignedSite();
    this.priceAdjustScheduleTypes$ = this.priceScheduleService.getPriceAdjustList(site)
    this.priceAdjustScheduleTypes$.subscribe( data =>  {
      console.log('data', data)
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
