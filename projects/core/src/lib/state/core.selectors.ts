import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CoreState, coreStateKey } from './core.state';

const selectCoreState = createFeatureSelector<CoreState>(coreStateKey);
const selectApplicationState = createSelector(selectCoreState, state => state.application);

export const selectApplicationId = createSelector(selectApplicationState, state => state?.id || null);
export const selectRouteBeforeLogin = createSelector(selectCoreState, state => state.routeBeforeLogin);

export const selectUserDetails = createSelector(selectCoreState, state => state.security);
