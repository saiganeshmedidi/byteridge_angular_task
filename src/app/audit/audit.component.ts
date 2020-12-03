import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs/operators';

import { Audit, User } from '@/_models';
import { AuditService, AuthenticationService } from '@/_services';

@Component({ templateUrl: 'audit.component.html' })
export class AuditComponent implements OnInit {
    audits: any[] = [];
    originalAudits: any[] = []
    currentUser: User = null;

    sortByType: any = 'ID';
    sortOrder: any = 'ASC';

    // By default hours format
    hoursFormat = "12";

    // Pagination default settings
    paginationSettings = {
        totalPages: 0,
        size: 5,
        pageNumber: 0,
        pages: []
    }

    constructor(
        private authenticationService: AuthenticationService,
        private auditService: AuditService,
    ) {
    }

    ngOnInit() {
        this.currentUser = this.authenticationService.currentUserValue;
        this.loadAllAudits();
    }

    private loadAllAudits() {
        this.auditService.getAll()
            .pipe(first())
            .subscribe(audits => {
                this.audits = audits;
                this.originalAudits = audits;
                this.audits.forEach((audit, index) => {
                    this.audits[index].loginTime = new Date(Number(this.audits[index].loginTime));
                    this.audits[index].logoutTime = new Date(Number(this.audits[index].logoutTime));
                })
                this.setPagination();
            }
            );
    }

    //  On Searching audits
    onSearchAudits(e) {
        console.log(e.target.value);
        this.audits = JSON.parse(JSON.stringify(this.originalAudits))

        if (e.target.value.length) {
            let filteredAudits: any[] = this.audits.filter((audit, index) => {
                if (audit.id.includes(e.target.value)) {
                    return true;
                }
            })
            this.audits = JSON.parse(JSON.stringify(filteredAudits))
            this.setPagination()
        } else {
            this.audits = JSON.parse(JSON.stringify(this.originalAudits))
            this.setPagination()
        }
    }

    // On Change Sort By Id and user only (either by ascending/decending)
    onChangeSortOrder() {
        if (this.sortByType && this.sortOrder == 'ASC') {
            if(this.sortByType == 'ID') {
                this.audits.sort((a, b) => (a.id > b.id) ? 1 : ((b.id > a.id) ? -1 : 0));
            } else {
                this.audits.sort((a, b) => (a.user > b.user) ? 1 : ((b.user > a.user) ? -1 : 0));
            }
        } else if (this.sortByType && this.sortOrder == 'DESC') {
            if(this.sortByType == 'ID') {
                this.audits.sort((a, b) => (a.id > b.id) ? -1 : ((b.id > a.id) ? 1 : 0));
            } else {
                this.audits.sort((a, b) => (a.user > b.user) ? -1 : ((b.user > a.user) ? 1 : 0));
            }
        }
    }

    // Setting Pagination on each page change
    setPagination() {
        if (this.audits.length) {
            this.paginationSettings.pages = [];
            this.paginationSettings.totalPages = Math.ceil(this.audits.length / this.paginationSettings.size);
            let pageStart = Math.floor(this.paginationSettings.pageNumber / this.paginationSettings.size) * this.paginationSettings.size;
            let pageEnd = pageStart + this.paginationSettings.size;
            for (let i = pageStart; i < pageEnd; i++) {
                this.paginationSettings.pages.push(i + 1)
            }
        } else {
            this.paginationSettings = {
                totalPages: 0,
                size: 5,
                pageNumber: 0,
                pages: []
            }
        }
    }

    /** Get pagination based on page number */
    getCurrentPage(pageNumber) {
        this.paginationSettings.pageNumber = pageNumber;
    }

    /** Get previous page users */
    getPreviousPage() {
        this.paginationSettings.pageNumber -= 1;
        this.setPagination();
    }

    /** Get next page users */
    getNextPage() {
        this.paginationSettings.pageNumber += 1;
        this.setPagination();
    }

    /** Get the very first page users */
    getFirstPage() {
        this.paginationSettings.pageNumber = 0;
        this.setPagination();
    }

    /** Get the very last page users */
    getLastPage() {
        this.paginationSettings.pageNumber = this.paginationSettings.totalPages - 1;
        this.setPagination();
    }
}