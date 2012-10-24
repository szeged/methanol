/*
 * Copyright (C) 2010-2012 University of Szeged
 * Copyright (C) 2010-2012 Gabor Loki <loki@inf.u-szeged.hu>
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

var methanol_frame_start;

function nextParameters()
{
    if (drawCount == 1) {
      var date = new Date().getTime();
      var message = {
        start: methanol_frame_start,
        end:   date
      };
      window.parent.postMessage(JSON.stringify(message), "*");
      return;
    }

    startDemo();
}

var workers = null;
var numOfWorkers = 2;
var maxWorkers = 4;
var param_numOfWorkers = 2;
var param_seed = 13;
var param_roughness = 200;
var percent = 0;
var updateCanvasInterval = 10;
var isStarted = false;
var drawCount = 0;

try {
    if (!param_antialias)
        param_antialias = 1;
} catch (err) {
    param_antialias = 1;
}

try {
    if (!param_percentCounter)
        param_percentCounter = 100
} catch (err) {
    param_percentCounter = 100;
}

nextParameters();

    // Alea is from http://baagoe.com/en/RandomMusings/javascript/
    function Alea() {
        return (function(args) {
            // Johannes BaagĂ¸e <baagoe@baagoe.com>, 2010
            var s0 = 0;
            var s1 = 0;
            var s2 = 0;
            var c = 1;

            if (args.length == 0) {
                    args = [+new Date];
            }
            // From http://baagoe.com/en/RandomMusings/javascript/
            // Johannes BaagĂ¸e <baagoe@baagoe.com>, 2010
            function Mash() {
                var n = 0xefc8249d;

                var mash = function(data) {
                    data = data.toString();
                    for (var i = 0; i < data.length; i++) {
                            n += data.charCodeAt(i);
                            var h = 0.02519603282416938 * n;
                            n = h >>> 0;
                            h -= n;
                            h *= n;
                            n = h >>> 0;
                            h -= n;
                            n += h * 0x100000000; // 2^32
                    }
                    return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
                };

                mash.version = 'Mash 0.9';
                return mash;
            }

            var mash = Mash();
            s0 = mash(' ');
            s1 = mash(' ');
            s2 = mash(' ');

            for (var i = 0; i < args.length; i++) {
                    s0 -= mash(args[i]);
                    if (s0 < 0) {
                        s0 += 1;
                    }
                    s1 -= mash(args[i]);
                    if (s1 < 0) {
                        s1 += 1;
                    }
                    s2 -= mash(args[i]);
                    if (s2 < 0) {
                        s2 += 1;
                    }
            }
            mash = null;

            var random = function() {
                    var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
                    s0 = s1;
                    s1 = s2;
                    return s2 = t - (c = t | 0);
            };
            random.uint32 = function() {
                    return random() * 0x100000000; // 2^32
            };
            random.fract53 = function() {
                    return random() + (random() * 0x200000 | 0) * 1.1102230246251565e-16; // 2^-53
            };
            random.version = 'Alea 0.9';
            random.args = args;
            return random;

        } (Array.prototype.slice.call(arguments)));
    };




function startDemo()
{
    if (isStarted)
        return;
    methanol_frame_start = new Date().getTime();
    isStarted = true;
    percent = 0;

    function debug(a) {
        form.text.value = form.text.value + a + "\n";
        form.text.scrollTop = form.text.scrollHeight;;
    }

    function drawPercent() {
        ++percent;
        var p = Math.floor((percent / numOfWorkers / (aheight * 1.5)) * param_percentCounter + 0.5);
        document.getElementById("perc").innerHTML="<h1>"+p+"%</h1>"
    }

    function colorFade(h1, h2, p) {
        return ((h1>>16)+((h2>>16)-(h1>>16))*p)<<16|(h1>>8&0xFF)+((h2>>8&0xFF)-(h1>>8&0xFF))*p<<8|(h1&0xFF)+((h2&0xFF)-(h1&0xFF))*p;
    }

    var i;
    var maxHeight = 65536;
    numOfWorkers = 1;
    var antialias = 1;
    var baseRoughness = Math.floor(Math.random() * 200) + 100;
    var seed = Math.floor(Math.random() * maxHeight);

    if (param_numOfWorkers == 1 || param_numOfWorkers == 2 || param_numOfWorkers == 4) {
        numOfWorkers = param_numOfWorkers;
    } else {
        param_numOfWorkers = numOfWorkers;
    }
    if (param_seed > 0 && param_seed < 0x10000) {
        seed = param_seed;
    } else {
        param_seed = seed;
    }
    if (param_roughness > 0 && param_roughness < 5000) {
        baseRoughness = param_roughness;
    } else {
        param_roughness = baseRoughness;
    }
    if (param_antialias == 1 || param_antialias == 2 || param_antialias == 4 || param_antialias == 8) {
        antialias = param_antialias;
    } else {
        param_antialias = antialias;
    }


    var rand = new Alea(seed);
    param_seed = Math.floor(rand() * 0x10000);

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var height = canvas.height;
    var width = canvas.width;
    var drawPixels = Math.floor(baseRoughness / 50);

    workers = new Array(numOfWorkers);
    for (i = 0; i < numOfWorkers; ++i) {
        workers[i] = new Worker("worker.js");
        workers[i].onmessage = drawWorkerResult;
        workers[i].iData = null;
    }

    var workerDone = 0;
    var dateStart;

    function displace(value, roughness) {
        var v = Math.floor(value + rand() * 2 * roughness - roughness);
        if (v >= maxHeight)
            return value;
        if (v < 0)
            return 0;
        return v;
    }

    function updateWorkerCanvas(i) {
        ctx.putImageData(workers[i].iData, this.startx, 0);
    }

    function colorFade1(h1, h2, p) {
        return ((h1>>16)+((h2>>16)-(h1>>16))*p)<<16|(h1>>8&0xFF)+((h2>>8&0xFF)-(h1>>8&0xFF))*p<<8|(h1&0xFF)+((h2&0xFF)-(h1&0xFF))*p;
    }

    function drawWorkerResult(event) {
        var res = event.data;

        /* Check for end signal */
        if (res.y == -1) {
            ++workerDone;
            if (workerDone == numOfWorkers) {
                var dateDiff = new Date() - dateStart;
                debug("Number of workers: "+numOfWorkers+"  Draw time: " + dateDiff + "ms   (seed: "+seed+")");
                isStarted = false;
                updateCanvas();
                // No Wait
                ++drawCount;
                setTimeout(nextParameters, 1);
            }
            return;
        } else if (res.y == -2) {
            /* Only for debugging */
            console.log(res.data);
            isStarted = false;
            return;
        } else if (res.y == -3) {
            drawPercent();
            return;
        }

        var pxl = res.data;

        var maxBaseHeight = 0.25  * height + 0.25 * res.y;
        var newBaseTop = res.y;
        newBaseTop = (newBaseTop) >> 1;
        var iData = this.iData;
        var arr = iData.data;
        var n = pxl.length;
        var cw = this.width << 2;
        var dy = newBaseTop * cw;
        var maxHeightIndex = height * cw;
        var kend = (this.width * height) << 2;
        for(var i = 0; i < n; i += 4) {
            var hy = (Math.floor((1 - (pxl[i+3] / maxHeight)) * maxBaseHeight) * this.width) << 2;
            var ky = dy + hy + i;
            if (ky >= kend || ky < 0)
                continue;
            var r0 = pxl[i];
            var g0 = pxl[i+1];
            var b0 = pxl[i+2];
            arr[ky]   = r0;
            arr[ky+1] = g0;
            arr[ky+2] = b0;
            arr[ky+3] = 255;

            ky += cw;
            for (var k = drawPixels; k >= 0; --k, ky += cw) {
                if (ky >= kend)
                    break;
                arr[ky]   = r0;
                arr[ky+1] = g0;
                arr[ky+2] = b0;
                arr[ky+3] = 255;
            }
        }
        drawPercent();
    }



    /**************
     * Initialize *
     *************/
    var awidth = Math.floor(width * antialias);
    var aheight = Math.floor((height << 1) * antialias);

    /* Reinit */
    var seey = (height >> 2) - 10;
    ctx.fillStyle = "rgba(160,160,255,254)";
    ctx.fillRect(0, 0, width, seey);

    ctx.fillStyle = "rgba(14,128,255,254)";
    ctx.fillRect(0, seey, width, height - seey);

    /* Genrate borders */
    var borders = new Array(maxWorkers + 1);
    var bd = new Array(maxWorkers + 1);
    for (i = 0; i <= maxWorkers; ++i) {
        bd[i] = new Array(aheight+1);
        bd[i][0] = Math.floor(rand() * maxHeight);
        bd[i][aheight] = Math.floor(rand() * maxHeight);
    }
    var lastUnit = aheight;
    while (lastUnit > 1) {
        var unit = lastUnit >> 1;
        var roughness = baseRoughness * unit / antialias;
        for (var j = unit; j < aheight; j += lastUnit) {
            for (i = 0; i <= maxWorkers; ++i) {
                var l = bd[i][j - unit];
                var h = bd[i][j + unit];
                bd[i][j] = displace((l + h) >> 1, roughness);
            }
        }
        lastUnit = unit;
    }

    for (i = 0; i <= maxWorkers; ++i) {
        borders[i] = "";
        for (j = 0; j <= aheight; ++j)
            borders[i] += String.fromCharCode(bd[i][j]);
        bd[i] = null;
    }
    bd = null;


    dateStart = new Date();
    var nob = Math.floor(maxWorkers / numOfWorkers);
    for (i = 0; i < numOfWorkers; ++i) {
        var w = workers[i];
        var ww = Math.floor(width / numOfWorkers);

        workers[i].startx = i * ww;
        if (i == numOfWorkers -1)
            workers[i].width = width - ww * i;
        else
            workers[i].width = ww;

        var job = {
            jobid     : i,
            antialias : antialias,
            borders   : borders,
            nob       : nob,
            width     : workers[i].width * antialias,
            height    : aheight,
            startx    : i * ww,
            roughness : baseRoughness,
            sun       : 45
        };
        workers[i].iData = ctx.getImageData(job.startx, 0, workers[i].width, height);
        workers[i].update = updateWorkerCanvas;
        workers[i].postMessage(job);
    }
    updateCanvas();
}

function updateCanvas()
{
    for (var i = 0; i < numOfWorkers; ++i) {
        workers[i].update(i);
    }
    if (isStarted)
        setTimeout("updateCanvas()", updateCanvasInterval);
}
