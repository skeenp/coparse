import requests
import json
#Open tests config file
with open("tests.json",'r') as json_raw:
    test_config =  json.load(json_raw)
#Update progress
print('Running Tests:')
result = test_config['result']
#Process all tests
for test in test_config['tests']:
    #Update progress
    print('- {test}'.format(test=test['name']))
    #Run test
    res = requests.get('https://us-central1-se-geocoord.cloudfunctions.net/coparse-test?q={test}&d=true&t=simple'.format(test=test['query'])).json()
    if not res['success']:
        print (' > Failed')
        if res['method'] == test['method']:
            print (' - Incorrect Method {returned} (should be {expected})'.format(returned=res['method'],expected=test['method']))
        if hasattr(res,'result') and not round(res['result']['x'],5) == round(result['x'],5):
            print (' - Incorrect X {returned} (should be {expected})'.format(returned=res['result']['x'],expected=result['x']))
        if hasattr(res,'result') and not round(res['result']['y'],5) == round(result['y'],5):
            print (' - Incorrect Y {returned} (should be {expected})'.format(returned=res['result']['y'],expected=result['y']))
        print (' *** ERROR')
        print (' *** {query}'.format(query=res['query']['string']))
        print (' *** {error}'.format(error=res['error']))
        print (' *** END ERROR')
    else:
        print (' > Success')