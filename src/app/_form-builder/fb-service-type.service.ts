import { ReturnStatement } from '@angular/compiler';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';

import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { IServiceType } from '../_interfaces';
import { SitesService } from '../_services/reporting/sites.service';
import { ServiceTypeService } from '../_services/transactions/service-type-service.service';

@Injectable({
  providedIn: 'root'
})
export class FbServiceTypeService {

  serviceType: IServiceType;

  constructor(private _fb: FormBuilder,
    private siteService: SitesService,
    private serviceTypeService: ServiceTypeService,
  ) { }

  initForm(fb: FormGroup): FormGroup {
    // const serializedDate = new Date(user?.dob)
         fb = this._fb.group({
            id:                    [''], //
            name:                  [''], //
            positiveNegative:      [''], //number;
            isRegisterTransaction: [''], //boolean;
            taxItems:              [''], //boolean;
            showOrderType:         [''], //boolean;
            retailServiceType:     [''], //number;
            promptForOrderName:    [''], //number;
            requireNumOfGuests:    [''], // number;
            functionChoice:        [''], //number;
            functionChoice2:       [''], //number;
            functionChoice3:       [''], //number;
            defaultProductID1:     [''], //number;
            defaultProductID2:     [''], //number;
            managerRequired:       [''], //number;
            showTipOption:         [''], //number;
            printerName:           [''], //string;
            increasesInventory:    [''], // number;
            receiptFooterText:     [''], //string;
            apiOrder:              [''], // number;
            onlineOrder:           [''], //string;
            description:           [''],
          }
        )
        return fb
    }

    async  fillForm(id: number, form: FormGroup): Promise<any> {

      const site =  this.siteService.getAssignedSite();

      this.serviceTypeService.getType(site, id).pipe(
        tap(data => {
          form.patchValue(data)
          return  data
        })
      );
    }
  }
