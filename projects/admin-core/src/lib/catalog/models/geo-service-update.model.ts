import { GeoServiceModel } from '@tailormap-admin/admin-api';

export type GeoServiceCreateModel = Pick<GeoServiceModel, 'title' | 'protocol' | 'url' | 'settings' | 'authentication' | 'authorizationRules'>;
export type GeoServiceUpdateModel = Partial<GeoServiceCreateModel>;
export type GeoServiceWithIdUpdateModel = GeoServiceUpdateModel & Pick<GeoServiceModel, 'id'>;
