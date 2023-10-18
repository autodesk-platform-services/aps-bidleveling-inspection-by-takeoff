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

import { loadModelAndHighlightItems,renderTakeOffInventoryTable } from './takeoff.js';

async function bidlevelingData(d, plug) {

    const projectId = d.projectId;
    const bidPackageId = d.bidPackageId;

    //get project overview
    const projInfo = await bcProjectInfo(projectId)
    //get project bid form
    const projForm = await bcBidProjectForm(projectId)
    //get bidpackage data
    const bidPackage = await bcBidPackage(bidPackageId)
    //get bid scope specific form
    const scopeForm = await bcBidScopeSpecificForm(bidPackageId)
    //get bids
    const bids = await bcBids(bidPackageId)

    //render bids panel

    var rows = []
    var columns = []
    columns.push({ field: 'tender', title: `Estimated Cost: $${bidPackage.estimatedCost}`, align: 'left', width: 10, formatter: rawFormatter })
    var bidder_data_map = {}
    for (var i = 0; i < bids.length; i++) {
        const b = bids[i]
        if (b.bidderCompanyId in bidder_data_map) {
            b.company = bidder_data_map[b.bidderCompanyId][0].company
            bidder_data_map[b.bidderCompanyId].push(b)
        } else {
            bidder_data_map[b.bidderCompanyId] = []
            //get company info
            const contacts = await bcCompany(b.bidderCompanyId)
            const company = contacts.results[0].company
            b.company = company
            bidder_data_map[b.bidderCompanyId].push(b)

        }
    }

    //find latest revision
    var bidder_data_map_latest = {}
    for (const [companyId, companyBids] of Object.entries(bidder_data_map)) {
        const latest = companyBids.find(i => i.revision == companyBids.length - 1)
        bidder_data_map_latest[companyId] = latest
    }

    var bidder_columns = Object.keys(bidder_data_map_latest)

    //var rows = [{ tender: bidPackage.estimatedCost }] // row 0
    for (var i = 0; i < bidder_columns.length; i++) {
        const bid = bidder_data_map_latest[bidder_columns[i]]
        //const submittedBy = await bcInvitee(bid.bidPackageId, bid.bidderCompanyId, bid.submittedBy)
        const revision = bid.revision
        const submittedAt = bid.submittedAt
        columns.push({ field: `${bid.company.id}`, title: `Company: ${bid.company.name}`, align: 'left', width: 10, formatter: rawFormatter })

        //rows[0][bidder_columns[i]] = //`${submittedBy.firstName} ${submittedBy.lastName} \n Revision ${revision}, ${submittedAt}`
        //` Revision ${revision}, Submitted At ${submittedAt}`
    }

    var rows = []
    rows.push({ tender: `Leveled Bid` })// row 1

    for (var i = 0; i < bidder_columns.length; i++) {
        const bid = bidder_data_map_latest[bidder_columns[i]]
        rows[0][bidder_columns[i]] = `$ ${bid.leveledTotal}`
    }

    rows.push({ tender: `Base Bid` })// row 2

    for (var i = 0; i < bidder_columns.length; i++) {
        const bid = bidder_data_map_latest[bidder_columns[i]]
        rows[1][bidder_columns[i]] = `$ ${bid.total}`
    }

    rows.push({ tender: `Line Items` })// row 3
    for (var i = 0; i < bidder_columns.length; i++) {
        rows[2][bidder_columns[i]] = ``
    }

    //COST_BREAKDOWN
    const COST_BREAKDOWN_ITEMS = scopeForm.lineItems.results.filter(i => i.type == 'COST_BREAKDOWN')
    for (var k = 0; k < COST_BREAKDOWN_ITEMS.length; k++) {
        const defItem = COST_BREAKDOWN_ITEMS[k]
        const defId = defItem.id
        const defCode = defItem.code ? defItem  .code : ''
        const defDesc = defItem.description
        const defType = defItem.type
        const defUnit = defItem.unit

        const no = rows.push({ tender: `  ${defDesc}` })// more row 

        for (var i = 0; i < bidder_columns.length; i++) {
            const bid = bidder_data_map_latest[bidder_columns[i]]
            const lineItems = bid.lineItems.results
            const plugs = bid.plugs.results

            const insItem = lineItems.find(i => i.id == defId)
            if (!insItem) {
                rows[no - 1][bidder_columns[i]] = ``
                continue
            }

            const insCode = insItem.code ? insItem.code : ''
            const insDesc = insItem.description
            const insType = insItem.type
            const insUnit = insItem.unit

            const insUnitCost = insItem.unitCost
            const insQuantity = insItem.quantity
            const insValue = insItem.value


            const plugItem = plugs.find(i => {
                const plugFootPrint = i.lineItemFingerprint
                const plugFootPrintCode = plugFootPrint.code ? plugFootPrint.code : ''
                const plugFootPrintDesc = plugFootPrint.description
                return (plugFootPrintCode + plugFootPrintDesc).toLowerCase() == (insCode + insDesc).toLowerCase()
            }
            )

            var cellValue = ``
            //if (defUnit == `COST_BREAKDOWN`) 
            {
                cellValue = COST_BREAKDOWN(insUnitCost, insQuantity, insValue, insUnit, plugItem)
            }
            //else {

            //}
            //sort sections of lineItems
            rows[no - 1][bidder_columns[i]] = `${cellValue}`
        }
    }

    //INCLUSION
    rows.push({ tender: `Inclusion` })// row 3
    for (var i = 0; i < bidder_columns.length; i++) {
        rows[rows.length - 1][bidder_columns[i]] = ``
    }

    const INCLUSION_ITEMS = scopeForm.lineItems.results.filter(i => i.type == 'INCLUSION')
    for (var k = 0; k < INCLUSION_ITEMS.length; k++) {
        const defItem = INCLUSION_ITEMS[k]
        const defId = defItem.id
        const defCode = defItem.code ? item.code : ''
        const defDesc = defItem.description
        const defType = defItem.type
        const defUnit = defItem.unit

        const no = rows.push({ tender: `  ${defDesc}` })// more row 

        for (var i = 0; i < bidder_columns.length; i++) {
            const bid = bidder_data_map_latest[bidder_columns[i]]
            const lineItems = bid.lineItems.results
            const plugs = bid.plugs.results

            const insItem = lineItems.find(i => i.id == defId)
            if (!insItem) {
                rows[no - 1][bidder_columns[i]] = ``
                continue
            }

            const insCode = insItem.code ? insItem.code : ''
            const insDesc = insItem.description
            const insType = insItem.type
            const insUnit = insItem.unit

            const insUnitCost = insItem.unitCost
            const insQuantity = insItem.quantity
            const insValue = insItem.value

            const plugItem = plugs.find(i => {
                const plugFootPrint = i.lineItemFingerprint
                const plugFootPrintCode = plugFootPrint.code ? plugFootPrint.code : ''
                const plugFootPrintDesc = plugFootPrint.description
                return (plugFootPrintCode + plugFootPrintDesc).toLowerCase() == (insCode + insDesc).toLowerCase()
            }
            )

            var cellValue = ``
            if (defUnit == `YES_NO_WITH_ADJUSTMENT`) {
                if (plugItem)
                    cellValue = plugItem.value
                else
                    cellValue = insValue
            }
            else {

            }
            //sort sections of lineItems
            rows[no - 1][bidder_columns[i]] = `${cellValue}`
        }
    }


    return { rows:rows, columns:columns }
}

