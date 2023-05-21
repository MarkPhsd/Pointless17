import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { FormArray, FormBuilder, UntypedFormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule, ClientType, DateFrame, DiscountInfo,
  TimeFrame, WeekDay
} from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { METRCItemsCategories } from 'src/app/_interfaces/metrcs/items';

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.scss']
})
export class SearchPanelComponent implements OnInit {

  @Input() requiredItemTypes:  DiscountInfo[] = []; //what is a main type? This is itemType
  @Input() requiredBrands:     DiscountInfo[] = [];
  @Input() requiredCategories: DiscountInfo[] = [];
  @Input() requiredItems:      DiscountInfo[] = [];

  @Input() inputForm: UntypedFormGroup;
  @Input() item     : IPriceSchedule;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
