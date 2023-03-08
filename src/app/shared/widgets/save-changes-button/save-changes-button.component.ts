import { Component, OnInit,Input,Output, EventEmitter} from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'save-changes-button',
  templateUrl: './save-changes-button.component.html',
  styleUrls: ['./save-changes-button.component.scss']
})
export class SaveChangesButtonComponent implements OnInit{

  @Input() inputForm: FormGroup;
  @Output() updateSetting = new EventEmitter<any>();
  firstChange: boolean;
  changesMade: boolean;

  constructor() { }

  ngOnInit(): void {
      this.checkChanges()

  }

  checkChanges() {
    this.inputForm.valueChanges.subscribe(data => {
      if (!this.firstChange) {
        this.changesMade = false;
        this.firstChange = true;
        return;
      }
      this.changesMade = true;
    })
  }

  outPutUpdateSetting() {
    this.updateSetting.emit('true');
    this.changesMade = false;
  }
}