export async function renderBidsLevelingTable(d, plug) {

    $('.progressBidLeveling').show(); 

    const { rows, columns } = await bidlevelingData(d, plug)

    $(`#BidLevelingTable`).bootstrapTable('destroy');
    $(`#BidLevelingTable`).bootstrapTable({
        parent: this,
        data: rows,
        editable: true,
        clickToSelect: true,
        cache: false,
        showToggle: false,
        showPaginationSwitch: false,
        pagination: true,
        pageList: [5, 10, 25, 50, 100],
        pageSize: 50,
        pageNumber: 1,
        uniqueId: 'id',
        striped: true,
        search: false,
        showRefresh: false,
        minimumCountColumns: 2,
        smartDisplay: true,
        columns: columns
    });

    $('.progressBidLeveling').hide();
 

    $('#BidLevelingTable').on('click-row.bs.table', async (e, row, $element, field)=> {
            
        const name = row.tender

        //highlight the selected row of BidLevelingTable
        $('#BidLevelingTable .selectedRow').removeClass('selectedRow');
        $element.toggleClass('selectedRow') 
        //highlight the corresponding row of takeoffTable
        const index = await getTakeOffRowByBidName(name)
        $('#takeoffTable .selectedRow').removeClass('selectedRow'); 
        $(`#takeoffTable tbody tr:eq(${index})`).toggleClass('selectedRow')  

        //higlight the items in viewer
        const currentTypeId = $('#takeoffTable').data()['bootstrap.table'].data[index].typeId
        const takeoffColor = $('#takeoffTable').data()['bootstrap.table'].data[index].color

        //higlight the items in viewer 
        loadModelAndHighlightItems(currentTypeId,takeoffColor) 

        //produce takeoff inventory 
        renderTakeOffInventoryTable(items, $('#takeoffTable').data()['bootstrap.table'].data[index].name,     
            $('#takeoffTable').data()['bootstrap.table'].data[index].unit
        ) 
    })  
}

