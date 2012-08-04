#!/usr/bin/python

"""
This script is used to reveive the test result.
It will display the result in the table format on a web page,
and is able to save the result data as json format to a file
under the /tmp/methanol directory.

HOW TO USE:
    1. copy this script to the cgi-bin directory of your web server
       on my ubuntu, will do like this:
        cp save_methanol_data.py /usr/lib/cgi-bin/
    2. make this script executable
        chmod +x /usr/lib/cgi-bin/save_methanol_data.py
    3. add the url of this script to the test url, like:
        http://localhost/methanol/fire.html?reportToUrl=http://localhost/cgi-bin/save_methanol_data.py

       if want to save the result to a file, we can do like:
        http://localhost/methanol/fire.html?reportToUrl=http://localhost/cgi-bin/save_methanol_data.py%3Fsave2file=res.json
       then when the test finished, there will be a file /tmp/methanol/res.json generated.

"""
import cgitb
import cgi
import os

import simplejson as json

cgitb.enable()

print "Content-Type: text/html;"
print

print '''<html>
       <head>
       <Script language="JavaScript">
       </Script>
       </head>
       <body>
'''

FLAG_SAVE_TO_FILE = 'save2file'
SAVE_DIR = '/tmp/methanol'
f = cgi.FieldStorage()
save_file = f.getvalue(FLAG_SAVE_TO_FILE)
test_results = []
print '''
    <div align="center">
    <table border="1" style="border:solid;background:#CFCFCF;">
    <tr>
         <th>test_case_id<th/>
         <th>average(ms)<th/>
         <th>deviate average(%)<th/>
    <tr/>'''

for key in f:
    if key == FLAG_SAVE_TO_FILE:
        continue
    key = key.strip()
    values = f.getvalue(key).split(',')
    average = values[0].strip()
    average_deviate = float(values[1].strip()) * 100
    print '<tr>'
    print '<td align="left">%s<td/>' % key
    print '<td align="right">%s<td/>' % average
    print '<td align="right">%s<td/>' % average_deviate
    print '</tr>'
    if save_file:
        result = {'test_case_id': key,
                  'average': average,
                  'average_deviate': average_deviate
                 }
        test_results.append(result)

print '</table></div></body></html>'

if save_file and test_results:
    if not os.path.exists(SAVE_DIR):
        os.makedirs(SAVE_DIR)
        os.chmod(SAVE_DIR, 0777)
    with open(os.path.join(SAVE_DIR, save_file), 'w') as fd:
        indent = ' ' * 2
        separators = (', ', ': ')
        json.dump(test_results, fd,
                   use_decimal=True,
                   indent=indent,
                   separators=separators,
                   sort_keys=False)
    os.chmod(os.path.join(SAVE_DIR, save_file), 0777)
