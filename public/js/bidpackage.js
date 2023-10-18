
/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Developer Acvocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

import { renderBidsLevelingTable } from './bidleveling.js';
import { renderTakeoffTable } from './takeoff.js';

export async function bcUserMe() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: '/aps/bc/userme',
            success: function (me) {
                resolve(me)
            }
        });
    })
}

export async function initBCTree() {

    var bcTree = $('#bcTree').jstree(true);
    if (bcTree) { bcTree.destroy(); }

    $('#bcTree').jstree({
        core: {
            themes: { icons: true },
            data: {
                url: `/aps/bc/bcTree`,
                dataType: "json",
                multiple: false,
                data: function (node) {
                    $('#bcTree').jstree(true).toggle_node(node);
                    if (node.id == '#') {
                        const bcUserId = $('#bcUserId').text()
                        return { type: node.id, bcUserId: bcUserId }
                    }
                    else
                        return { id: node.id, type: node.type, data: node.data };

                },
                success: function (node) {
                }
            }
        },
        types: {
            default: {
                icon: 'fal fa-border-none'
            },
            '#': {
                icon: 'fal fa-border-none'
            },
            project: {
                icon: 'fa fa-inbox'
            },
            bidpackage: {
                icon: 'fa fa-file-zip-o'
            }
        },
        plugins:
            ["types", "state", "sort"]
    }).bind("activate_node.jstree", async (evt, data) => {
        if (data != null && data.node != null) {
            switch (data.node.type) {
                case 'project':
                    break;
                case 'bidpackage':

                    const bidPackageId = data.node.id
                    const projecId = data.node.data.projectId
                    //produce bid leveling 
                    await renderBidsLevelingTable({ projectId: projecId, bidPackageId: bidPackageId })
                    //produce bidPackage Overview
                    bidPackageOverview(bidPackageId)
                    //produce take off tree 
                    const bcPackageData = data.node.data.packageData
                    const currentAccLinkedProjectId = bcPackageData.currentAccLinkedProjectId
                    renderTakeoffTable(currentAccLinkedProjectId, bcPackageData.name)
                    break;
            }
        }
    });
}

async function bidPackageOverview(bidPackageId) {
    //general information
    const bidPackageData = await getOneBidPackage(bidPackageId)
    //invitees
    const invitees = await bcInvitees(bidPackageId)
    $('#bid-invited').text(`${invitees.length} companies invited`)
    var undecided = invitees.filter(i => i.state == 'UNDECIDED')
    undecided = undecided ? undecided.length : 0
    var submitted = invitees.filter(i => i.state == 'BID_SUBMITTED')
    submitted = submitted ? submitted.length : 0
    var notbidding = invitees.filter(i => i.state == 'NOT_BIDDING')
    notbidding = notbidding ? notbidding.length : 0

    $('#Undecided').html(`${undecided}`)
    $('#Bidding').html(`${submitted}`)
    $('#NoBidding').html(`${notbidding}`)


    $('#bid-number').text(bidPackageData.number)
    $('#bid-name').text(bidPackageData.name)
    $('#bid-keywords').text(bidPackageData.keywords.toString())
    const leadName = await bcUser(bidPackageData.leadUserId)
    $('#bid-lead').text(leadName.firstName + leadName.lastName)
    $('#bid-estimatedCost').text(`$ ${bidPackageData.estimatedCost}`)
    $('#bid-bidDueAt').text(bidPackageData.bidsDueAt)
    $('#bid-jobWalkAt').text(bidPackageData.jobWalkAt)
    $('#bid-rfisDueAt').text(bidPackageData.rfisDueAt)
    $('#bid-startsAt').text(bidPackageData.startsAt)
    $('#bid-endsAt').text(bidPackageData.endsAt)
}

async function getOneBidPackage(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidPackage/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcUser(userId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/user/${userId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcInvitees(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/invitees/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

