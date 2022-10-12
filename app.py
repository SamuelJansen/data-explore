from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import jwt, base64, json
import urllib.request

from python_helper import SettingHelper, log


SETTINGS = SettingHelper.getSettingTree('settings.yml')
API_BASE_URL = SettingHelper.getSetting('api.server.base-url', SETTINGS)
API_PORT = SettingHelper.getSetting('api.server.port', SETTINGS)
GOOGLE_OAUTH_AUDIENCE = [SettingHelper.getSetting('google.oauth.client.id', SETTINGS)]
ALLOWED_ORIGINS = SettingHelper.getSetting('allowed-origins' , SETTINGS)


def getJWKsUrl(issuer_url):
    well_known_url = issuer_url + "/.well-known/openid-configuration"
    with urllib.request.urlopen(well_known_url) as response:
        well_known = json.load(response)
    if not 'jwks_uri' in well_known:
        raise Exception('jwks_uri not found in OpenID configuration')
    return well_known['jwks_uri']


def decodeAndValidateJWK(token, audience=None):
    unvalidated = jwt.decode(token, options={"verify_signature": False}, audience=audience)
    log.prettyJson(decodeAndValidateJWK, 'unvalidated', unvalidated, logLevel=log.DEBUG)

    jwks_uri = getJWKsUrl(unvalidated['iss'])
    log.prettyJson(decodeAndValidateJWK, 'jwks_uri', jwks_uri, logLevel=log.DEBUG)
    
    jwks_client = jwt.PyJWKClient(jwks_uri)
    log.prettyJson(decodeAndValidateJWK, 'jwks_client', jwks_client, logLevel=log.DEBUG)
    
    header = jwt.get_unverified_header(token)
    key = jwks_client.get_signing_key(header["kid"]).key
    redecodedDoken = turn jwt.decode(token, key=key, algorithms=[header["alg"]], audience=audience)
    log.prettyJson(decodeAndValidateJWK, 'redecodedDoken', redecodedDoken, logLevel=log.DEBUG)
    return redecodedDoken


app = Flask(__name__)
cors = CORS(
    app,
    resources={
        f'{API_BASE_URL}/*':{
            'origins': '*'
        }
    },
    supports_credentials=True
)


@app.route(f'{API_BASE_URL}/auth', methods=['POST'])
def login():
    encoded = request.get_json().get('token')
    decoded = decodeAndValidateJWK(encoded, audience=GOOGLE_OAUTH_AUDIENCE)
    resp = Response(
        json.dumps({
            'name': decoded.get('name'),
            'firstName': decoded.get('given_name'),
            'lastName': decoded.get('family_name'),
            'email': decoded.get('email'),
            'picture': decoded.get('picture'),
            'status': 'SUCCESS'
        }),
        headers={
            'Authorization': f'Bearer {encoded}', 
            'my-header': 'some-value', 
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Expose-Headers': '*',
            'Referrer-Policy': '*',
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Credentials": "true"
        },  
        mimetype='application/json', 
        status=201
    )
    return resp


@app.route(f'{API_BASE_URL}/auth', methods=['DELETE'])
def logout():
    resp = Response(
        json.dumps({
            'status': 'SUCCESS'
        }),
        headers={
            'Authorization': None, 
            'Access-Control-Allow-Origin': '*'
        },  
        mimetype='application/json',
        status=204
    )
    return resp


@app.route(f'{API_BASE_URL}/health', methods=['GET'])
def health():
    resp = Response(
        json.dumps({
            'status': 'SUCCESS'
        }),
        headers={
            'Authorization': None, 
            'my-header': 'some-value', 
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Expose-Headers': '*',
            'Referrer-Policy': '*',
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Credentials": "true"
        },  
        mimetype='application/json', 
        status=200
    )
    return resp


if __name__ == '__main__':
    app.run(port=API_PORT, host='0.0.0.0')
