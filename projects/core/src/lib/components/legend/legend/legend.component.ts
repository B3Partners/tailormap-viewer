import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { LegendService } from '../services/legend.service';
import { Observable, of, switchMap } from 'rxjs';
import { MenubarService } from '../../menubar';
import { LegendMenuButtonComponent } from '../legend-menu-button/legend-menu-button.component';
import { Store } from '@ngrx/store';
import { selectOrderedVisibleLayersAndServices } from '../../../map/state/map.selectors';
import { AppLayerWithServiceModel } from '@tailormap-viewer/api';
import { LEGEND_ID } from '../legend-identifier';

@Component({
  selector: 'tm-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegendComponent implements OnInit {

  public visible$: Observable<boolean>;
  public layers$: Observable<Array<{ layer: AppLayerWithServiceModel; url: string }>>;
  public trackById = (index: number, item: { layer: AppLayerWithServiceModel; url: string }) => item.layer.id;

  constructor(
    private store$: Store,
    private legendService: LegendService,
    private menubarService: MenubarService,
  ) {
    this.visible$ = this.menubarService.isComponentVisible$(LEGEND_ID);
    this.layers$ = this.visible$.pipe(
      switchMap(visible => {
        return !visible
          ? of([])
          : this.legendService.getAppLayerAndUrl$(this.store$.select(selectOrderedVisibleLayersAndServices));
      }),
    );
  }

  public ngOnInit() {
    this.menubarService.registerComponent(LegendMenuButtonComponent);
  }

}
