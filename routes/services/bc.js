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
 
const config = require('../../config');  
const { get} = require('./fetch_common');  

async function getUserMe() {
  try {
    let endpoint = config.endpoints.bc.get_user_me
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getUserMe..`)
    return response
      
  } catch (e) {
    console.error(`getUserMe failed: ${e}`)
    return {}
  }
}

async function getBidPackages(projectId) {
  try {
    let endpoint = config.endpoints.bc.get_bid_packages
    endpoint += `?filter[projectId]=${projectId}` 
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getBidPackages..`)
    if(response.results && response.results.length>0)
      return response.results
    else
      return {}
      
  } catch (e) {
    console.error(`getting one bid package failed: ${e}`)
    return {}
  }
}

async function getOneBidPackage(packageId) {
  try {
    let endpoint = config.endpoints.bc.get_bid_package.format(packageId)
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getting one bid package..`)
    return response
      
  } catch (e) {
    console.error(`getting one bid package failed: ${e}`)
    return {}
  }
}

async function getOneCompany(companyId) {
  try {
    let endpoint = config.endpoints.bc.get_contacts
    //apply with filters
    endpoint += `?filter[companyId]=${companyId}`
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getOneCompany..`)
    return response
      
  } catch (e) {
    console.error(`getOneCompany failed: ${e}`)
    return {}
  }
}


async function getOneUser(userId) {
  try {
    let endpoint = config.endpoints.bc.get_user.format(userId)
   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getOneUser..`)
    return response
      
  } catch (e) {
    console.error(`getOneUser failed: ${e}`)
    return {}
  }
}


async function getOneInvitee(bidPackageId,bidderCompanyId,userId) {
  try {
    let endpoint = config.endpoints.bc.get_invites
    endpoint += `?filter[bidPackageId]=${bidPackageId}&filter[bidderCompanyId]=${bidderCompanyId}` 

    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)


    console.log(`getOneInvitee..`)
    return response.results[0].invitees.find(i=>i.userId == userId)
      
  } catch (e) {
    console.error(`getOneInvitee failed: ${e}`)
    return {}
  }
}


async function getInvitees(bidPackageId) {
  try {
    let endpoint = config.endpoints.bc.get_invites
    endpoint += `?filter[bidPackageId]=${bidPackageId}` 

    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)


    console.log(`getInvitees..`)
    return response.results
      
  } catch (e) {
    console.error(`getInvitees failed: ${e}`)
    return {}
  }
}

async function getPackageScopeSpecificForm(bidPackageId) {
  try {
    let endpoint = config.endpoints.bc.get_scope_specific_bid_forms
    endpoint += `?filter[bidPackageId]=${bidPackageId}`
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getPackageScopeSpecificForm..`)
    if(response.results && response.results.length>0)
      return response.results[0]
    else
      return {}      
  } catch (e) {
    console.error(`getPackageScopeSpecificForm failed: ${e}`)
    return {}
  }
}

async function getProjectBidForm(projectId) {
  try {
    let endpoint = config.endpoints.bc.get_project_bid_forms
    endpoint += `?filter[projectId]=${projectId}`
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getProjectBidForm..`)
    if(response.results && response.results.length>0)
      return response.results[0]
    else
      return {}
      
  } catch (e) {
    console.error(`getProjectBidForm failed: ${e}`)
    return {}
  }
}

async function getBids(allBids,filters,limit,cursorState) {
  try {
    let endpoint = cursorState?
                    config.endpoints.bc.get_bids + `?cursorState=${cursorState}&limit=${limit}`:
                    config.endpoints.bc.get_bids + `?limit=${limit}`
     //apply with filters
    Object.keys(filters).forEach(e => {
      endpoint += `&filter[${e}]=${filters[e]}`
    });
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getBids..`)
      allBids = allBids.concat(response.results);
      if (response.pagination.cursorState) {
         return getBids(allBids, filters,limit,response.pagination.cursorState);
      }
      else {
        return allBids
      }
    } else {
      return allBids
    }
  } catch (e) {
    console.error(`getBids failed: ${e}`)
    return {}
  }
}


async function getProjects(allProjects,filters,limit,cursorState) {
  try {
    let endpoint = cursorState?
                    config.endpoints.bc.get_projects + `?cursorState=${cursorState}&limit=${limit}`:
                    config.endpoints.bc.get_projects + `?limit=${limit}`
     //apply with filters
    Object.keys(filters).forEach(e => {
      endpoint += `&filter[${e}]=${filters[e]}`
    });
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getProjects..`)
      allProjects = allProjects.concat(response.results);
      if (response.pagination.cursorState) {
         return getProjects(allProjects, filters,limit,response.pagination.cursorState);
      }
      else {
        return allProjects
      }
    } else {
      return allProjects
    }
  } catch (e) {
    console.error(`getProjects failed: ${e}`)
    return {}
  }
}


async function getOneProject(projectId) {
  try {
    let endpoint = config.endpoints.bc.get_project.format(projectId)
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getOneProject..`)
    return response
      
  } catch (e) {
    console.error(`getOneProject failed: ${e}`)
    return {}
  }
}
 
module.exports = {
  getBids,
  getProjectBidForm,
  getPackageScopeSpecificForm,
  getOneBidPackage,
  getBidPackages,
  getUserMe,
  getProjects,
  getOneProject,
  getOneCompany,
  getOneUser,
  getOneInvitee,
  getInvitees
} 


