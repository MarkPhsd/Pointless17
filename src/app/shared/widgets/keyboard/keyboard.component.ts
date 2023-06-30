import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import Keyboard from "simple-keyboard";
import { InputTrackerService } from "src/app/_services/system/input-tracker.service";
import { UISettingsService } from "src/app/_services/system/settings/uisettings.service";
@Component({
  selector: 'app-keyboard',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.scss']
})
export class KeyboardComponent implements OnInit, AfterViewInit {

    @Input() disableClose: boolean;
    @Input()  value = "";

    constructor(
      public  trackerService: InputTrackerService,
      public cd: ChangeDetectorRef,
      private uiSettingService: UISettingsService) {}

    keyboard: Keyboard;

    ngOnInit() {
      this.trackerService._fieldValue$.subscribe(data => {
        if (this.keyboard) {
          this.value = data;
          this.keyboard.setInput(data);
        }
      })
    }

    ngAfterViewInit() {
      try {
        this.keyboard = new Keyboard({
          onChange: input => this.onChange(input),
          onKeyPress: button => this.onKeyPress(button)
        });
      } catch (error) {
        console.log('Error Initializing Keyboard', error);
      }
    }

    clearText() {
      if (this.trackerService.lastSelectedInput) {
        let input = this.trackerService.lastSelectedInput;
        input.setValue('');
        this.trackerService.setLastSelectedInput(input);
      }
    }

    close() {
      this.uiSettingService.updateSetKeyboard(false);
    }

    onChange = (input: string) => {
      this.value = input ;
      const anyControl = this.trackerService._lastSelectedInput;
      if (input && input.toString()) {
        anyControl.setValue(input.toString())
        this.trackerService.setLastSelectedInput(anyControl)
      }
      this.cd.detectChanges();
      // this.uiSettingService.updateRelativeValue(input)
      // console.log('value of control', anyControl.value)

    };

    onKeyPress = (button: string) => {
      // console.log("Button pressed; value ", button, this.value);
      /**
       * If you want to handle the shift and caps lock buttons
      */
      if (button === "{shift}" || button === "{lock}") this.handleShift();
    };

    clearInput() {
      this.trackerService.clearInput();
      this.value = '';
      this.keyboard.setInput('');
      this.keyboard.clearInput();
    };

    onInputChange = (event: any) => {
      this.keyboard.setInput(event.target.value);
    };

    handleShift = () => {
      let currentLayout = this.keyboard.options.layoutName;
      let shiftToggle = currentLayout === "default" ? "shift" : "default";
      this.keyboard.setOptions({
        layoutName: shiftToggle
      });
    };

  }
