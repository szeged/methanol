/*
 * Copyright (C) 2010, 2011 University of Szeged
 * Copyright (C) 2010, 2011 Gabor Loki <loki@inf.u-szeged.hu>
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
            random.getSeed = function() {
                return [s0,s1,s2,c];
            }
            random.setSeed = function(seed) {
                s0 = seed[0];
                s1 = seed[1];
                s2 = seed[2];
                c = seed[3];
            }
            return random;

        } (Array.prototype.slice.call(arguments)));
    };

onmessage = function(event) {
    var maxHeight = 65536;
    var i, j;
    var job = event.data;
    var jobid = job.jobid;
    var antialias = job.antialias;
    var width = job.width;
    var height = job.height;
    var borders = job.borders;
    var nob = job.nob;
    var baseRoughness = job.roughness;
    var sun = job.sun;
    var sunY = Math.sin((1-sun/180)*Math.PI);
    var sunX = Math.cos((1-sun/180)*Math.PI);


    function displace(value, roughness) {
        var v = Math.floor(value + rand() * 2 * roughness - roughness);
        if (v < 0)
            return 0;
        if (v >= maxHeight)
            return 2 * (maxHeight - 1) - v;
        return v;
    }

    function colorFade1(h1, h2, p) {
        return ((h1>>16)+((h2>>16)-(h1>>16))*p)<<16|(h1>>8&0xFF)+((h2>>8&0xFF)-(h1>>8&0xFF))*p<<8|(h1&0xFF)+((h2&0xFF)-(h1&0xFF))*p;
    }
    function colorFade(n) {
        var s = n / maxHeight;
        if (s > 0.7)
            return colorFade1(0x8b7765, 0xfffaf0, (n - maxHeight * 0.7) / (maxHeight * 0.3));
        else if (s > 0.45)
            return colorFade1(0xbdb76b, 0x8b7765, (n - maxHeight * 0.45) / (maxHeight * 0.25));
        else if (s > 0.1)
            return colorFade1(0x228b22, 0xbdb76b, (n - maxHeight * 0.1) / (maxHeight * 0.35));
        else if (s > 0.05)
            return colorFade1(0x1e90ff, 0x228b22, (n - maxHeight * 0.05) / (maxHeight * 0.05));
        return colorFade1(0x0e80ff, 0x1e90ff, n / (maxHeight * 0.1));
    }

    function colorToString(h,n) {
        return String.fromCharCode((n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff, h);
    }

    function setLight(diff, color) {
        if (sun) {
            var cosAlfa = -(diff * sunX + sunY) / Math.sqrt(diff * diff + 1);
            cosAlfa = Math.acos(cosAlfa) / Math.PI * 0.2 + 0.8;
            return colorFade1(0x000000, color, cosAlfa);
        }
        return color;
    }

    var heightMap = new Array(width+1);
    for (i = 0; i <= width; ++i) {
        heightMap[i] = new Array(height+1);
    }

    /* Set up borders */
    var bsize = Math.floor(width / nob);
    var bsizeMinusOne = bsize-1;
    for (i = 0; i <= height; ++i)
        for (var w = 0, bi = jobid * nob; w <= width; w += bsize, ++bi)
            heightMap[w][i] = borders[bi].charCodeAt(i);

    var rand = new Alea();

    var seedBuffer = new Array(nob);
    for (var i = 0, bi = jobid * nob; i < nob; ++i, ++bi) {
        var r = new Alea(borders[bi].charCodeAt(0));
        seedBuffer[i] = r.getSeed();
    }

    var seedNum = 0;
    rand.setSeed(seedBuffer[seedNum]);

    var antibase = 0;
    var s = antialias;
    while (s != 1) {
        s >>= 1;
        ++antibase;
    }


    var lastUnit = bsize;
    while (lastUnit > 1) {
        var unit = lastUnit >> 1;
        var y;
        var roughness = baseRoughness * unit / antialias;
        for (y = unit; y < height; y += lastUnit) {
            var x;
            var maxBaseHeight = 0.125 * height + 0.375 * y;
            var newBaseTop = y >> 1;
            var dy = newBaseTop;

            for (x = unit; x < width; x += lastUnit) {
                var left_x = x - unit;
                var right_x = x + unit;
                var top_y = y - unit;
                var bottom_y = y + unit;
                var plt = heightMap[left_x][top_y];
                var plb = heightMap[left_x][bottom_y];
                var prt = heightMap[right_x][top_y];
                var prb = heightMap[right_x][bottom_y]

                var currentSeedNum = Math.floor(x / bsize);
                if (seedNum != currentSeedNum) {
                    seedBuffer[seedNum] = rand.getSeed();
                    seedNum = currentSeedNum;
                    rand.setSeed(seedBuffer[seedNum]);
                }

                var m = displace((plt + plb + prt + prb) >> 2, roughness);

                if (x & bsizeMinusOne) {
                    heightMap[x][y] = m;

                    /* Top point */
                    if (top_y > 0) {
                        heightMap[x][top_y] = displace((plt + prt + m + heightMap[x][top_y - unit]) >> 2, roughness);
                    } else {
                        heightMap[x][top_y] = displace((plt + prt + m) / 3, roughness);
                    }

                    /* NO Right point */

                    /* Bottom point */
                    if (bottom_y == height) {
                        heightMap[x][bottom_y] = displace((plb + prb + m) / 3, roughness);
                    }
                }
                /* Left point */
                if (left_x > 0 && (left_x & bsizeMinusOne))
                    heightMap[left_x][y] = displace((plt + plb + m + heightMap[left_x - unit][y]) >> 2, roughness);

            }
            if (unit == 1) {
                var data0 = new Array();
                if (antialias == 1) {
                    var data1 = new Array();
                    var idx = 0;
                    for (x = 0; x < width; ++x) {
                        /* First line */
                        var h0 = heightMap[x][y-1];
                        var n0 = colorFade(h0);
                        data0[idx]   = n0 >> 16;
                        data0[idx+1] = (n0 >> 8) & 0xff;
                        data0[idx+2] = n0 & 0xff;
                        data0[idx+3] = h0;

                        /* Second line */
                        var h1 = heightMap[x][y];
                        var n1 = colorFade(h1);
                        data1[idx]   = n1 >> 16;
                        data1[idx+1] = (n1 >> 8) & 0xff;
                        data1[idx+2] = n1 & 0xff;
                        data1[idx+3] = h1;
                        idx += 4;
                    }
                    postMessage({y:y-1, data:data0});
                    postMessage({y:y, data:data1});
                } else if (((y+1) % antialias) == 0) {
                    var idx = 0;
                    for (x = 0; x < width; x += antialias) {
                        var sum = 0;
                        var dx, dy;
                        for (dx = 0; dx < antialias; ++dx) {
                            for (dy = 0; dy < antialias; ++dy) {
                                sum += heightMap[x+dx][y-antialias+1+dy];
                            }
                        }
                        sum = sum >> (2 * antibase);
                        var n = colorFade(sum);

                        data0[idx]   = n >> 16;
                        data0[idx+1] = (n >> 8) & 0xff;
                        data0[idx+2] = n & 0xff;
                        data0[idx+3] = sum;
                        idx += 4;
                    }
                    postMessage({y : (y >> antibase), data : data0});
                }
            } else {
                postMessage({y:-3});
            }
        }
        lastUnit = unit;
    }
    postMessage({y:-1});
}
