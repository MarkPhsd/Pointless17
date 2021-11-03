import { ReturnStatement } from '@angular/compiler';
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

  initForm(fb: FormGroup): FormGroup {
    // const serializedDate = new Date(user?.dob)
         fb = this._fb.group({
            id:                [''], //
            name:              [''], //
            pointValue:        [''], //
            dailyCredit:       [''], //
            dailyLimit:        [''], //
            limitSeeds:        [''], //
            limitPlants:       [''], //
            limitLiquid:       [''], //
            limitSolid:        [''], //
            limitConcentrate:  [''], //
            limitExtract:      [''], //
            limitConcentrates: [''], //
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

