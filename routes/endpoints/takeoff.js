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

const express = require('express');
const takeoff_service = require('../services/takeoff');
const { authRefreshMiddleware } = require('../services/oauth');
const config = require('../../config');  

var bodyParser = require('body-parser');
let router = express.Router(); 


router.get('/takeoff/tree',authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const type = req.query.type

    try {
        switch(type){
            case '#':  

                var allPackages = []
                allPackages = await takeoff_service.getPackages(allPackages,req.query.projectId,100,null)
                var returnJson = []
                await Promise.all(allPackages.map(async (p) => {
                    const packageId = `${p.id}`
                    const title = p.name == null ? '<No Title>' : p.name
            
                    returnJson.push(prepareItemForTakeoffTree(
                        packageId,
                        title,
                        'package',
                        true,
                        {projectId:req.query.projectId }
                    ))
                  }));
                  res.json(returnJson).end()
            break;
            case 'package':
               var allTypes = await takeoff_service.getTypes(req.query.data.projectId,req.query.id)
                var returnJson = []
                await Promise.all(allTypes.map(async (t) => {
                    const typeId = `${t.id}`
                    const title = t.name == null ? '<No Title>' : t.name
            
                    returnJson.push(prepareItemForTakeoffTree(
                        typeId,
                        title,
                        'type',
                        false,
                        {projectId:req.query.data.projectId,
                            packageId:req.query.id,
                            typeData:{name:t.name,color:t.color,unitOfMeasure:t.unitOfMeasure} }
                    ))
                  }));
                res.json(returnJson).end()
            break; 
        }

    }
    catch (e) {
        console.error(`/bc/bids:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/takeOffTypes/:projectId/:packageName',authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const {projectId, packageName } = req.params;
    try {
        var allPackages = []
        allPackages = await takeoff_service.getPackages(allPackages,projectId,100,null)
        if(allPackages){
            const onePackage = allPackages.find(i=>i.name ==packageName)
            const takeOffTypes = await takeoff_service.getTypes(projectId,onePackage.id)
            res.json({packageId:onePackage.id,takeOffTypes:takeOffTypes}).end()
        }else{
            console.error(`/takeoff/takeOffTypes/:packageName:${e.message}`)
            res.end();
        }
    }
    catch (e) {
        console.error(`/takeoff/takeOffTypes/:packageName:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/takeOffItems/:projectId/:packageId',authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const {projectId, packageId } = req.params;
    try {
         
            var allItems = []
            allItems = await takeoff_service.getItems(allItems,projectId,packageId,100,0) 
            res.json(allItems).end()
        
    }
    catch (e) {
        console.error(`/takeoff/takeOffTypes/:packageName:${e.message}`)
        res.end();
    }
});
 
router.get('/takeoff/type/:projectId/:packageId',authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const {projectId, packageId } = req.params;
    try {
        var c = await takeoff_service.getTypes(projectId,packageId) 
        res.json(c).end()
    }
    catch (e) {
        console.error(`/takeoff/onePackage/:packageName:${e.message}`)
        res.end();
    }
});

router.get('/takeoff/items/:projectId/:packageId/:typeId',authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const {projectId, packageId,typeId } = req.params;
    try {
        var allItems = []
        allItems = await takeoff_service.getItems(allItems,projectId,packageId,100,0) 
        allItems = allItems.filter(i=>i.takeoffTypeId == typeId)
        var modelVersion = allItems[0].contentView.version
        modelVersion = encodeURIComponent(modelVersion)
        var modelUrn = await takeoff_service.getModelUrn(projectId,modelVersion)

        res.json({items:allItems,modelUrn:modelUrn}).end()
    }
    catch (e) {
        console.error(`/takeoff/items/:projectId/:packageId/:typeId:${e.message}`)
        res.end();
    }
});


router.get('/takeoff/modelUrn/:projectId/:modelVersion',authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    var {projectId,modelVersion } = req.params;
    try {
        
        modelVersion = encodeURIComponent(modelVersion)
        var modelUrn = await takeoff_service.getModelUrn(projectId,modelVersion)

        res.json(modelUrn).end()
    }
    catch (e) {
        console.error(`/takeoff/modelUrn/:modelVersion:${e.message}`)
        res.end();
    }
});
 
 


function prepareItemForTakeoffTree(_id, _text, _type, _children, _data) {
    return {
      id: _id,
      text: _text,
      type: _type,
      children: _children,
      data: _data
    }
  }
module.exports = router;
