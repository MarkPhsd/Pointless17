import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { IPriceSchedule, PriceAdjustScheduleTypes } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, Subscription } from 'rxjs';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { DiscountTypeSelectionComponent } from '../discount-type-selection/discount-type-selection.component';

@Component({
  selector: 'app-discount-options',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    DiscountTypeSelectionComponent,
  SharedPipesModule],
  templateUrl: './discount-options.component.html',
  styleUrls: ['./discount-options.component.scss']
})
export class DiscountOptionsComponent implements OnInit, OnChanges {

  @Input()  item:                IPriceSchedule;
  @Input()  inputForm:           UntypedFormGroup;
  name    : string;
  active  : boolean;
  autoApplyRewards: boolean;

  priceAdjustScheduleTypes$:     Observable<PriceAdjustScheduleTypes[]>;

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data
      this.name = this.priceScheduleTracking.name
      this.active = this.priceScheduleTracking.active
      this.autoApplyRewards = this.priceScheduleTracking.autoApplyRewards;
    })
  }

  constructor(
    private siteService             : SitesService,
    private priceScheduleService    : PriceScheduleService,
    private priceScheduleDataService: PriceScheduleDataService,
  ) { }

  ngOnInit(): void {
    this.initSubscriptions()
    const site = this.siteService.getAssignedSite();
    this.priceAdjustScheduleTypes$ = this.priceScheduleService.getPriceAdjustList(site)
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  ngOnChanges() {
    this.updateInfo();
  }

  updateInfo() {
    if (this.priceScheduleTracking) {
      this.priceScheduleTracking.name   = this.name
      this.priceScheduleTracking.active = this.active
      this.priceScheduleTracking.autoApplyRewards = this.autoApplyRewards
      this.priceScheduleDataService.updatePriceSchedule(this.priceScheduleTracking)
    }
  }

  onToggleChange(event) {
    this.updateInfo()
  }

}
