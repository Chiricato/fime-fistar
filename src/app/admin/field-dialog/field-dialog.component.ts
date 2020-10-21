import { Component, OnInit, Inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { CookieService } from '../../../services/cookie.service';
// import * as _ from 'lodash';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap';
import { Subject } from 'rxjs';
import { AdminResourceComponent } from '../resource/resource.component';
import {FileUploader} from 'ng2-file-upload';

const URL = environment.host + '/uploads';

@Component({
    selector: 'app-admin-field-dialog',
    templateUrl: './field-dialog.component.html',
    styleUrls: ['./field-dialog.component.scss']
})
export class AdminFieldDialogComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    public env: any;
    public form: any;
    public field: any;
    public onClose: Subject<boolean>;
    public type = 0;
    public uploader: FileUploader = new FileUploader({url: URL, itemAlias: 'category'});
    public fileBase64: any;
    public activeImages = '';

    constructor(
        private api: Restangular,
        private toast: ToastrService,
        public bsModalRef: BsModalRef
    ) {}

    ngOnInit() {
        this.env = environment;
        this.onClose = new Subject();

        this.form = new FormGroup({
            name: new FormControl(this.field.name, [Validators.required])
        });
    }

    save() {
        this.onSave();
    }

    onSave() {
        if (this.field.id) {
            this.api
                .one('field', this.field.id)
                .customPUT(this.field)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Field has been updated successfully.'
                        );
                        this.onClose.next(true);
                        this.bsModalRef.hide();
                    }
                });
        } else {
            this.api
                .all('field')
                .post(this.field)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Field has been created successfully.'
                        );
                        this.onClose.next(true);
                        this.bsModalRef.hide();
                    }
                });
        }
    }

    close() {
        this.bsModalRef.hide();
    }
}
