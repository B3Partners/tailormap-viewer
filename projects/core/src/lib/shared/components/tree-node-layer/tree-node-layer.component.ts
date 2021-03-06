import { Component, Input } from '@angular/core';
import { AppLayerModel } from '@tailormap-viewer/api';
import { TreeModel } from '@tailormap-viewer/shared';

@Component({
  selector: 'tm-tree-node-layer',
  templateUrl: './tree-node-layer.component.html',
  styleUrls: ['./tree-node-layer.component.css'],
})
export class TreeNodeLayerComponent {

  @Input()
  public node: TreeModel<AppLayerModel> | null = null;

  constructor() { }

  public isLevel() {
    return this.node?.type === 'level';
  }

}
