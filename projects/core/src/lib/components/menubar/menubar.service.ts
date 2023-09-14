import { DestroyRef, Injectable } from '@angular/core';
import { BaseComponentRegistryService } from '@tailormap-viewer/shared';
import { BehaviorSubject, map } from 'rxjs';
import { ViewerLayoutService } from '../../services/viewer-layout/viewer-layout.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class MenubarService extends BaseComponentRegistryService {

  private activeComponent$ = new BehaviorSubject<{ componentId: string; dialogTitle: string } | null>(null);

  public panelWidth = 300;

  constructor(
    private viewerLayoutService: ViewerLayoutService,
    private destroyRef: DestroyRef,
  ) {
    super();
    this.activeComponent$.asObservable()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(component => {
        this.viewerLayoutService.setLeftPadding(component !== null ? this.panelWidth : 0);
      });
  }

  public toggleActiveComponent(componentId: string, dialogTitle: string) {
    if (this.activeComponent$.value?.componentId === componentId) {
      this.closePanel();
      return;
    }
    this.activeComponent$.next({ componentId, dialogTitle });
  }

  public closePanel() {
    this.activeComponent$.next(null);
  }

  public getActiveComponent$() {
    return this.activeComponent$.asObservable();
  }

  public isComponentVisible$(componentId: string) {
    return this.activeComponent$.asObservable().pipe(map(c => c !== null && c.componentId === componentId));
  }

}
