

let { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL, SERVER_SESSION_SECRET, PORT } = process.env;
if (!APS_CLIENT_ID || !APS_CLIENT_SECRET || !APS_CALLBACK_URL || !SERVER_SESSION_SECRET) {
    console.warn('Missing some of the environment variables.');
    process.exit(1);
}
const INTERNAL_TOKEN_SCOPES = ['data:read','data:write','account:read'];
const PUBLIC_TOKEN_SCOPES = ['viewables:read'];
PORT = PORT || 3000;

const APS_BASE_URL = 'https://developer.api.autodesk.com';

//3-legged token for building connected and takeoff api
var credentials = {
    token_3legged:''
}

const endpoints = {
    
    bc:{
        get_projects:`${APS_BASE_URL}/construction/buildingconnected/v2/projects`,
        get_project:`${APS_BASE_URL}/construction/buildingconnected/v2/projects/{0}`,
        get_project_cost:`${APS_BASE_URL}/construction/buildingconnected/v2/projects/{0}/costs`,
        get_bid_packages:`${APS_BASE_URL}/construction/buildingconnected/v2/bid-packages`,
        get_bid_packages:`${APS_BASE_URL}/construction/buildingconnected/v2/bid-packages`,
        get_bid_package:`${APS_BASE_URL}/construction/buildingconnected/v2/bid-packages/{0}`,
        get_invites:`${APS_BASE_URL}/construction/buildingconnected/v2/invites`,
        get_invite:`${APS_BASE_URL}/construction/buildingconnected/v2/invites/{0}`,
        get_bids:`${APS_BASE_URL}/construction/buildingconnected/v2/bids`,
        get_bid:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}`,
        get_bid_attachment:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}/attachments/{1}`,
        get_bid_line_items:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}/line-items`,
        get_bid_plugs:`${APS_BASE_URL}/construction/buildingconnected/v2/bids/{0}/plugs`,
        get_project_bid_forms:`${APS_BASE_URL}/construction/buildingconnected/v2/project-bid-forms`,
        get_project_bid_form:`${APS_BASE_URL}/construction/buildingconnected/v2/project-bid-forms/{0}`,
        get_project_bid_form_line_items:`${APS_BASE_URL}/construction/buildingconnected/v2/project-bid-forms/{0}/line-items`,
        get_scope_specific_bid_forms:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms`,
        get_scope_specific_bid_form:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms/{0}`,
        get_scope_specific_bid_form_line_items:`${APS_BASE_URL}/construction/buildingconnected/v2/scope-specific-bid-forms/{0}/line-items`,
        get_opportunities:`${APS_BASE_URL}/construction/buildingconnected/v2/opportunities`,
        get_opportunitie:`${APS_BASE_URL}/construction/buildingconnected/v2/opportunities/{0}`,
        get_contacts:`${APS_BASE_URL}/construction/buildingconnected/v2/contacts`,
        get_contact:`${APS_BASE_URL}/construction/buildingconnected/v2/contacts/{0}`,
        get_users:`${APS_BASE_URL}/construction/buildingconnected/v2/users`,
        get_user:`${APS_BASE_URL}/construction/buildingconnected/v2/users/{0}`,
        get_user_me:`${APS_BASE_URL}/construction/buildingconnected/v2/users/me`,
    },
    takeoff:{
        get_packages:      `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages`,
        get_package:       `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages/{1}`,
        get_takeoff_items: `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages/{1}/takeoff-items`,
        get_takeoff_types: `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/packages/{1}/takeoff-types`,
        get_takeoff_content_views:  `${APS_BASE_URL}/construction/takeoff/v1/projects/{0}/content-views`,
    },
    dm:{
        get_version_urn: `${APS_BASE_URL}/data/v1/projects/b.{0}/versions/{1}`
    }, 
    httpHeaders: function (access_token) {
        return {
          Authorization: 'Bearer ' + access_token
        }
    }  
  }
  

module.exports = {
    APS_CLIENT_ID,
    APS_CLIENT_SECRET,
    APS_CALLBACK_URL,
    SERVER_SESSION_SECRET,
    INTERNAL_TOKEN_SCOPES,
    PUBLIC_TOKEN_SCOPES,
    PORT,
    endpoints,
    credentials 
};
  