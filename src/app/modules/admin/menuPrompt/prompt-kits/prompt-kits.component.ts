import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { editWindowState, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';

@Component({
  selector: 'prompt-kits',
    templateUrl: './prompt-kits.component.html',
  styleUrls: ['./prompt-kits.component.scss']
})
export class PromptKitsComponent implements OnInit {

  accordionStep :  number;
  role          = 'admin';

  windowState: Subscription;
  editWindowState: editWindowState

  initSubscriptions() {
    this.windowState = this.promptGroupService.editWindowState$.subscribe( data => {
      if (!data) {
        this.initWindowState()
        return;
      }
      this.editWindowState = data
      this.accordionStep = data.tabBosition;
      }
    )
  }

  constructor(public promptGroupService: PromptGroupService) { }

  ngOnInit() {
    this.initSubscriptions();
    if (!this.editWindowState) {
      this.initWindowState()
    }
  }

  nextStep() {
    this.accordionStep++;
    if (this.editWindowState) {
      this.editWindowState.tabBosition  = this.accordionStep
      this.promptGroupService.updateEditWindowState(this.editWindowState)
    }

  }

  prevStep() {
    this.accordionStep --;
     if (this.editWindowState) {
      this.editWindowState.tabBosition = this.accordionStep;
      this.promptGroupService.updateEditWindowState(this.editWindowState)
    }
  }

  setStep(index: number) {
    if (this.editWindowState) {
      this.accordionStep = index;
      this.editWindowState.tabBosition -= 1
    }
  }

  initWindowState() {
    this.editWindowState = {} as editWindowState;
    this.editWindowState.tabBosition = 0
    this.promptGroupService.updateEditWindowState(this.editWindowState)
    this.accordionStep =0
   
  }

}
