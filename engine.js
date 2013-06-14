/*
 * Copyright (C) 2009-2013 University of Szeged
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY UNIVERSITY OF SZEGED ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL UNIVERSITY OF SZEGED OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/// class MethanolParameter
///   used to store global settings
function MethanolParameter() {
    // debug method
    // add breakpoint here to debug private variables
    this.debug = function () {
        return;
    }
    // public variables
    this.id = "Methanol Benchmark (version: 5%)";
    this.skipped = 2;
    this.iter = 10;
    this.iter_with_skipped = this.skipped + this.iter;
    this.syncStart = false;
    this.reportToUrl = "";

    // private variables
    // alias for this
    var _this = this;

    // public methods
    this.setByUrl = function (url) {
        url.replace(/[?&]+([^=&]+)=([^&]*)/gi,
            function (m, key, value) {
                _this[key] = value;
            });
        this.ensureParams();
    };
    this.ensureParams = function () {
        this.skipped = parseInt(this.skipped);
        this.skipped += this.skipped % 2;
        this.iter = parseInt(this.iter);
        this.iter = Math.max(this.iter, 1);
        this.iter_with_skipped = this.skipped + this.iter;
        this.syncStart = this.syncStart == "true" || this.syncStart == "1" ? true : false;
    };

    // construct
}

// TODO:
// we might need a class to holds the engine
// param should be its member variable
var param;


var methanol_i = 0;
var methanol_j = 0;
var methanol_n = methanol_tests.length;
var methanol_results = new Array(methanol_n);

function die(msg)
{
    window.alert("FATAL ERROR: " + msg);
    window.close();
    return false;
}

function methanol_show_results()
{
    var frame = document.getElementById("frame");
    frame.src = "";

    var i, j, k;
    var s = 0;
    var sub_avarages = new Array(methanol_n);
    var first_nonskipped_index = param.skipped / 2;
    var last_nonskipped_index = param.iter_with_skipped - 1 - (param.skipped / 2);

    for (i = 0; i < methanol_n; ++i) {
        // Order the current line of results.
        methanol_results[i].sort();

        // Compute avarage.
        var avg = 0;
        for (j = first_nonskipped_index; j <= last_nonskipped_index; ++j)
            avg += methanol_results[i][j];
        avg = avg / param.iter;
        sub_avarages[i] = avg;
        s += avg;
    }

    var txt = "<html><body><pre>" + param.id + "\n<br />\n<br />";
    var results = "";
    var avg_dev = 0;
    for (i = 0; i < methanol_n; ++i) {
        var avg = sub_avarages[i];
        var sub_dev_sum = 0;

        for (j = first_nonskipped_index; j <= last_nonskipped_index; ++j) {
            var x = methanol_results[i][j] - avg;
            sub_dev_sum += x * x;
        }

        var dev = Math.sqrt(sub_dev_sum / param.iter) / avg;
        avg_dev += dev;

        txt += methanol_tests[i] + ": " + avg.toFixed(2) + " (" + (100 * dev).toFixed(2) + "%)\n<br />";
        results += "&" + methanol_tests[i] + "=" + avg.toFixed(2) + "," + dev.toFixed(4);
    }
    avg_dev /= methanol_n;

    txt += "Summary: " + s.toFixed(2) + " (" + (100 * avg_dev).toFixed(2) + "%)\n<br />"
    txt += "</pre></body></html>";
    results += "&summary=" + s.toFixed(2) + "," + avg_dev.toFixed(4);
    document.write(txt);

    //actually the best way is using post instead of get
    var urlReport = param.reportToUrl;
    if (urlReport){
      urlReport = urlReport.replace("%3F",'?');
      if (urlReport.indexOf('?') != -1){
            window.location = urlReport + results;
      }else{
            window.location = urlReport + '?' + results;
      }
    }
}

if (window.addEventListener)
    window.addEventListener("message", methanol_frame_message, false);
else
    window.attachEvent("message", methanol_frame_message);

function methanol_frame_message(event)
{
    var message = JSON.parse(event.data);

    methanol_builtin_next_timeout(message.start, message.end);
}

function methanol_next_iter()
{
    if (methanol_j == 0)
        methanol_results[methanol_i] = new Array(param.iter_with_skipped);

    var frame = document.getElementById("frame");
    frame.src = "";
    frame.src = methanol_tests[methanol_i];
}

function methanol_builtin_next_timeout(start, end)
{
    var rst = end - start;
    methanol_results[methanol_i][methanol_j] = rst;
    ++methanol_j;
    if (methanol_j == param.iter_with_skipped) {
        ++methanol_i;
        methanol_j = 0;
    }
    if (methanol_i == methanol_n) {
        methanol_show_results();
        return;
    }
    methanol_next_iter();
}

function syncronisedStart()
{
    var date = new Date();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    date.setMinutes(minutes + 1);
    date.setSeconds(0);

    var actTime = new Date();
    var startTimeout = date.getTime() - actTime.getTime();

    window.frames[0].document.write("Methanol is starting in " + startTimeout / 1000 + " secs<br/>");
    var t = setTimeout("normalStart()", startTimeout);
}

function normalStart()
{
    methanol_next_iter();
}

function methanol_fire()
{
    param = new MethanolParameter();
    param.setByUrl(location.href);
    if (param.syncStart)
        syncronisedStart();
    else
        normalStart();
}
