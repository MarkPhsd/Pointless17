import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ICompany } from '../_interfaces';

import { SitesService } from '../_services/reporting/sites.service';

@Injectable({
  providedIn: 'root'
})

export class FbCompanyService {

  company: ICompany;

  constructor(private _fb: FormBuilder) { }

  initForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      compName:     [''],
      compCorpName:     [''],
      compAddress1:     [''],
      compAddress2:     [''],
      compCity:     [''],
      compState:     [''],
      compBillingAddress:     [''],
      compBillingAddress2:     [''],
      compBillingCity:     [''],
      compBillingState:     [''],
      compBillingZip:     [''],
      phone:     [''],
      phone2:     [''],
      fax:     [''],
      url:     [''],
      receiptHeader:     [''],
      location:     [''],
      companyID:      [''],
      demo:      [''],
      compZip:      [''],
      versionID:      [''],
    })

    return fb;
  }

}
