import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './progress-uploader.component.html',
  styleUrls: ['./progress-uploader.component.scss']
})
export class ProgressUploaderComponent implements OnInit {

  @Input() progress = 0;

  constructor() {}

  ngOnInit(): void {
  }

}
