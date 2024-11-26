import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppInitService } from 'src/app/_services/system/app-init.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-tvprice-tiers',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './price-tiers.component.html',
  styleUrls: ['./price-tiers.component.scss']
})
export class TVPriceTiersComponent implements OnInit {

  logo: string;

  constructor(private appInitService: AppInitService) { }

  ngOnInit(): void {
    this.logo = this.appInitService.logo;
  }

}
