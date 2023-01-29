import { Component, OnInit, Input,  } from '@angular/core';
import { FormArray,  FormBuilder,  FormGroup, FormGroupName } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { Title } from '@angular/platform-browser';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AWSBucketService } from 'src/app/_services';

@Component({
  selector: 'app-price-schedule-fields',
  templateUrl: './price-schedule-fields.component.html',
  styleUrls: ['./price-schedule-fields.component.scss']
})
export class PriceScheduleFieldsComponent implements OnInit {


  andOrGroup =  ['And', 'Or','1','2','3','4','5','6']
  @Input() inputForm        : FormGroup;
  @Input() arrayTypeName    : string;
  @Input() andOrOption      = true;
  @Input() data             : any;
  @Input() formArray        : FormArray;
  @Input() hideDelete       = false;
  @Input() item  : IPriceSchedule;


  isApp: boolean;
  showAllFlag = false;
  url: string;
  _priceSchedule            : Subscription;
  priceScheduleTracking     : IPriceSchedule;
  isMenuList                = false;
  bucket: string;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
        this.priceScheduleTracking = data
        const inputForm = this.inputForm;

        // console.log('update date', data.requiredItems)
        if (data && data.type === 'Menu List') {
          this.isMenuList = true
        }
        this.fbPriceSchedule.updateDiscountInfos(inputForm, data)

        // switch(this.arrayTypeName) {
        //   case ('requiredItemTypes'): {
    
        //     break;
        //   }
        //   case 'requiredCategories': {

        //     break;
        //   }
        //   case 'requiredBrands': {
         
        //     break;
        //   }
        //   case 'requiredItems': {
        //     this.inputForm.patchValue( { requiredItems: this.priceScheduleTracking.requiredItems } );
        //     break;
        //   }
        // }

      }
    )
  }

  constructor(
    private priceScheduleDataService: PriceScheduleDataService,
    private fbPriceSchedule         : FbPriceScheduleService,
    private platFormService:        PlatformService,
    private siteService:            SitesService,
    private awsBucketService:       AWSBucketService,
    private priceScheduleService:   PriceScheduleService,
) {

  }
  async ngOnInit() {
      this.initSubscriptions();
      await this.getImageUrl();
  }

  async getImageUrl() {
      this.isApp = this.platFormService.isApp();
      this.bucket = await this.awsBucketService.awsBucketURL()
      if (this.item && this.item.image && this.bucket) {
        this.url = `${this.bucket}${this.item.image}`
      }
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  get arrayType() : FormArray {
    if (this.arrayTypeName) {
      return this.inputForm.get(this.arrayTypeName) as FormArray;
    }
  }

  removeItem(index) {
    this.arrayType.removeAt(index)
    const pt = this.priceScheduleTracking
    const value =this.arrayType.value

    switch(this.arrayTypeName) {
      case ('requiredItemTypes'): {
        pt.requiredItemTypes = value
        break;
      }
      case 'requiredCategories': {
        pt.requiredCategories = value
        break;
      }
      case 'requiredBrands': {
        pt.requiredBrands = value
        break;
      }
      case 'requiredItems': {
        pt.requiredItems = value
        break;
      }

      case ('itemTypeDiscounts'): {
        pt.itemTypeDiscounts = value
        break;
      }
      case 'categoryDiscounts': {
        pt.categoryDiscounts = value
        break;
      }
      case 'itemDiscounts': {
        pt.itemDiscounts = value
        break;
      }
      case 'brandDiscounts': {
        pt.brandDiscounts = value
        break;
      }
    }

    this.priceScheduleDataService.updatePriceSchedule(pt);
  }

}
