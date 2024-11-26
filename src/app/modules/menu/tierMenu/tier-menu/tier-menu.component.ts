import { Component } from '@angular/core';
import { TierPricesComponent } from '../tier-prices/tier-prices.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-tier-menu',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    TierPricesComponent
  ],
  templateUrl: './tier-menu.component.html',
  styleUrls: ['./tier-menu.component.scss'],
})

export class TierMenuComponent {

  constructor() { }

}
