import { Component } from '@angular/core';
import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';

@Component({
  selector: 'app-test-grid',
  standalone: true,
  imports: [MatCardModule ],
  templateUrl: './test-grid.component.html',
  styleUrl: './test-grid.component.scss'
})
export class TestGridComponent {

}
