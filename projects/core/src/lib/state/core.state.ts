import { ViewerStylingModel, ComponentModel, Language, SecurityModel } from '@tailormap-viewer/api';
import { LoadingStateEnum } from '@tailormap-viewer/shared';

export const coreStateKey = 'core';

export interface ViewerState {
  id?: string;
  title?: string;
  languages?: Language[];
  styling?: ViewerStylingModel;
  components: ComponentModel[];
}

export interface CoreState {
  loadStatus: LoadingStateEnum;
  error?: string;
  routeBeforeLogin?: string;
  security: SecurityModel;
  viewer?: ViewerState;
}

export const initialCoreState: CoreState = {
  loadStatus: LoadingStateEnum.INITIAL,
  security: { isAuthenticated: false },
};
