import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-strain-indicator',
  templateUrl: './strain-indicator.component.html',
  styleUrls: ['./strain-indicator.component.scss']
})
export class StrainIndicatorComponent {

  @Input() species: string;

}
