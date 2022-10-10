import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './confirm-dialog.component';
import { CssHelper } from '../../helpers';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {

  constructor(public dialog: MatDialog) {}

  public dialogRef: MatDialogRef<ConfirmDialogComponent> | undefined;

  public confirm$(title: string, message?: string, removeConfirm?: boolean): Observable<boolean> {
    if (this.dialogRef) {
      this.dialogRef.close(false);
    }
    const data: ConfirmDialogData = {
      title,
      message,
      removeConfirm,
    };
    this.dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '400px',
      maxHeight: CssHelper.MAX_SCREEN_HEIGHT,
      data,
    });
    return this.dialogRef.afterClosed();
  }

}
