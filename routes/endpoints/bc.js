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
const bc_service = require('../services/bc');
const { authRefreshMiddleware } = require('../services/oauth');
const config = require('../../config');  

let router = express.Router(); 

//projects list and packages list
router.get('/bc/bcTree',authRefreshMiddleware, async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;
    const type = req.query.type

    try {
        switch(type){
            case '#': 
                //get project created by me
                const bcUserId = req.query.bcUserId 
                var allProjects = []
                allProjects = await bc_service.getProjects(allProjects,{},100,null)
                allProjects = allProjects.filter(i=>i.createdBy == bcUserId && i.state == 'PUBLISHED')
                var returnJson = []
                await Promise.all(allProjects.map(async (item) => {
                    const bcTreeId = `${item.id}`
                    const title = item.name == null ? '<No Title>' : item.name
            
                    returnJson.push(prepareItemForBCTree(
                        bcTreeId,
                        title,
                        'project',
                        true,
                        { }
                    ))
                  }));
                res.json(returnJson).end()
            break;
            case 'project':
                //get packages
                const projectId = req.query.id
                var allPackages = []
                allPackages = await  bc_service.getBidPackages(projectId)
                var returnJson = []
                await Promise.all(allPackages.map(async (item) => {
                    const bcTreeId = `${item.id}`
                    const title = item.name == null ? '<No Title>' : item.name
            
                    returnJson.push(prepareItemForBCTree(
                        bcTreeId,
                        title,
                        'bidpackage',
                        false,
                        {projectId:projectId,packageData:item }
                    ))
                  }));
                  res.json(returnJson).end()
            break; 
        }

    }
    catch (e) {
        console.error(`/bc/bcTree:${e.message}`)
        res.end();
    }
});

//get profile of logged user
router.get('/bc/userme', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;

        const userMe = await bc_service.getUserMe()
        res.json(userMe).end()

    }
    catch (e) {
        console.error(`/bc/userme:${e.message}`)
        res.end();
    }
});

router.get('/bc/user/:userId', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;
        const { userId } = req.params;

        const oneUser = await bc_service.getOneUser(userId)
        res.json(oneUser).end()

    }
    catch (e) {
        console.error(`/bc/user/:userId:${e.message}`)
        res.end();
    }
});

//get one invitee
router.get('/bc/invitee/:bidPackageId/:bidderCompanyId/:userId', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;
        const {bidPackageId,bidderCompanyId, userId } = req.params;

        const invitee = await bc_service.getOneInvitee(bidPackageId,bidderCompanyId,userId)
        res.json(invitee).end()

    }
    catch (e) {
        console.error(`/bc/invitee/:bidPackageId/:bidderCompanyId/:userId:${e.message}`)
        res.end();
    }
});


router.get('/bc/invitees/:bidPackageId', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;
        const {bidPackageId } = req.params;

        const invitee = await bc_service.getInvitees(bidPackageId)
        res.json(invitee).end()

    }
    catch (e) {
        console.error(`/bc/invitees/:bidPackageId:${e.message}`)
        res.end();
    }
});



router.get('/bc/projectForm/:projectId', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;
        const { projectId } = req.params;

        const projForm = await bc_service.getProjectBidForm(projectId)
        res.json(projForm).end()

    }
    catch (e) {
        console.error(`/bc/projectForm/:projectId:${e.message}`)
        res.end();
    }
});


router.get('/bc/projectInfo/:projectId', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;
        const { projectId } = req.params;

        const projInfo = await bc_service.getOneProject(projectId)
        res.json(projInfo).end()

    }
    catch (e) {
        console.error(`/bc/projectInfo/:projectId:${e.message}`)
        res.end();
    }
});


router.get('/bc/bidScopeSpecForm/:bidPackageId', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;
        const { bidPackageId } = req.params;

        const bidScopeSpecificForm = await bc_service.getPackageScopeSpecificForm(bidPackageId)
        res.json(bidScopeSpecificForm).end()

    }
    catch (e) {
        console.error(`/bc/bidScopeSpecForm/:bidPackageId:${e.message}`)
        res.end();
    }
});

router.get('/bc/bids/:bidPackageId', authRefreshMiddleware,async (req, res) => {
    try {
        config.credentials.token_3legged = req.internalOAuthToken.access_token;
        const { bidPackageId } = req.params;

        var allBids = []
        allBids = await bc_service.getBids(allBids,{bidPackageId:bidPackageId},100,null) 
        res.json(allBids).end()

    }
    catch (e) {
        console.error(`/bc/bids/:bidPackageId:${e.message}`)
        res.end();
    }
});
router.get('/bc/bidPackage/:bidPackageId', authRefreshMiddleware,async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;

    const { bidPackageId } = req.params;
    try {
        const bidPackage = await bc_service.getOneBidPackage(bidPackageId)
        res.json(bidPackage).end()
    }
    catch (e) {
        console.error(`/bc/bids/:packageId:${e.message}`)
        res.end();
    }
});


router.get('/bc/company/:companyId', authRefreshMiddleware,async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;

    const { companyId } = req.params;
    try {
        var c = await bc_service.getOneCompany(companyId) 
        res.json(c).end()
    }
    catch (e) {
        console.error(`/bc/bids/:packageId:${e.message}`)
        res.end();
    }
});


router.get('/bc/accdata/:bidPackageId', authRefreshMiddleware,async (req, res) => {
    config.credentials.token_3legged = req.internalOAuthToken.access_token;

    const { bidPackageId } = req.params;
    try {
        var c = await bc_service.getOneBidPackage(bidPackageId) 
        var r = {currentAccDocsFolderId:c.currentAccDocsFolderId,
                 currentAccLinkedProjectId}
        res.json().end()
    }
    catch (e) {
        console.error(`/bc/accdata/:bidPackageId:${e.message}`)
        res.end();
    }
});

function prepareItemForBCTree(_id, _text, _type, _children, _data) {
    return {
      id: _id,
      text: _text,
      type: _type,
      children: _children,
      data: _data
    }
  }

module.exports = router;