function COST_BREAKDOWN(insUnitCost, insQuantity, insValue, insUnit, plugItem) {
    var cellValue = ``

    if (plugItem) {
        if (insUnit == 'TOTAL_COST_ONLY') {
            let temp = plugItem.value ? plugItem.value : insValue
            const finalValue = temp ? temp : `--`
            cellValue += `      $${finalValue}`
        } else {

            let temp = plugItem.quantity ? plugItem.quantity : insQuantity
            const finalQuantity = temp ? temp : `--`
            cellValue += `${finalQuantity} `
            cellValue += `${insUnit}@ `

            temp = plugItem.unitCost ? plugItem.unitCost : insUnitCost
            const finalUnitCost = temp ? temp : `--`
            cellValue += `$${finalUnitCost}`

            if (finalUnitCost == `--` || finalQuantity == `--`) {
                cellValue += `          $--`
            } else {
                const finalValue = finalUnitCost * finalQuantity
                cellValue += `          $${finalValue}`
            }
        }

    } else {
        if (insUnit == 'TOTAL_COST_ONLY') {
            const finalValue = insValue ? insValue : `--`
            cellValue += `$${finalValue}`
        } else {
            const finalQuantity = insQuantity ? insQuantity : `--`
            cellValue += `${finalQuantity} `
            cellValue += `${insUnit} @`

            const finalUnitCost = insUnitCost ? insUnitCost : `--`
            cellValue += `$${finalUnitCost}`

            if (finalUnitCost == `--` || finalQuantity == `--`) {
                cellValue += `          $--`

            } else {
                const finalValue = finalUnitCost * finalQuantity
                cellValue += `          $${finalValue}`
            }
        }
    }
    return cellValue
}

async function bcProjectInfo(projectId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/projectInfo/${projectId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcBidProjectForm(projectId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/projectForm/${projectId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcBidPackage(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidPackage/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcBidScopeSpecificForm(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bidScopeSpecForm/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function bcBids(bidPackageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/bids/${bidPackageId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
} 

async function bcCompany(companyId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/bc/company/${companyId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

function getTakeOffRowByBidName (row_name) {
    
     var that = $('#takeoffTable').data()['bootstrap.table'].data
     return new Promise((resolve, reject) => {
        $.each(that, (d_i, d_val)=>{
            if(d_val.name.split(' ').join('') == row_name.split(' ').join('')){
                resolve(d_i)
            } 
        });
    }) 
}

function rawFormatter(value, row, index) {
    var re = value
    return re
}
 
