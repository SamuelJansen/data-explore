from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import jwt, base64, json
import urllib.request

from python_helper import EnvironmentHelper, SettingHelper, ObjectHelper, log


EnvironmentHelper.update('DEBUG', True)
EnvironmentHelper.update('INFO', True)
EnvironmentHelper.update('WARNING', True)
EnvironmentHelper.update('STATUS', True)
EnvironmentHelper.update('ENABLE_LOGS_WITH_COLORS', True)
log.loadSettings()
SETTINGS = SettingHelper.getSettingTree('settings.yml')
API_BASE_URL = SettingHelper.getSetting('api.server.base-url', SETTINGS)
API_PORT = SettingHelper.getSetting('api.server.port', SETTINGS)
GOOGLE_OAUTH_AUDIENCE = [SettingHelper.getSetting('google.oauth.client.id', SETTINGS)]
ALLOWED_ORIGINS = SettingHelper.getSetting('allowed-origins' , SETTINGS)
JWKS_CLIENT_KEY = 'client'
JWKS_CLIENT = {
    JWKS_CLIENT_KEY: None
}

def getJWKsUrl(issuer_url):
    well_known_url = issuer_url + "/.well-known/openid-configuration"
    with urllib.request.urlopen(well_known_url) as response:
        well_known = json.load(response)
    if not 'jwks_uri' in well_known:
        raise Exception('jwks_uri not found in OpenID configuration')
    return well_known['jwks_uri']


def decodeAndValidateJWK(token, audience=None):

    unvalidated = {}
    decoded = {}
    
    try:
        unvalidated = jwt.decode(token, options={"verify_signature": False}, audience=audience)
        log.prettyJson(decodeAndValidateJWK, 'unvalidated', unvalidated, logLevel=log.DEBUG)

        if ObjectHelper.isNone(JWKS_CLIENT[JWKS_CLIENT_KEY]):
            jwks_uri = getJWKsUrl(unvalidated['iss'])
            log.prettyJson(decodeAndValidateJWK, 'jwks_uri', jwks_uri, logLevel=log.DEBUG)

            JWKS_CLIENT[JWKS_CLIENT_KEY] = jwt.PyJWKClient(jwks_uri)
            log.prettyJson(decodeAndValidateJWK, 'Created JWKS_CLIENT', JWKS_CLIENT[JWKS_CLIENT_KEY], logLevel=log.DEBUG)
        else:
            log.prettyJson(decodeAndValidateJWK, 'Reused JWKS_CLIENT', JWKS_CLIENT[JWKS_CLIENT_KEY], logLevel=log.DEBUG)
        
        header = jwt.get_unverified_header(token)
        log.prettyJson(decodeAndValidateJWK, 'header', header, logLevel=log.DEBUG)

        key = JWKS_CLIENT[JWKS_CLIENT_KEY].get_signing_key(header["kid"]).key
        decoded = jwt.decode(token, key=key, algorithms=[header["alg"]], audience=audience)
        log.prettyJson(decodeAndValidateJWK, 'decoded', decoded, logLevel=log.DEBUG)
        
    except Exception as exception:
        log.error(decodeAndValidateJWK, 'not possible to get decoded token', exception=exception)
        log.prettyJson(decodeAndValidateJWK, 'Returning unvalidated token', unvalidated, logLevel=log.WARNING)
        return unvalidated
    
    return decoded


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
