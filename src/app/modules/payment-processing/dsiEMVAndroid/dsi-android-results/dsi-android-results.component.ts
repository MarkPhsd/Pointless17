import { Component, Input, OnInit } from '@angular/core';
import { TranResponse, Transaction } from './../../models/models';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'pointlesscc-dsi-android-results',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './dsi-android-results.component.html',
  styleUrls: ['./dsi-android-results.component.scss']
})
export class DsiAndroidResultsComponent implements OnInit {
  @Input() isAdmin: boolean;
  @Input() tranResponse: TranResponse;
  @Input() textResponse: string;

  constructor() { }

  ngOnInit() {
    const i = 0;
  }

}
