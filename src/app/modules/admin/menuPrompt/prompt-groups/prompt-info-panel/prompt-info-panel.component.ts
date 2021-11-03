import { Component, OnInit, Input } from '@angular/core';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';

@Component({
  selector: 'prompt-info-panel',
  templateUrl: './prompt-info-panel.component.html',
  styleUrls: ['./prompt-info-panel.component.scss']
})
export class PromptInfoPanelComponent implements OnInit {

  @Input()   prompt         : IPromptGroup;
  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}
