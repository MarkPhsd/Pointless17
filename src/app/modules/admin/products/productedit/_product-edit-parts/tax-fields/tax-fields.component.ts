import { Component, OnInit, Input } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { UntypedFormGroup } from '@angular/forms';
import { TaxesService } from 'src/app/_services/menu/taxes.service';
import { IProduct, TaxRate } from 'src/app/_interfaces';
import { MenuService } from 'src/app/_services';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-tax-fields',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './tax-fields.component.html',
  styleUrls: ['./tax-fields.component.scss']})

export class TaxFieldsComponent implements OnInit {

 @Input()  inputForm:   UntypedFormGroup;
 @Input()  product:     IProduct;
 @Input()  taxable:     any;

taxes$: Observable<TaxRate[]>;

  constructor(
    private taxesService: TaxesService,
    private siteService: SitesService,) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    this.taxes$ =  this.taxesService.getTaxRates(site);

  }

}


