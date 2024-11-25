import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-usermessages',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,

  SharedPipesModule],
  templateUrl: './usermessages.component.html',
  styleUrls: ['./usermessages.component.scss']
})
export class UsermessagesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
