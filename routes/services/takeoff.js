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
const { get } = require('./fetch_common');  

async function getPackages(allPackages, projectId,limit,offset) {
  try {
    let endpoint = offset?config.endpoints.takeoff.get_packages.format(projectId)+`?limit=${limit}&offset=${offset}`:
                   config.endpoints.takeoff.get_packages.format(projectId)+`?limit=${limit}`
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getPackages of project ${projectId}`)
      allPackages = allPackages.concat(response.results);
      if (response.pagination.totalResults>allPackages.length) {
        offset += 100
        return getPackages(projectId,allSheets,offset);
      }
      else {
        return allPackages
      }
    } else {
      return allPackages
    }
  } catch (e) {
    console.error(`getPackages of  ${projectId} failed: ${e}`)
    return {}
  }
}

async function getTypes(projectId,packageId) {
  try {
    let endpoint = config.endpoints.takeoff.get_takeoff_types.format(projectId,packageId)
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getTypes..`)
    return response.results
      
  } catch (e) {
    console.error(`getTypes failed: ${e}`)
    return {}
  }
}


async function getItems(allItems, projectId,packageId,limit,nextUrl) {
  try {
    let endpoint = nextUrl?`${nextUrl}`:
                   config.endpoints.takeoff.get_takeoff_items.format(projectId,packageId)+`?limit=${limit}`
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getItems of package ${packageId}`)
      allItems = allItems.concat(response.results);
      if (response.pagination.nextUrl) {
         return getItems(allItems, projectId,packageId,limit,response.pagination.nextUrl);
      }
      else {
        return allItems
      }
    } else {
      return allItems
    }
  } catch (e) {
    console.error(`getItems of package ${packageId} failed: ${e}`)
    return {}
  }
}


async function getModelUrn(projectId,modelVersion) {
  try {
    let endpoint = config.endpoints.dm.get_version_urn.format(projectId,modelVersion)
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    console.log(`getModelUrn..`)
    return response.data.relationships.derivatives.data.id
      
  } catch (e) {
    console.error(`getModelUrn failed: ${e}`)
    return {}
  }
}

 
 
module.exports = {
  getPackages,
  getTypes,
  getItems,
  getModelUrn
} 


