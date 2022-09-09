from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt, base64, json

from python_helper import FileHelper, StringHelper, Constant, EnvironmentHelper, SettingHelper


# ASC_II_ENCODING = 'ascii'
# KEY = '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'
# KEY_IN_BYTES = KEY.encode(ASC_II_ENCODING)
# KEY_IN_BASE_64_BYTES = base64.b64encode(KEY_IN_BYTES)
# KEY_IN_BASE_64 = KEY_IN_BASE_64_BYTES.decode(ASC_II_ENCODING)
# print(KEY_IN_BASE_64)

SETTINGS = SettingHelper.getSettingTree('settings.yml')
GOOGLE_OAUTH_FILE_NAME = SETTINGS.get('google-ouuth-settings-file-name')
GOOGLE_OAUTH_PEM = StringHelper.join(
    FileHelper.getFileLines(f'{Constant.DOT}{EnvironmentHelper.OS_SEPARATOR}{GOOGLE_OAUTH_FILE_NAME}.pem'), 
    character = Constant.BLANK
)
GOOGLE_OAUTH_JSON = json.loads(
    StringHelper.join(
        FileHelper.getFileLines(f'{Constant.DOT}{EnvironmentHelper.OS_SEPARATOR}{GOOGLE_OAUTH_FILE_NAME}.json'), 
        character = Constant.BLANK
    )
)

app = Flask(__name__)
cors = CORS(app, resource={
    r'/*':{
        'origins': SETTINGS.get('allowed-origins')
    }
})

@app.route('/auth', methods=['POST'])
def login():
    decoded = jwt.decode(
        f'''{request.get_json().get('token')}''', 
        key = GOOGLE_OAUTH_PEM,
        algorithms = SETTINGS.get('google-oauth-algorithms'),
        audience = [GOOGLE_OAUTH_JSON.get('web').get('client_id')]
    )
    return jsonify({
        'name': decoded.get('name'),
        'firstName': decoded.get('given_name'),
        'lastName': decoded.get('family_name'),
        'email': decoded.get('email'),
        'picture': decoded.get('picture'),
        'status': 'SUCCESS'
    }), 201

@app.route('/auth', methods=['DELETE'])
def logout():
    decoded = jwt.decode(
        f'''{request.get_json().get('token')}''', 
        key = GOOGLE_OAUTH_PEM,
        algorithms = SETTINGS.get('google-oauth-algorithms'),
        audience = [GOOGLE_OAUTH_JSON.get('web').get('client_id')]
    )
    return jsonify({
        'name': decoded.get('name'),
        'firstName': decoded.get('given_name'),
        'lastName': decoded.get('family_name'),
        'email': decoded.get('email'),
        'picture': decoded.get('picture'),
        'status': 'SUCCESS'
    }), 204

if __name__ == '__main__':
    app.run(port=7889)
