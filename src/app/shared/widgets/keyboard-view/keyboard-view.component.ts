import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { get } from 'lodash';
import { Subscription } from 'rxjs';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-keyboard-view',
  templateUrl: './keyboard-view.component.html',
  styleUrls: ['./keyboard-view.component.scss']
})
export class KeyboardViewComponent implements OnInit,OnDestroy,AfterViewInit {
  @ViewChild('keyboardView')  keyboardView: TemplateRef<any>;

  keyboardValue: number | string;
  keyboardVisible: boolean;
  _keyboardVisible: Subscription;

  constructor(
    private changeDetect: ChangeDetectorRef,
    private uiSettingService: UISettingsService) { }

  ngOnInit(): void {
    const i = 0;
    this._keyboardVisible = this.uiSettingService.toggleKeyboard$.subscribe(data => {
      // console.log('change occured')
      this.isKeyboardVisible;
      this.keyboardVisible = data;
      // this.changeDetect.detectChanges()
    })
  }

  ngAfterViewInit() {
    const i = 0;
    this._keyboardVisible = this.uiSettingService.toggleKeyboard$.subscribe(data => {
      this.isKeyboardVisible;
      this.keyboardVisible = data;
    })
  }

  get isKeyboardVisible() {
    if (this.keyboardVisible) {
      return this.keyboardView
    }
    return null
  }

  ngOnDestroy() {
    if (this._keyboardVisible) {
      this._keyboardVisible.unsubscribe()
    }
  }
}
