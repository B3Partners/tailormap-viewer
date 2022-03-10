import { Component, ElementRef, Input, NgZone, OnDestroy, Optional, TemplateRef, ViewChild } from '@angular/core';
import { CheckStateChange, TreeService } from './tree.service';
import { takeUntil } from 'rxjs/operators';
import { FlatTreeHelper } from './helpers/flat-tree.helper';
import { FlatTreeModel } from './models';
import { Subject } from 'rxjs';
import { DropZoneOptions, TreeDragDropService, treeNodeBaseClass } from './tree-drag-drop.service';
import { MatRadioChange } from '@angular/material/radio';

@Component({
  selector: 'tm-tree',
  templateUrl: './tree.component.html',
  styleUrls: ['./tree.component.css'],
})
export class TreeComponent implements OnDestroy {

  @Input()
  public treeNodeTemplate?: TemplateRef<any>;

  @Input()
  public additionalDropZones?: DropZoneOptions[];

  @Input()
  public useRadioInputs?: boolean;

  @Input()
  public expandOnGroupClick?: boolean;

  @ViewChild('treeElement', { static: false, read: ElementRef })
  private treeElement: ElementRef<HTMLDivElement> | undefined;

  public selectedNodeId: string | undefined;

  public treeDragDropServiceEnabled = false;

  public readOnlyMode = false;

  private scrollLeft = 0;

  private checkedRadioNode: FlatTreeModel | undefined;

  private destroyed = new Subject();

  constructor(
    private treeService: TreeService,
    private ngZone: NgZone,
    @Optional() private treeDragDropService: TreeDragDropService,
  ) {
    this.treeService.selectedNode$
      .pipe(takeUntil(this.destroyed))
      .subscribe(selectedNodeId => this.selectedNodeId = selectedNodeId);
    this.treeService.readonlyMode$
      .pipe(takeUntil(this.destroyed))
      .subscribe(readOnlyMode => {
        this.readOnlyMode = readOnlyMode;
        this.treeDragDropServiceEnabled = false;
      });
    if (treeDragDropService) {
      this.treeDragDropService.treeDragDropEnabled$
        .pipe(takeUntil(this.destroyed))
        .subscribe(enabled => this.treeDragDropServiceEnabled = enabled);
    }
    this.checkedRadioNode = this.getTreeControl().dataNodes.find(node => node.checked);
  }

  public getDataSource() {
    return this.treeService.getTreeDataSource();
  }

  public getTreeControl() {
    return this.treeService.getTreeControl();
  }

  public hasChild(idx: number, nodeData: FlatTreeModel) {
    return FlatTreeHelper.isExpandable(nodeData);
  }

  public isExpanded(node: FlatTreeModel) {
    return this.treeService.getTreeControl().isExpanded(node);
  }

  public toggleNodeExpansion(node: FlatTreeModel) {
    this.treeService.nodeExpanded(node.id);
  }

  public toggleGroup(node: FlatTreeModel): void {
    if (this.readOnlyMode) {
      return;
    }
    this.toggleNode(node, this.treeService.getTreeControl().getDescendants(node));
  }

  public toggleLeaf(node: FlatTreeModel): void {
    if (this.readOnlyMode) {
      return;
    }
    this.toggleNode(node);
  }

  public setNodeSelected(node: FlatTreeModel) {
    this.treeService.selectionStateChanged(node.id);
    if (this.useRadioInputs && !FlatTreeHelper.isExpandable(node)) {
      this.toggleRadioNode(node);
    }
    if (this.expandOnGroupClick && FlatTreeHelper.isExpandable(node)) {
      this.toggleNodeExpansion(node);
    }
  }

  public getNodeClassName(node: FlatTreeModel) {
    const cls = [
      treeNodeBaseClass,
      FlatTreeHelper.isExpandable(node) ? `${treeNodeBaseClass}--folder` : `${treeNodeBaseClass}--leaf`,
      `${treeNodeBaseClass}--level-${FlatTreeHelper.getLevel(node)}`,
    ];
    if (!node.checkbox) {
      cls.push(`${treeNodeBaseClass}--no-checkbox`);
    }
    return cls.join(' ');
  }

