import express = require("express");
import * as _ from "lodash";
import request = require("request");
import * as DB from "./dbconnection";
import jwt = require("jsonwebtoken");
import { User } from "./user";

type Req = Express.Request & express.Request;
type Res = Express.Response & express.Response;

declare const Promise: any;

//const storageRewardIds = ["1322253", "1937132"];
//const epicRewardIds = ["1937132"];

const baseUrl = process.env.BASE_URL,
    googleClientId = process.env.GOOGLE_CLIENT_ID,
    googleClientSecret = process.env.GOOGLE_CLIENT_SECRET,
    googleUrl = process.env.GOOGLE_URL;
    



const config = { googleClientId, googleClientSecret };
//var google = require("google-oauth2")(config);
const { google } = require('googleapis');
const oauth2Client = new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    baseUrl + "/r/google-oauth2"
);
//var profile = google.userinfo;


google.options({ auth: oauth2Client });
const scopes = ["https://www.googleapis.com/auth/profile"];


interface ApiResponse {
    data: {
        sub: string;
    };
}

interface TokensResponse {
    email: string;
    iat: string;
    exp: string;
    scope: string;
    token_type: string;
}

function handleCurrentUser(req: Req, res: Res, tokens) {
           const encounterId = req.query.state.replace(/['"]/g, "");

        const standing = "epic";

        req.session.hasStorage = true;
        req.session.hasEpicInitiative = true;
        req.session.isLoggedInGoogle = true;
        req.session.isLoggedIn = true;

        var decoded = jwt.decode(tokens.id_token, { json: true, complete: true });
    DB.upsertUser("", tokens.access_token, decoded.payload.iat, standing, decoded.payload.sub)
            .then(user => {
                req.session.userId = user._id;
                res.redirect(`/e/${encounterId}`);
            }).catch(err => {
                console.error(err);
            });
}

function getOauth(code): Promise<any> {
    
    return new Promise(function (resolve, reject) { oauth2Client.getToken(code); });
   
}

async function aGetOauth(code): Promise<any> {
    getOauth(code).then(function (value) { return value; }).catch(function (err) { return ""; });
}

export function configureGoogleLoginRedirect(app: express.Application) {
    const redirectPath = "/r/google-oauth2";
    const redirectUri = baseUrl + redirectPath;

    app.get(redirectPath, async (req: Req, res: Res):Promise<any> => {
        //try {
            const code = req.query.code;
            await oauth2Client.getToken(code, async function(err, tokens):Promise<any> {
                if (err) {
                    console.log(err);
                    res.end(err);
                    return {};
                }
                else {
                    oauth2Client.setCredentials(tokens);
                    await handleCurrentUser(req, res, tokens);
                    return {};
                }
            });
        return {};
    });
}

export function configureGoogleLogout(app: express.Application) {
    const logoutPath = "/glogout";
    app.get(logoutPath, (req: Req, res: Res) => {
        req.session.destroy(err => {
            if (err) {
                console.error(err);
            }
            return res.redirect(baseUrl);
        });
    });
}


