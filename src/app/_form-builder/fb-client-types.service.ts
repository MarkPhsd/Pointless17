import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';

import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from '../_services/reporting/sites.service';

@Injectable({
  providedIn: 'root'
})
export class FbClientTypesService {

  constructor(private _fb: FormBuilder,
    private siteService: SitesService,
    private clientTypeService: ClientTypeService,
  ) { }


  initUserAuthForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({


      voidOrder           : [],
      voidItem            : [],
      voidPayment         : [],

      changeItemPrice     : [],
      changeInventoryValue: [],
      blindBalanceSheet   : [],
      blindClose          : [],

      // 'admin section
      closeDay            : [],
      sendTextBlast       : [],
      sendEmailBlast      : [],
      deleteClientType    : [],

      accessHistoryReports: [],
      accessDailyReport   : [],

      // 'metrc work
      importMETRCPackages: [],

    // 'inventory work
      adjustInventory    : [],

    // 'product work
      adjustInventoryCount: [],
      adjustProductCount : [],

      // 'add non customer types
      addEmployee        : [],
      changeClientType   : [],

      changeAuths        : [],
      accessAdmins       : [],

      refundItem     : [],
      refundOrder    : [],
      refundPayment  : [],
    })
    return fb

  }

  initForm(fb: FormGroup): FormGroup {

         fb = this._fb.group({

            id: [],
            name: [],
            pointValue: [],
            dailyCredit: [],
            dailyLimit: [],
            limitGram : [],
            limitSeeds: [],
            limitPlants: [],
            limitLiquid: [],
            limitSolid: [],
            limitConcentrate: [],
            limitExtract: [],
            limitConcentrates: [],
            allowStaffUse: [],
            jsonObject       : [],
          }
        )
        return fb
    }

    async  fillForm(id: number, form: FormGroup): Promise<any> {

      const site =  this.siteService.getAssignedSite();

      this.clientTypeService.getClientType(site, id).pipe(
        tap(data => {
          form.patchValue(data)
          return  data
        })
      );
    }
  }

