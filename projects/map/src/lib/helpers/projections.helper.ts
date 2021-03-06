import { getWidth } from 'ol/extent';
import { register } from 'ol/proj/proj4';
import proj4 from 'proj4';
import { OpenlayersExtent } from '../models/extent.type';

export class ProjectionsHelper {

  public static initProjection(
    projection: string,
    definition: string,
    projectionAliases?: string[],
  ) {
    if (proj4.defs(projection)) {
      return;
    }
    proj4.defs(projection, definition);
    (projectionAliases || []).forEach(alias => {
      proj4.defs(alias, proj4.defs(projection));
    });
    register(proj4);
  }

  public static getResolutions(projection: string, extent: OpenlayersExtent): number[] {
    // @todo: check this check here
    const size: number = projection === 'EPSG:3857' ? 20 : 22;
    const startResolution: number = getWidth(extent) / 256;
    const resolutions: number[] = new Array(size);
    for (let i = 0, ii = resolutions.length; i < ii; ++i) {
      resolutions[i] = startResolution / Math.pow(2, i);
    }
    return resolutions;
  }

}
