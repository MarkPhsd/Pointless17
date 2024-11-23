import { CommonModule } from '@angular/common';
import { Component, OnInit,Input,Output, EventEmitter} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';


@Component({
  selector: 'save-changes-button',
  standalone: true,
  imports: [CommonModule,MatLegacyButtonModule,MatIconModule],
  templateUrl: './save-changes-button.component.html',
  styleUrls: ['./save-changes-button.component.scss']
})
export class SaveChangesButtonComponent implements OnInit{

  @Input() inputForm: UntypedFormGroup;
  @Output() updateSetting = new EventEmitter<any>();
  firstChange: boolean;
  changesMade: boolean;

  constructor() { }

  ngOnInit(): void {
    this.checkChanges()
  }

  checkChanges() {
    this.inputForm.valueChanges.subscribe(data => {
      // if (!this.firstChange) {
      //   this.changesMade = false;
      //   this.firstChange = true;
      //   return;
      // }
      this.changesMade = true;
    })
  }

  outPutUpdateSetting() {
    this.updateSetting.emit('true');
    this.changesMade = false;
  }
}
