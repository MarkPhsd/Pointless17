import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { IEighthMenu } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { StrainIndicatorComponent } from '../../strain-indicator/strain-indicator.component';

@Component({
  selector: 'app-strain-card',
  standalone: true,
  imports: [CommonModule, MatLegacyCardModule,StrainIndicatorComponent ],
  templateUrl: './strain-card.component.html',
  styleUrls: ['./strain-card.component.scss']
})
export class StrainCardComponent implements OnInit {
  @Input()  item : IEighthMenu;

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}
