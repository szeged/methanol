/*
 * Copyright (C) 2009-2010 University of Szeged
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

var methanol_id = "Methanol Benchmark (version: 1%)";

var methanol_i = 0;
var methanol_n = methanol_tests.length;
var methanol_j = -1;
var methanol_m;
var methanol_skip;
var methanol_results = new Array(methanol_n + 2);

if (typeof (methanol_override_number_of_skipped) != "undefined" &&  methanol_override_number_of_skipped >= 0)
    methanol_skip = methanol_override_number_of_skipped;
else
    methanol_skip = 3;

if (typeof (methanol_override_number_of_iteration) != "undefined" &&  methanol_override_number_of_iteration > 0)
    methanol_m = methanol_override_number_of_iteration;
else
    methanol_m = 10 + methanol_skip;

function methanol_show_results()
{
    var i, j, k;
    var s = 0;
    for (i = 0; i < methanol_n; ++i) {
        var sub = 0;
        for (j = 0; j < methanol_m - 1; ++j)
            for (k = j + 1; k < methanol_m; ++k)
                if (methanol_results[i][j] < methanol_results[i][k]) {
                    var tmp = methanol_results[i][j];
                    methanol_results[i][j] = methanol_results[i][k];
                    methanol_results[i][k] = tmp;
                }
        for (j = methanol_skip; j < methanol_m; ++j)
            sub += methanol_results[i][j];
        sub = sub / (methanol_m - methanol_skip);
        methanol_results[i][methanol_m] = sub
        s += sub;
    }
    methanol_results[methanol_n] = s;

    var txt = "<html><body><pre>" + methanol_id + "\n<br />\n<br />";
    for (i = 0; i < methanol_n; ++i) {
        var avg = methanol_results[i][methanol_m];
        var sub = 0;
        for (j = methanol_skip; j < methanol_m; ++j) {
            var x = methanol_results[i][j] - avg;
            sub += x * x;
        }
        methanol_results[i][methanol_m + 1] = 100 * Math.sqrt(sub / (methanol_m - methanol_skip)) / avg;
        txt += methanol_tests[i] + ": " + avg + " (" + methanol_results[i][methanol_m + 1] + "%)\n<br />";
    }
    txt += "Summary: " + s + "\n<br />";
    txt += "</pre></body></html>";

    window.frames[0].document.write(txt);
}

function methanol_next_iter(diff)
{
    if (methanol_j == -1)
        methanol_results[methanol_i] = new Array(methanol_m + 2);

    if (methanol_j >= 0 && diff > 0)
        methanol_results[methanol_i][methanol_j] = diff;

    if (methanol_i == methanol_n) {
        methanol_show_results();
        return;
    }

    var frame = document.getElementById("frame");
    frame.src = "";
    frame.src = methanol_tests[methanol_i];

    ++methanol_j;

    if(methanol_j == methanol_m) {
        ++methanol_i;
        methanol_j = -1;
    }
}

// Do NOT try this at home!
function methanol_fire()
{
    methanol_i = 0;
    methanol_j = -1;
    methanol_time = 0;
    methanol_total = 0;
    methanol_num = 0;

    methanol_next_iter();
}

