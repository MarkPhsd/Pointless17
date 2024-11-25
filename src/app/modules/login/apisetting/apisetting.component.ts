import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { SetTokenComponent } from 'src/app/shared-ui/set-token/set-token.component';
import { ApiStoredValueComponent } from 'src/app/shared/widgets/api-stored-value/api-stored-value.component';

@Component({
  selector: 'app-apisetting',
  standalone: true,
  imports: [CommonModule,SetTokenComponent,ApiStoredValueComponent,MatLegacyCardModule],
  templateUrl: './apisetting.component.html',
  styleUrls: ['./apisetting.component.scss']
})
export class APISettingComponent {

  constructor(
        public platFormservice: PlatformService
  ) {

  }
}
