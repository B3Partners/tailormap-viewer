import { OpenlayersExtent } from './extent.type';
import { LayerManagerModel } from './layer-manager.model';
import { MapViewerOptionsModel } from './map-viewer-options.model';
import { Observable } from 'rxjs';
import { Map as OlMap } from 'ol';
import { Projection } from 'ol/proj';

export interface MapViewerModel {
  initMap(options: MapViewerOptionsModel): void;
  render(element: HTMLElement): void;
  getLayerManager$(): Observable<LayerManagerModel>;
  getVisibleExtent$(): Observable<OpenlayersExtent>;
  setZoomLevel(zoom: number): void;
  zoomIn(): void;
  zoomOut(): void;
  getMap$(): Observable<OlMap>;
  executeMapAction(fn: (olMap: OlMap) => void): void;
  getProjection$(): Observable<Projection>;
}

