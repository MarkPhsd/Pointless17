import { Component, OnInit,Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'profile-med-info',
  templateUrl: './profile-med-info.component.html',
  styleUrls: ['./profile-med-info.component.scss']
})
export class ProfileMedInfoComponent implements OnInit {

  @Input() inputForm : FormGroup;
  @Input() isAuthorized: boolean;
  @Input() isStaff: boolean;

  fileList: string;
  medPatient: boolean;

  constructor() { }

  ngOnInit(): void {
    const i = 0

    this.inputForm.valueChanges.subscribe( data => {
      const status = this.inputForm.controls['patientRecOption'].value;
        this.medPatient = false;
        if (status) {
          this.medPatient = true;
        }
      }
    )

  }

  updateFileList(event) {
    this.fileList = event;
    this.inputForm.patchValue({fileList: this.fileList})
  }

}
