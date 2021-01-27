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
    selector: 'app-admin-brand-dialog',
    templateUrl: './brand-dialog.component.html',
    styleUrls: ['./brand-dialog.component.scss']
})
export class AdminBrandDialogComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    public env: any;
    public form: any;
    public brand: any;
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
            name: new FormControl(this.brand.code_nm, [Validators.required]),
            // pin_code: new FormControl(this.brand.pin_code, [Validators.required]),
            // category_brand: new FormControl(this.brand.category_brand, [Validators.required]),
            code_dc: new FormControl(this.brand.code_dc, []),
            // hotline: new FormControl(this.brand.hotline, []),
            // address: new FormControl(this.brand.address, [])
        });
        console.log(this.brand);
        this.uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };
        if (typeof this.brand !== 'undefined' && typeof this.brand.code_nm !== 'undefined') {
            this.activeImages = this.brand.additional;
        }
    }

    save() {
        if (!this.resource.isChanged) {
            this.onSave();
        } else {
            this.resource.onSave((response) => {
                const name = response.name.split('.');
                const originalName = name[0] + '_ORIGINAL.' + name[1];
                this.brand.file = response.url + '/' + originalName;
                this.brand.resource_type = response.resource_type;
                this.onSave();
            });
        }
    }

    onSave() {
        if (this.activeImages !== '') {
            this.brand.additional = this.activeImages;
        }
        if (this.brand.code) {
            this.api
                .one('brands', this.brand.code)
                .customPUT(this.brand)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Brand has been updated successfully.'
                        );
                        this.onClose.next(true);
                        this.bsModalRef.hide();
                    }
                });
        } else {
            this.api
                .all('brands')
                .post(this.brand)
                .subscribe(res => {
                    if (res.result) {
                        this.toast.success(
                            'Brand has been created successfully.'
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

    fileChangeEvent(event: any, type): void {
        this.type = type;
        const files = event.target.files;
        if (files && files[0]) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = this.handleImageResult.bind(this);
            reader.readAsDataURL(file);
        }
    }

    handleImageResult(readerEvt) {
        this.fileBase64 = readerEvt.target.result;
        this.api.all('uploads').customPOST({file: this.fileBase64}).subscribe(res => {
            if (this.type === 1) {
                this.activeImages = res.result.url + '/' + res.result.name;
            }
        });
    }
}
