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
USER_ACCOUNTS = SettingHelper.getSetting('accounts.users', SETTINGS)
ROLES = SettingHelper.getSetting('accounts.roles', SETTINGS)
SECRET_KEY = SettingHelper.getSetting('accounts.secret-key', SETTINGS)


def unsafellyDecode(token, audience=None):
    return jwt.decode(token, options={'verify_signature': False}, audience=audience)


def getJWKsUrl(issuer_url):
    well_known_url = issuer_url + '/.well-known/openid-configuration'
    with urllib.request.urlopen(well_known_url) as response:
        well_known = json.load(response)
    if not 'jwks_uri' in well_known:
        raise Exception('jwks_uri not found in OpenID configuration')
    return well_known['jwks_uri']


def decodeAndValidateJWK(token, audience=None):

    unvalidated = {}
    decoded = {}

    try:
        unvalidated = unsafellyDecode(token, audience=audience)
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

        key = JWKS_CLIENT[JWKS_CLIENT_KEY].get_signing_key(header['kid']).key
        decoded = jwt.decode(token, key=key, algorithms=[header['alg']], audience=audience)
        log.prettyJson(decodeAndValidateJWK, 'decoded', decoded, logLevel=log.DEBUG)

    except Exception as exception:
        log.error(decodeAndValidateJWK, 'not possible to get decoded token', exception=exception)
        log.prettyJson(decodeAndValidateJWK, 'Returning unvalidated token', unvalidated, logLevel=log.WARNING)
        return unvalidated

    return decoded


def createAuthentication(decoded):
    accountKey = decoded.get('email')
    responseBody = {
        'key': accountKey if accountKey in USER_ACCOUNTS else None,
        'name': decoded.get('name'),
        'firstName': decoded.get('given_name'),
        'lastName': decoded.get('family_name'),
        'email': accountKey,
        'pictureUrl': decoded.get('picture'),
        'status': 'ACTIVE'
    }
    header = {
        "alg": "HS256",
        "typ": "JWT"
    }
    payload = {
        "iat": 1636337725,
        "nbf": 1636337725,
        "jti": "414f7aca-6647-40e5-9229-8c16fe74cb52",
        "exp": 1899937725,
        "identity": accountKey,
        "fresh": False,
        "type": "access",
        "user_claims": {
            "context": ROLES.get(USER_ACCOUNTS.get(accountKey,'user'), []),
            "data": responseBody
        }
    }
    encoded_header = jwt.encode(header, "", "none")
    encoded_payload = jwt.encode(payload, "", "none")
    secret_key = SECRET_KEY
    return jwt.encode(payload, secret_key, algorithm="HS256", headers=header)

def buildHeaders(authenticationToken=None, thirdPartAuthenticationToken=None):
    return {
        'Authorization': None if ObjectHelper.isNone(authenticationToken) else f'Bearer {authenticationToken}',
        'Third-Part-Authorization':  None if ObjectHelper.isNone(thirdPartAuthenticationToken) else f'Bearer {thirdPartAuthenticationToken}',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Expose-Headers': '*',
        'Referrer-Policy': '*',
        'Access-Control-Allow-Methods': '*',
        'Access-Control-Allow-Credentials': 'true'
    }


app = Flask(__name__)
cors = CORS(
    app,
    resources={
        f'{API_BASE_URL}/*':{
            'origins': ALLOWED_ORIGINS
            # 'origins': '*'
        }
    },
    supports_credentials=True
)

@app.route(f'{API_BASE_URL}/auth', methods=['POST'])
def login():
    # encoded = request.get_json().get('token')
    encoded = dict(request.headers).get('Authorization', 'Bearer token').split()[-1]
    thirdPartAuthenticationToken = decodeAndValidateJWK(encoded, audience=GOOGLE_OAUTH_AUDIENCE)
    authenticationToken = createAuthentication(thirdPartAuthenticationToken)
    resp = Response(
        json.dumps({
            'status': 'SUCCESS'
        }),
        headers = buildHeaders(
            authenticationToken = authenticationToken, 
            thirdPartAuthenticationToken = thirdPartAuthenticationToken
        ),
        mimetype = 'application/json',
        status = 201
    )
    log.prettyJson(login, 'responseBody', unsafellyDecode(authenticationToken), logLevel=log.STATUS)
    return resp


@app.route(f'{API_BASE_URL}/auth', methods=['DELETE'])
def logout():
    resp = Response(
        json.dumps({
            'status': 'SUCCESS'
        }),
        headers = buildHeaders(),
        mimetype = 'application/json',
        status = 204
    )
    return resp


@app.route(f'{API_BASE_URL}/health', methods=['GET'])
def health():
    resp = Response(
        json.dumps({
            'status': 'SUCCESS'
        }),
        headers = buildHeaders(),
        mimetype = 'application/json',
        status = 200
    )
    return resp


if __name__ == '__main__':
    app.run(port=API_PORT, host='0.0.0.0')
