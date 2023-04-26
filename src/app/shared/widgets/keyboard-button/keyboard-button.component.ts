import { Component, Input, OnInit } from '@angular/core';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

import { PlatformService } from 'src/app/_services/system/platform.service';
@Component({
  selector: 'app-keyboard-button',
  templateUrl: './keyboard-button.component.html',
  styleUrls: ['./keyboard-button.component.scss']
})
export class KeyboardButtonComponent  {

  @Input() smallDevice: boolean;
  @Input() isApp: boolean;
  @Input() isUserStaff: boolean;

  constructor(
    private platFormService: PlatformService,
    private uiSettings: UISettingsService) { }

  toggleKeyboard() { 
    this.uiSettings.updateToggleKeyboard()
  }

  navKeyboard() { 
    // nodeKeySender.sendKey('leftctrl', 'leftalt', 'del');
  }

}
