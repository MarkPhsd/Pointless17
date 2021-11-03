import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress-uploader.component.html',
  styleUrls: ['./progress-uploader.component.scss']
})
export class ProgressUploaderComponent implements OnInit {
  
  @Input() progress = 0;

  constructor() {}

  ngOnInit(): void {
  }

}
