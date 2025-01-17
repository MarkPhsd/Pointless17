import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { editWindowState, PromptGroupService } from 'src/app/_services/menuPrompt/prompt-group.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { PromptSubGroupAssociationComponent } from '../prompt-sub-group-association/prompt-sub-group-association.component';
import { PromptSubGroupsComponent } from '../prompt-sub-groups/prompt-sub-groups.component';
import { PromptGroupsComponent } from '../prompt-groups/prompt-groups.component';

@Component({
  selector: 'prompt-kits',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    PromptSubGroupAssociationComponent,PromptSubGroupsComponent,
    PromptGroupsComponent
  ],

    templateUrl: './prompt-kits.component.html',
  styleUrls: ['./prompt-kits.component.scss']
})
export class PromptKitsComponent implements OnInit, OnDestroy{

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
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this.windowState) { this.windowState.unsubscribe()}
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
