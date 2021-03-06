import {
    Component,
    ElementRef,
    OnInit,
    ViewChild
} from '@angular/core';

import { Restangular } from 'ngx-restangular';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

import { environment } from '../../../environments/environment';
import { AdminResourceComponent } from '../resource/resource.component';
import * as moment from 'moment';
import * as htmlToImage from 'html-to-image';
import { toPng, toJpeg, toBlob, toPixelData, toSvg } from 'html-to-image';
import html2canvas from 'html2canvas';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import * as _ from 'lodash';
import { AdminVoucherImagesDialogComponent } from './voucher-images-dialog/voucher-images-dialog.component';

import { ColorEvent } from 'ngx-color';

@Component({
    selector: 'app-admin-voucher-images-create',
    templateUrl: './voucher-images-create.component.html',
    styleUrls: ['./voucher-images-create.component.scss']
})
export class AdminVoucherImagesCreateComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;
    public message: string;
    public categories: any;
    public env: any;
    public form: any;
    public voucherId: any;
    public voucher: any;
    public required_upload_file_url: boolean;
    public imageChangedEvent: any;
    public imageBase64: any;
    public modalRef: BsModalRef;
    public voucherOb: any;
    public validCondition = true;

    constructor(
        private api: Restangular,
        private router: Router,
        public activeRoute: ActivatedRoute,
        private toast: ToastrService,
        public modalService: BsModalService
    ) { }

    ngOnInit() {
        this.env = environment;

        this.activeRoute.params.forEach((params: Params) => {
            this.voucherId = params['id'];
        });

        this.required_upload_file_url = false;

        this.voucher = {
            is_youtube: false
        };

        this.voucher.code_group = "407";
        if (this.voucherId) {
            this.getVoucher();
        }
        this.form = new FormGroup({
            partner_name: new FormControl(this.voucher.partner_name, []),
            voucher_title: new FormControl(this.voucher.voucher_title, []),
            conditions_apply: new FormControl(this.voucher.conditions_dc, []),
            code_group: new FormControl(this.voucher.code_group, []),
            text_color: new FormControl(this.voucher.text_color, []),
            background_color: new FormControl(this.voucher.background_color, []),
            vaild_date: new FormControl(this.voucher.vaild_date, []),
            series_number_from: new FormControl(this.voucher.series_from, []),
            series_number_to: new FormControl(this.voucher.series_to, []),
            series_header: new FormControl(this.voucher.code, []),

        });

    }
    handleChange($event: ColorEvent) {
        this.form.controls.background_color.value = "rgba(" + $event.color.rgb.r + ", " + $event.color.rgb.g + ", " + $event.color.rgb.b + ", " + $event.color.rgb.a + ")";
    }
    handleChangeColor($event: ColorEvent) {
        this.form.controls.text_color.value = "rgba(" + $event.color.rgb.r + ", " + $event.color.rgb.g + ", " + $event.color.rgb.b + ", " + $event.color.rgb.a + ")";
    }

    getVoucher() {
        this.api
            .one('voucher-image/detail/', this.voucherId)
            .get()
            .subscribe(res => {
                this.voucher = res;
                this.form.controls.text_color.value = this.voucher.text_color;
                this.form.controls.background_color.value = this.voucher.background_color;
            });
    }

    isValidContent() {
        var description = this.form.controls.conditions_apply.value;
        var des = (description.split(new RegExp("<p>", "gi")).length - 1);
        var des2 = (description.split(new RegExp("<li>", "gi")).length - 1);
        if (des > 5 || des2 > 5) {
            this.validCondition = false;
            return
        } else this.validCondition = true;
    }


    previewVoucher() {
        this.isValidContent();
        if(!this.validCondition) {
            return
        }
        this.voucherOb = {
            partner_name: this.form.controls.partner_name.value,
            voucher_title: this.form.controls.voucher_title.value,
            conditions_apply: this.form.controls.conditions_apply.value,
            code_group: this.form.controls.code_group.value,
            text_color: this.form.controls.text_color.value,
            background_color: this.form.controls.background_color.value,
            vaild_date: this.form.controls.vaild_date.value,
            series_number_from: this.form.controls.series_number_from.value,
            series_number_to: this.form.controls.series_number_to.value,
            series_header: this.form.controls.series_header.value,
            zip_name: '',
        }
        const initialState = {
            voucher: _.cloneDeep(this.voucherOb)
        };
        this.modalRef = this.modalService.show(
            AdminVoucherImagesDialogComponent,
            { initialState }
        );

        // this.modalRef.content.onClose.subscribe(result => {
        //     this.getBanner();
        // });
    }
}
