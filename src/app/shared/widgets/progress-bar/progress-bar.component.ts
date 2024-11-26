import { CommonModule } from '@angular/common';
import { Component, OnInit, Input , OnChanges} from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,
  SharedPipesModule],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements  OnChanges {

  @Input() value = 0;
  @Input() percentage: number;
  @Input() ratio = 100;
  @Input() uom  = 'grams'
  percentageValue = 0;

  constructor () {
  }

  ngOnChanges(): void {
    this.refreshPercentage();
  }

  refreshPercentage() {
    if (this.ratio == 0) { this.ratio = 28; }
    this.percentageValue =   +(+(this.value / this.ratio) * 100).toFixed(0)

  }
}
