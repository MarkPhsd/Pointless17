import { Component, OnInit } from '@angular/core';
import { IMenuButtonGroups, MBMenuButtonsService, mb_MenuButton } from 'src/app/_services/system/mb-menu-buttons.service';

@Component({
  selector: 'app-function-group-button-edit',
  templateUrl: './function-group-button-edit.component.html',
  styleUrls: ['./function-group-button-edit.component.scss']
})
export class FunctionGroupButtonEditComponent implements OnInit {

  menuButtonGroups: IMenuButtonGroups[];
  menuButtonGroup : IMenuButtonGroups;
  mb_MenuButtons  : mb_MenuButton[];
  mb_MenuButton   : mb_MenuButton;

  constructor(private mbMenUGroups: MBMenuButtonsService) { }

  ngOnInit(): void {
    const i = 0
  }

}
