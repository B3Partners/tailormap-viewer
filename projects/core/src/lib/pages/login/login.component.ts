import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { selectRouteBeforeLogin } from '../../state/core.selectors';
import { take } from 'rxjs';
import { setLoginDetails, setRouteBeforeLogin } from '../../state/core.actions';
import { TAILORMAP_SECURITY_API_V1_SERVICE, TailormapSecurityApiV1ServiceModel, UserResponseModel } from '@tailormap-viewer/api';

@Component({
  selector: 'tm-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {

  public login$ = (username: string, password: string) => this.api.login$(username, password);

  constructor(
    private store$: Store,
    private router: Router,
    @Inject(TAILORMAP_SECURITY_API_V1_SERVICE) private api: TailormapSecurityApiV1ServiceModel,
  ) { }

  public loggedIn($event: UserResponseModel) {
    this.store$.select(selectRouteBeforeLogin)
      .pipe(take(1))
      .subscribe(beforeLoginUrl => {
        this.router.navigateByUrl(beforeLoginUrl || '/');
        this.store$.dispatch(setRouteBeforeLogin({ route: '' }));
        this.store$.dispatch(setLoginDetails($event));
      });
  }

}
