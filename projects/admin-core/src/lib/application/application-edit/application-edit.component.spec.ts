import { render, screen } from '@testing-library/angular';
import { ApplicationEditComponent } from './application-edit.component';
import { ApplicationState, applicationStateKey, initialApplicationState } from '../state/application.state';
import { getApplication } from '@tailormap-admin/admin-api';
import { getMockStore, provideMockStore } from '@ngrx/store/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ApplicationService } from '../services/application.service';
import { ConfirmDialogService, SharedModule } from '@tailormap-viewer/shared';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import userEvent from '@testing-library/user-event';
import { clearSelectedApplication } from '../state/application.actions';
import { SaveButtonComponent } from '../../shared/components/save-button/save-button.component';
import { TestSaveHelper } from '../../test-helpers/test-save.helper';
import { RouterTestingModule } from '@angular/router/testing';

const setup = async (hasApp: boolean, hasChanges?: boolean) => {
  const mockState: ApplicationState = {
    ...initialApplicationState,
    draftApplicationUpdated: hasChanges ?? false,
    draftApplication: hasApp ? getApplication({ id: '1', title: 'my app' }) : undefined,
    applications: !hasApp ? [] : [
      getApplication({ id: '1', title: 'my app' }),
    ],
  };
  const appService = {
    saveDraftApplication$: jest.fn(() => of(true)),
    deleteApplication$: jest.fn(() => of(true)),
  };
  const mockStore = getMockStore({ initialState: { [applicationStateKey]: mockState } });
  const mockDispatch = jest.fn();
  mockStore.dispatch = mockDispatch;
  await render(ApplicationEditComponent, {
    imports: [ SharedModule, RouterTestingModule.withRoutes(
      [{ path: 'applications', component: ApplicationEditComponent }],
    ) ],
    declarations: [SaveButtonComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
      { provide: Store, useValue: mockStore },
      { provide: ApplicationService, useValue: appService },
    ],
  });
  return { dispatch: mockDispatch, appService };
};

describe('ApplicationEditComponent', () => {

  test('should render with selected app', async () => {
    await setup(true);
    expect(await screen.findByText('Edit my app')).toBeInTheDocument();
    expect(await screen.findByText('Save')).toBeInTheDocument();
    expect(await screen.findByText('Close')).toBeInTheDocument();
    expect(await screen.findByText('Delete')).toBeInTheDocument();
  });

  test('should render nothing without selected app', async () => {
    await setup(false);
    expect(await screen.queryByText('Edit my app')).not.toBeInTheDocument();
  });

  test('should close selected app', async () => {
    const { dispatch } = await setup(true);
    await userEvent.click(await screen.findByText('Close'));
    expect(dispatch).toHaveBeenCalledWith(clearSelectedApplication());
  });

  test('should delete app - cancel action', async () => {
    const { appService } = await setup(true);
    await userEvent.click(await screen.findByText('Delete'));
    expect(await screen.findByText('Are you sure you want to delete application my app? This action cannot be undone.')).toBeInTheDocument();
    await userEvent.click(await screen.findByText('No'));
    expect(appService.deleteApplication$).not.toHaveBeenCalled();
  });

  test('should delete app - confirm action', async () => {
    const { appService } = await setup(true);
    await userEvent.click(await screen.findByText('Delete'));
    expect(await screen.findByText('Are you sure you want to delete application my app? This action cannot be undone.')).toBeInTheDocument();
    await userEvent.click(await screen.findByText('Yes'));
    expect(appService.deleteApplication$).toHaveBeenCalledWith('1');
  });

  test('should have disabled save button by default', async () => {
    await setup(true);
    await TestSaveHelper.waitForButtonToBeDisabled('Save');
  });

  test('should save app', async () => {
    const { appService } = await setup(true, true);
    await TestSaveHelper.waitForButtonToBeEnabledAndClick('Save');
    expect(appService.saveDraftApplication$).toHaveBeenCalled();
  });

});