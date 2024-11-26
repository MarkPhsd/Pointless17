import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { IPromptGroup } from 'src/app/_interfaces/menu/prompt-groups';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'prompt-info-panel',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

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
