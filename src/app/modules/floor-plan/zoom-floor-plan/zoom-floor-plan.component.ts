import { Component, OnInit , Input, EventEmitter, Output} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';

@Component({
  selector: 'zoom-floor-plan',
  standalone: true,
  imports: [MatLegacyButtonModule, MatIconModule],
  templateUrl: './zoom-floor-plan.component.html',
  styleUrls: ['./zoom-floor-plan.component.scss']
})
export class ZoomFloorPlanComponent  {

  @Input()
  zoom = 100;

  @Output()
  zoomChange = new EventEmitter();

  constructor() { }

  zoomIn() {
    if (this.zoom >= 150) {
      return;
    }
    this.zoom += 5;
    this.zoomChange.emit(this.zoom);
  }

  zoomOut() {
    if (this.zoom <= 20) {
      return;
    }
    this.zoom -= 5;
    this.zoomChange.emit(this.zoom);
  }


}
