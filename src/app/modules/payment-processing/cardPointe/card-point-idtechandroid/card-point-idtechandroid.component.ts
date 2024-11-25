import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-card-point-idtechandroid',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './card-point-idtechandroid.component.html',
  styleUrls: ['./card-point-idtechandroid.component.scss']
})
export class CardPointIDTECHAndroidComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const i = 0
  }

  deviceConnect() {

  }

}
