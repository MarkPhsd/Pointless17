import { Component, OnInit} from '@angular/core';
import { ICompany } from 'src/app/_interfaces';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { AuthenticationService } from 'src/app/_services';
import { TiersWithPricesComponent } from '../tiers-with-prices/tiers-with-prices.component';
import { TierItemsComponent } from '../tier-items/tier-items.component';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tier-prices',
  standalone: true,
  imports: [CommonModule, TiersWithPricesComponent, SharedPipesModule,
            TierItemsComponent,MatLegacyCardModule, SharedPipesModule],
  templateUrl: './tier-prices.component.html',
  styleUrls: ['./tier-prices.component.scss'],
})

export class TierPricesComponent implements OnInit {

  priceTier: string;
  compName: string;
  company = {} as ICompany;
  logo: string;

  isStaff: boolean;

  constructor(
    private authenticationService: AuthenticationService,
    private appInitService        : AppInitService,)
  { }

  ngOnInit() {

    const user$ = this.authenticationService.user$.subscribe(data => {
      if (data) {
        if (data?.employeeID  != 0 ) {
          this.isStaff = true;
        }
      }
    })

    this.appInitService.init();
    if (this.company === undefined) {
    } else {
      this.compName = this.company.compName
    }

    this.logo     = `${this.appInitService.logo}`
    this.compName = `${this.appInitService.company}`
  }

  setPriceTier(tierName: string) {
    this.priceTier = tierName
  }
}

