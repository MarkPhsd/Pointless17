import { Component } from '@angular/core';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'app-apisetting',
  templateUrl: './apisetting.component.html',
  styleUrls: ['./apisetting.component.scss']
})
export class APISettingComponent {

  constructor(
        public platFormservice: PlatformService
  ) {

  }
}
