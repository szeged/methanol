#!/bin/bash

SERIAL=${1-""}
ADB_OPTION=""
if [ -n "${SERIAL}" ]; then
    ADB_OPTION="-s ${SERIAL}"
fi

methanol_git="git://gitorious.org/methanol/methanol.git"
methanol_url="http://192.168.1.127/images/methanol"
report_url="http://192.168.1.127/cgi-bin/save_methanol_data.py"

function check_url(){
    if [ -n "${report_url}" ]; then
        wget -q "${report_url}" -O /dev/null
        if [ $? -ne 0 ]; then
            echo "The report url(${report_url}) cannot be accessed"
            echo "Please put the save_methanol_data.py to the cgi-bin directory"
            echo "of your web server, and make sure it is accessible."
            exit 1
        fi
    fi

    if [ -n "${methanol_url}" ]; then
        wget -q "${methanol_url}" -O /dev/null
        if [ $? -ne 0 ]; then
            echo "The url(${methanol_url}) cannot be accessed"
            echo "Please clone the methanol directory to local via following command"
            echo "    git clone ${methanol_git}"
            echo "and copy the entire directory to some place of your web server"
            echo "and make sure it is accessible."
            exit 1
        fi
    else
        echo "Please speecify the methanol url that will be used for test."
        exit 1
    fi
}

function wait_result(){
    if [ -n "$1" ]; then
        file_path="$1"
    else
        return 0
    fi
    wait_minutes=${2-1}

    for (( i=1; i<=${wait_minutes}; i++ )); do
        sleep 60
        if [ -f "${file_path}" ]; then
            return 0
        fi
    done
    return 1
}

function test_methanol(){
    if [ -n "$1" ]; then
        test_type="-${1}"
    else
        test_type=""
    fi

    wait_minutes=${2-1}

    mkdir -p /tmp/methanol/
    sudo chmod -R 777 /tmp/methanol
    result_file=`mktemp -u --tmpdir=/tmp/methanol res${test_type}-XXX.json`
    res_basename=`basename ${result_file}`
    test_url="${methanol_url}/fire${test_type}.html"
    if [ -n "${report_url}" ]; then
        test_url="${test_url}?reportToUrl=${report_url}%3Fsave2file=${res_basename}"
    fi

    echo "adb ${ADB_OPTION} shell am start -a android.intent.action.VIEW -d ${test_url}"
    adb ${ADB_OPTION} shell "am start -a android.intent.action.VIEW -d ${test_url}"
    wait_result "${result_file}" ${wait_minutes}
    if [ $? -eq 0 ]; then
        cp  ${result_file} ./
        echo "result_file=./${res_basename}"
        rm -f ${result_file}
    else
        echo "Failed to get the test result of fire${test_type}.html"
        exit 1
    fi
}

function main(){
    check_url
    test_methanol "" 1
    test_methanol "svg" 5
    test_methanol "smp" 20
    exit 0
}
main "$@"
