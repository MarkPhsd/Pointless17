import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'app-zoom',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,],
  templateUrl: './zoom.component.html',
  styleUrls: ['./zoom.component.scss']
})
export class ZoomComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