  public isIndeterminate(node: FlatTreeModel) {
    return this.treeService.isIndeterminate(node);
  }

  public isChecked(node: FlatTreeModel) {
    return this.treeService.isChecked(node);
  }

  public ngOnDestroy() {
    this.destroyed.next(null);
    this.destroyed.complete();
  }

  private toggleNode(node: FlatTreeModel, descendants?: FlatTreeModel[]) {
    const stateChange: CheckStateChange = new Map<string, boolean>();
    const checked = descendants ? !this.treeService.descendantsAllSelected(node) : !node.checked;
    stateChange.set(node.id, checked);
    if (descendants) {
      descendants.forEach(d => stateChange.set(d.id, checked));
    }
    this.checkAllParentsSelection(node, stateChange);
    this.treeService.checkStateChanged(stateChange);
  }

  private checkAllParentsSelection(node: FlatTreeModel, stateChange: CheckStateChange): void {
    let parent: FlatTreeModel | null = FlatTreeHelper.getParentNode(node, this.treeService.getDataNodes());
    while (parent !== null) {
      this.checkRootNodeSelection(parent, stateChange);
      parent = FlatTreeHelper.getParentNode(parent, this.treeService.getDataNodes());
    }
  }

  private checkRootNodeSelection(node: FlatTreeModel, stateChange: CheckStateChange): void {
    const descAllSelected = this.treeService.descendantsAllSelected(node);
    if (node.checked && !descAllSelected) {
      stateChange.set(node.id, false);
    } else if (!node.checked && descAllSelected) {
      stateChange.set(node.id, true);
    }
  }

  public handleDragStart(event: DragEvent, node: FlatTreeModel) {
    if (!this.treeDragDropService || !this.treeElement) {
      return;
    }
    const dragElement = this.treeElement.nativeElement;
    const dropZoneConfig: DropZoneOptions = {
      getTargetElement: () => dragElement,
      dropAllowed: (nodeId) => this.treeService.hasNode(nodeId),
      dropInsideAllowed: (nodeId) => this.treeService.isExpandable(nodeId),
      isExpandable: (nodeId) => this.treeService.isExpandable(nodeId),
      isExpanded: (nodeId) => this.treeService.isExpanded(nodeId),
      expandNode: (nodeId) => this.treeService.expandNode(nodeId),
      getParent: (nodeId) => this.treeService.getParent(nodeId),
      nodePositionChanged: evt => this.treeService.nodePositionChanged(evt),
    };
    this.ngZone.runOutsideAngular(() => {
      this.treeDragDropService.handleDragStart(event, node, [ dropZoneConfig, ...(this.additionalDropZones || []) ]);
    });
  }

  public handleTreeScroll(currentTarget: EventTarget | null) {
    if (!currentTarget) {
      return;
    }
    const targetIsHTMLElement = (target: EventTarget): target is HTMLElement => !!(target as HTMLElement).nodeName;
    if (targetIsHTMLElement(currentTarget) && this.scrollLeft !== currentTarget.scrollLeft) {
      this.scrollLeft = currentTarget.scrollLeft;
      currentTarget.style.setProperty('--scroll-pos', this.scrollLeft + 'px');
    }
  }

  public handleRadioChangeEvent($event: MatRadioChange) {
    this.toggleRadioNode($event.value);
  }

  private toggleRadioNode(node: FlatTreeModel) {
    const checkChangeMap: CheckStateChange = new Map();
    if (this.checkedRadioNode) {
      checkChangeMap.set(this.checkedRadioNode.id, false);
    }
    checkChangeMap.set(node.id, true);
    this.treeService.checkStateChanged(checkChangeMap);
    this.checkedRadioNode = node;
  }

}
