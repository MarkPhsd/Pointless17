import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Component({
  selector: 'gridcomponent-properties-design',
  templateUrl: './gridcomponent-properties-design.component.html',
  styleUrls: ['./gridcomponent-properties-design.component.scss']
})
export class GridcomponentPropertiesDesignComponent implements OnInit, OnDestroy {
  @Input() opacity
  @Input() border;
  @Input() borderRadius;
  @Input() layerIndex;

  @Output() outPutOpacity      = new EventEmitter<any>();
  @Output() outPutBorder       = new EventEmitter<any>();
  @Output() outPutBorderRadius = new EventEmitter<any>();
  @Output() outPutLayerIndex   = new EventEmitter<any>();

  _borderRadius: string;
  _border :string;
  _layer : string;

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

  initSubscriptions() {
    this.opacity.subscribe(data => {
      this.formatOpacity(data)
    })
  }

  ngOnDestroy(): void {
    try {
      if(this.opacity) { this.opacity.unsubscribe()}
      
    } catch (error) {
      
    }
  }

  formatOpacity(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    this.opacity = value;
    this.outPutOpacity = new EventEmitter<any>();
    if (this.outPutOpacity) {this.outPutOpacity.emit(value)}
    return value;
  }

  formatBorder(value: number) {
    if (value >= 1000) {
      return Math.round(value / 1000) + 'k';
    }
    this.border = value;
    this._border  = `${value}px`
    if (this.outPutBorder) { this.outPutBorder.emit(value) }

    return value;
  }
  formatBorderRadius(value: number) {
    if (value >= 1000) {
      return Math.round(+value / 1000) + 'k';
    }
    this.borderRadius = value;
    this._borderRadius  = `${value}px`
    if (this.outPutBorderRadius) { this.outPutBorderRadius.emit(value) }
    return value;
  }
  formatLayer(value: number) {
    if (value >= 1000) {
      return Math.round(+value / 1000) + 'k';
    }
    this.layerIndex = value;
    this._layer  = `${value}px`
    if (this.outPutLayerIndex) { this.outPutLayerIndex.emit(value) }
    return value;
  }
}
