import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable  } from 'rxjs';
import {  TaxRate }  from 'src/app/_interfaces';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-tax-rate-list',
  templateUrl: './tax-rate-list.component.html',
  styleUrls: ['./tax-rate-list.component.scss']
})
export class TaxRateListComponent implements OnInit {


  @Input()  formControl:    string;
  @Input()  inputForm:      FormGroup;
  items$:                   Observable<TaxRate[]>;
  items:  TaxRate[]
  constructor(private flatRateService: TaxesService,
              private sitesService: SitesService) { }

  ngOnInit(): void {

    const site  =        this.sitesService.getAssignedSite();
    this.items$  =        this.flatRateService.getTaxRates(site);

    this.items$.subscribe(data => {
      this.items = data
    })

  }

  getItem(event) {
    console.log(event.value)
  }

}
