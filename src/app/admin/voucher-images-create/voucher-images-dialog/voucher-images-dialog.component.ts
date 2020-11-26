import { Component, OnInit, Inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { Restangular } from 'ngx-restangular';
import { CookieService } from '../../../../services/cookie.service';
// import * as _ from 'lodash';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap';
import { Subject } from 'rxjs';
import { AdminResourceComponent } from '../../resource/resource.component';
import html2canvas from 'html2canvas';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { map } from 'lodash';

const URL = environment.host + '/uploads';

@Component({
    selector: 'app-admin-voucher-images-dialog',
    templateUrl: './voucher-images-dialog.component.html',
    styleUrls: ['./voucher-images-dialog.component.scss']
})
export class AdminVoucherImagesDialogComponent implements OnInit {
    @ViewChild('resource') public resource: AdminResourceComponent;

    @ViewChild('screen') screen: ElementRef;
    @ViewChild('canvas') canvas: ElementRef;
    @ViewChild('downloadLink') downloadLink: ElementRef;
    public env: any;
    public voucherForm: any;
    public voucher: any;
    public onClose: Subject<boolean>;
    public type = 0;
    public fileBase64: any;
    public activeImages = '';
    public code: any;
    public code_header: any;
    public basePic = [];
    public zip_name = '';
    constructor(
        private api: Restangular,
        private toast: ToastrService,
        public bsModalRef: BsModalRef,
        private router: Router,
    ) { }

    ngOnInit() {
        this.env = environment;
        this.onClose = new Subject();

        if (this.voucher.series_number_to < 10) {
            this.code_header = this.voucher.series_header + '00';
            this.code = this.code_header + this.voucher.series_number_from;
            this.zip_name = this.voucher.series_header + '00' + this.voucher.series_number_from + '-00' + this.voucher.series_number_to + '.zip';
        }
        if (this.voucher.series_number_to >= 10) {
            this.code_header = this.voucher.series_header + '0';
            this.code = this.code_header + this.voucher.series_number_from;
            this.zip_name = this.voucher.series_header + '00' + this.voucher.series_number_from + '-0' + this.voucher.series_number_to + '.zip';
        }
        this.voucher.zip_name = this.zip_name
        this.voucherForm = new FormGroup({
            partner_name: new FormControl(this.voucher.partner_nam),
            voucher_title: new FormControl(this.voucher.voucher_title),
            code: new FormControl(this.voucher.series_header),
            conditions_apply: new FormControl(this.voucher.conditions_apply, []),
            code_group: new FormControl(this.voucher.code_group, []),
            text_color: new FormControl(this.voucher.text_color),
            vaild_date: new FormControl(this.voucher.vaild_date),
            zip_name: new FormControl(this.voucher.zip_name),
        });
        document.getElementById('export-voucher').style.backgroundColor = this.voucher.text_color;
    }


    onSave() {
        this.api
            .all('add-voucher-image')
            .post(this.voucher)
            .subscribe(res => {
                if (res.result) {
                    this.toast.success(
                        'Voucher has been created successfully.'
                    );
                    this.onClose.next(true);
                    this.bsModalRef.hide();
                    this.router.navigate(['/admin/voucher-images']);
                }
            });
    }


    close() {
        this.bsModalRef.hide();
    }

    testCode(index) {
        this.code = this.code_header + (index + this.voucher.series_number_from);
    }
    async downloadImage() {
        for (let index = 1; index <= this.voucher.series_number_to - this.voucher.series_number_from + 1; index++) {
            await this.testCode(index);
            await html2canvas(this.screen.nativeElement,{
                scrollX: 0,
                scrollY: 0
              }).then(canvas => {
                this.canvas.nativeElement.src = canvas.toDataURL();
                this.downloadLink.nativeElement.href = canvas.toDataURL('image/png');
                this.basePic.push(this.downloadLink.nativeElement.href.replace(/^data:image\/(png|jpg);base64,/, ""));
            });

        }
        await this.zipImage(this.zip_name);
        this.onSave();
        this.bsModalRef.hide();
    }
    zipImage(seri) {
        var zip = new JSZip();
        var img = zip.folder("images");
        this.basePic.map((item, i) => {
            if (this.voucher.series_number_to < 10) {
                img.file(this.voucher.series_header + '00' + (i + this.voucher.series_number_from) + ".png", item, { base64: true });
            }
            if (this.voucher.series_number_to >= 10) {
                img.file(this.voucher.series_header + '0' + (i + this.voucher.series_number_from) + ".png", item, { base64: true });
            }
        });
        zip.generateAsync({ type: "blob" })
            .then(function (content) {
                // see FileSaver.js
                saveAs(content, seri);
            });
    }
}
