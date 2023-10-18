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

import { launchViewer, highlightTakeoffItems,viewer } from './viewer.js';

var currentTakeOffTypeItems = null

async function takeOffData(accProjectId, packageName) {

    const { packageId, takeOffTypes } = await accTakeOffTypes(accProjectId, packageName)
    currentTakeOffTypeItems = await accTakeOffItems(accProjectId, packageId)

    var columns = [{ field: 'name', title: 'Name', align: 'center', width: 20, formatter: rawFormatter },
    { field: 'unit', title: 'Unit', align: 'center', width: 20, formatter: rawFormatter },
    { field: 'instance', title: 'instance', align: 'center', width: 20, formatter: rawFormatter },
    { field: 'quantity', title: 'Quantity', align: 'center', width: 20, formatter: rawFormatter },
    { field: 'color', title: 'color', align: 'center', width: 20, formatter: rawFormatter, visible: false },
    { field: 'typeId', title: 'typeId', align: 'center', width: 200, formatter: rawFormatter, visible: false }
    ]
    var rows = []

    await Promise.all(takeOffTypes.map(async (i) => {
        const items = currentTakeOffTypeItems.filter(k => k.takeoffTypeId == i.id)
        const instance = items && items.length > 0 ? items.length : 0
        const unit = i.primaryQuantityDefinition.unitOfMeasure
        const name = i.primaryQuantityDefinition.outputName ? i.primaryQuantityDefinition.outputName : i.name
        var quantity = 0
        if (unit == 'EA') {
            quantity = instance
        } else {
            await Promise.all(items.map(async (k) => {
                quantity += k.primaryQuantity.quantity
            }))
        }
        rows.push({ name: name, unit: unit, instance: instance, quantity: parseFloat(quantity).toFixed(2), typeId: `${i.id}`, color: i.color })

    }));

    return { rows:rows, columns:columns }

}

export async function renderTakeoffTable(accProjectId, packageName) {

    $('.progressTakeoff').show();
    const { rows, columns } = await takeOffData(accProjectId, packageName)
    $(`#takeoffTable`).bootstrapTable('destroy');
    $(`#takeoffTable`).bootstrapTable({
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
    $('.progressTakeoff').hide();

    $('#takeoffTable').on('click-row.bs.table', async (e, row, $element, field) => {

        const typeId = row.typeId 
        const name = row.name
        const unitOfMeasure = row.unit
        const takeoffColor = row.color

        //highlight selected row
        $('#takeoffTable .selectedRow').removeClass('selectedRow');
        $element.toggleClass('selectedRow')
        //highlight corresponding row of BidLevelingTable
        const index = await getBidRowByTakeOffName(name)
        $('#BidLevelingTable .selectedRow').removeClass('selectedRow');
        $(`#BidLevelingTable tbody tr:eq(${index})`).toggleClass('selectedRow')

        const items = currentTakeOffTypeItems.filter(i => i.takeoffTypeId == typeId)

        //produce takeoff inventory  
        renderTakeOffInventoryTable(items, name, unitOfMeasure) 

        //higlight the items in viewer
        loadModelAndHighlightItems(accProjectId,typeId,takeoffColor)
    })
}


export async  function renderTakeOffInventoryTable(items, name, unitOfMeasure) {
    var columns = []
    columns.push({ field: `name`, title: "Output Name", align: 'center', width: 50, formatter: rawFormatter })
    columns.push({ field: `unit`, title: "Unit", align: 'center', width: 50, formatter: rawFormatter })
    columns.push({ field: `quantity`, title: "Quantity", align: 'center', width: 50, formatter: rawFormatter })
    columns.push({ field: `objId`, title: "ObjectId", align: 'center', width: 50, formatter: rawFormatter, visible: false })

    var rows = []
    await Promise.all(items.map(async (i) => {
        const thisName = i.primaryQuantity.outputName ? i.primaryQuantity.outputName : name
        const quantity = i.primaryQuantity.quantity
        rows.push({ name: thisName, unit: unitOfMeasure, quantity: quantity, objId: i.objectId })
    }));

    $(`#TakeoffInventoryTable`).bootstrapTable('destroy');
    $(`#TakeoffInventoryTable`).bootstrapTable({
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

    $('#TakeoffInventoryTable').on('click-row.bs.table', async (e, row, $element, field) => {
        const ids = [row.objId]
        const color = $('#takeoffTable .selectedRow')

        //takeoff type has been selected, the model has been loaded, so call
        //highlightTakeoffItems directly
        highlightTakeoffItems(ids, color)
    })
} 

export async function loadModelAndHighlightItems(accProjectId,currentTypeId,takeoffColor){

    const items = currentTakeOffTypeItems.filter(i => i.takeoffTypeId == currentTypeId)
    const takeoffObjectIds = await Promise.all(items.map(async (i) => {
        return i.objectId;
    }));
    const modelUrn = await accModelUrn(accProjectId, encodeURIComponent(items[0].contentView.version))
    if (viewer && viewer.model && viewer.model.myData.urn == modelUrn) {
        highlightTakeoffItems(takeoffObjectIds, takeoffColor)
    } else {
        launchViewer(modelUrn, null, takeoffObjectIds, takeoffColor)
    }  
}

async function accTakeOffTypes(projectId, packageName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/takeOffTypes/${projectId}/${packageName}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function accTakeOffItems(projectId, packageName) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/takeOffItems/${projectId}/${packageName}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

async function accModelUrn(projectId, modelVersion) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/modelUrn/${projectId}/${modelVersion}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}


function getBidRowByTakeOffName(row_name, justIndex) {
    /// console.info('BootstrapTable.selectRowByItemId started', { row_itemid: row_itemid, data: this.options.data });
    var that = $('#BidLevelingTable');
    that = that.data()['bootstrap.table'].data
    return new Promise((resolve, reject) => {
        $.each(that, (d_i, d_val) => {

            if (d_val.tender.split(' ').join('') == row_name.split(' ').join('')) {
                resolve(d_i)
            }
        });
    })
}; 

async function getTakeOffViewAndItems(projectId,packageId,typeId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `/aps/takeoff/items/${projectId}/${packageId}/${typeId}`,
            success: function (res) {
                resolve(res)
            }
        });
    })
}

function rawFormatter(value, row, index) {
    var re = value
    return re
}
 
