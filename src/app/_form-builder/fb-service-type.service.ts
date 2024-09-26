import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { IServiceType } from '../_interfaces';
import { SitesService } from '../_services/reporting/sites.service';
import { ServiceTypeService } from '../_services/transactions/service-type-service.service';

@Injectable({
  providedIn: 'root'
})
export class FbServiceTypeService {

  serviceType: IServiceType;

  constructor(private _fb: UntypedFormBuilder,
    private siteService: SitesService,
    private serviceTypeService: ServiceTypeService,
  ) { }

  initForm(fb: UntypedFormGroup): UntypedFormGroup {
    // const serializedDate = new Date(user?.dob)
         fb = this._fb.group({
            id:                    [''], //
            image:                  [],
            name:                  ['', [Validators.required, Validators.maxLength(25)]], //
            positiveNegative:      [''], //number;
            isRegisterTransaction: [''], //boolean;
            taxItems:              [''], //boolean;
            showOrderType:         [''], //boolean;
            retailType       :     [''], //number;
            promptForOrderName:    [''], //number;
            requireNumOfGuests:    [''], // number;
            functionChoice:        [''], //number;
            functionChoice2:       [''], //number;
            functionChoice3:       [''], //number;
            defaultProductID1:     [0], //number;
            defaultProductID2:     [0], //number;
            managerRequired:       [''], //number;
            showTipOption:         [''], //number;
            printerName:           [''], //string;
            increasesInventory:    [''], // number;
            receiptFooterText:     [''], //string;
            apiOrder:              [''], // number;
            onlineOrder:           [''], //string;
            description:           [''],
            instructions          : [''],
            deliveryService       : [''],
            promptScheduleTime    : [''],
            orderMinimumTotal     : [''],
            scheduleInstructions  : [''],
            shippingInstructions  : [''],
            filterType            : [],
            allowRequestPrep      : [],
            resaleType            : [],
            headerOrder           : [],
            json: []
          }
        )
        return fb
    }

    async  fillForm(id: number, form: UntypedFormGroup): Promise<any> {

      const site =  this.siteService.getAssignedSite();

      this.serviceTypeService.getType(site, id).pipe(
        tap(data => {
          form.patchValue(data)
          return  data
        })
      );
    }
  }
