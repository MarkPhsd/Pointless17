import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SendGridService } from 'src/app/_services/twilio/send-grid.service';

@Component({
  selector: 'app-email-settings',
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.scss']
})
export class EmailSettingsComponent implements OnInit {

  @Input() inputForm          : FormGroup;

  constructor(
    private sendGridService :  SendGridService,
  ) {
  }

  ngOnInit() {
   const i = 0;
  }

  sendTestEmail() {
    this.sendGridService.sendTestEmail().subscribe(data =>  {
      console.log(data)
    })
  }
}
