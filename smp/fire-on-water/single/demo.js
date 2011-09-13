/*
 * Copyright (C) 2011 University of Szeged
 * Copyright (C) 2011 Gabor Loki <loki@inf.u-szeged.hu>
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

var maxCountInit = 2;
var timeout = 1;
var maxCount = -1;

var canvas;
var ctx;
var width;
var extraWidth;
var initLength;
var overscan;
var height;
var startDate;
var redWorker;
var blueWorker;
var timeArray;
var rbox;
var bbox;

function commonInit()
{
  overscan = 20;
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  width = canvas.width;
  extraWidth = width <<2//+ (overscan << 1);
  initLength = width <<2//<< 1;
  height = canvas.height;

  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0,0,width,height);
}

function debug(a) {
  form.text.value = form.text.value + a + "\n";
  form.text.scrollTop = form.text.scrollHeight;;
}

function initFireBase()
{
  var initArray = new Array(initLength + 5);
  for(var i = initLength; i >= 0; --i) {
    initArray[i] = Math.floor(Math.random() * 130);
  }
  var num = Math.floor(Math.random() * 10) + 10;
  var wide = Math.floor(Math.random() * 50) + 50;
  for(var i = num -1; i >= 0; --i) {
    var x = Math.floor(Math.random() * width) - (wide >> 1);
    var n = x + (wide >> 1);
    if (x < 0)
      x = 0;
    if (n > initLength)
      n = initLength;
    var last = 0;
    for(; x < n; ++x) {
      if (Math.random() > 0.3 + last) {
        initArray[x] = 255;
        last += 0.05;
      } else {
        initArray[x] = Math.floor(Math.random() * 200);
        last = 0;
      }
    }
  }
  return initArray;
}

function initFireBaseWithUint32()
{
  var initArray = new Uint32Array(initLength + 5);
  for(var i = initLength; i >= 0; --i) {
    initArray[i] = (Math.random() * 130);
  }
  var num = Math.floor(Math.random() * 10) + 10;
  var wide = Math.floor(Math.random() * 50) + 50;
  for(var i = num -1; i >= 0; --i) {
    var x = Math.floor(Math.random() * width) - (wide >> 1);
    var n = x + (wide >> 1);
    if (x < 0)
      x = 0;
    if (n > initLength)
      n = initLength;
    var last = 0;
    for(; x < n; ++x) {
      if (Math.random() > 0.3 + last) {
        initArray[x] = 255;
        last += 0.05;
      } else {
        initArray[x] = (Math.random() * 200);
        last = 0;
      }
    }
  }
  return initArray;
}


////////////////////////////////
// Single thread (no workers) //
////////////////////////////////

function singleThreadNext()
{
  // Clear screen
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0,0,width,height);

  fireSingleThread()
}

function singleThread()
{
  if (maxCount >= 0)
    debug("A demo is still running. Please wait a bit!");
  else {
    debug(" *** Single thread (no worker) *** ");

    maxCount = maxCountInit;
    timeArray = new Array(maxCount+1);

    fireSingleThread();
  }
}

function fireSingleThread()
{
  // Init
  commonInit();
  var init = initFireBase();

  function colorFade(h1, h2, p)
  {
    return ((h1>>16)+((h2>>16)-(h1>>16))*p)<<16|(h1>>8&0xFF)+((h2>>8&0xFF)-(h1>>8&0xFF))*p<<8|(h1&0xFF)+((h2&0xFF)-(h1&0xFF))*p;
  }

  function fireColors(n)
  {
    var s = n / 256;
    if (s > 0.8)       return colorFade(0xff8c00, 0xffe0e0, (n - 256 * 0.8) / (256 * 0.2));
    else if (s > 0.65) return colorFade(0xff2400, 0xff8c00, (n - 256 * 0.65) / (256 * 0.15));
    else if (s > 0.55)  return colorFade(0xb22222, 0xff2400, (n - 256 * 0.55) / (256 * 0.1));
    else if (s > 0.4)  return colorFade(0x111111, 0xb22222, (n - 256 * 0.4) / (256 * 0.15));
    else if (s > 0.25) return colorFade(0x3e2222, 0x111111, (n - 256 * 0.25) / (256 * 0.15));//5e1111
    return colorFade(0x000000, 0x3e2222, n / (256 * 0.25));
  }

  var w = extraWidth;
  var h = height >> 1;
  var widthOffset = w << 2;

  var idata   = ctx.createImageData(extraWidth, h);
  var redbox  = ctx.createImageData(extraWidth, 16);
  var bluebox = ctx.createImageData(extraWidth, 16);
  var pxl        = idata.data;
  var pxlredbox  = redbox.data;
  var pxlbluebox = bluebox.data;

  // Waves
  var waves = new Array(h);
  for(var i = h - 1; i >= 0; --i)
    waves[i] = new Object();

  var f1 = 5;
  var f2 = 8;
  for(var i = 0; i < f1; ++i) {
    waves[i].prev = 0;
    waves[i].next = f1;
  }
  while(f1 < h) {
    var low = f1;
    var mid = Math.floor((f1+f2)/2);
    for(var i = low; i < mid && i < h; ++i) {
      waves[i].prev = low;
      waves[i].next = mid;
    }
    var high = f2;
    for(var i = mid; i < high && i < h; ++i) {
      waves[i].prev = mid;
      waves[i].next = high;
    }

    var f = f1 + f2;
    f1 = f2;
    f2 = f;
  }

  var startDate = new Date();

  // Wrap grid
  var wuint = 16; // shift by 4
  var wgridwidth = (w >> 4) + 1;
  var wgridheight = (h >> 4) + 1;
  var wgridlen = wgridwidth * wgridheight;
  var wgrid = new Array(wgridlen);

  // Generate wrap grid
  offset = wgridlen - 1;
  for(var gy = wgridheight - 1; gy >= 0; --gy) {
    for(var gx = wgridwidth - 1; gx >= 0; --gx) {
      wgrid[offset] = new Object();
      var ox = gx << 4;
      var oy = gy << 4;

      wgrid[offset].x = ox;
      wgrid[offset].y = oy;

      var displace = (wgridheight + 2 - gy) << 2;
      var displaceby2 = displace >> 1;
      var wx = Math.floor(ox + Math.random() * (displace) - displaceby2);
      if (wx < 0)
        wx = 0;
      if (wx > w-1)
        wx = w-1;
      wgrid[offset].wx = wx;
      wgrid[offset].wy = oy;

      --offset;
    }
  }

  // Bottom line
  var maxOffset = widthOffset * h;
  var initOffset = 0;
  for(offset = widthOffset * (h-1); offset <= maxOffset; offset += 4) {
    pxl[offset] = Math.floor((init[initOffset] +
                              init[initOffset + 1] +
                              init[initOffset + 2]) / 3)
    pxl[offset + 1] = 0;
    pxl[offset + 2] = 0;
    ++initOffset;
  }

  // Additional 15 lines from bottom
  var bottom15 = widthOffset * (h-16);
  for(offset = widthOffset * (h-1) - 4; offset >= bottom15; offset -= 4) {
    pxl[offset] = Math.floor(((pxl[offset + widthOffset - 4] +
                               pxl[offset + widthOffset] +
                               pxl[offset + widthOffset + 4]) / 3
                              -1)) % 256;
    pxl[offset + 1] = 0;
    pxl[offset + 2] = 0;
  }


  for(offset = wgridlen - 1 - wgridwidth - 1; offset >= 0; --offset) {
    // Wrapped box
    var A = wgrid[offset];
    if (A.x == w)
      continue;
    var B = wgrid[offset + 1];
    var C = wgrid[offset + wgridwidth];
    var D = wgrid[offset + wgridwidth + 1];

    // Rate of changes
    var rlx = (C.wx - A.wx) / 16;
    var rly = (C.wy - A.wy) / 16;
    var rrx = (D.wx - B.wx) / 16;
    var rry = (D.wy - B.wy) / 16;

    var tx1 = A.wx;
    var ty1 = A.wy;
    var tx2 = B.wx;
    var ty2 = B.wy;

    for(var gy = 0; gy < 16; ++gy) {
      var hdx = (tx2 - tx1) / 16;
      var hdy = (ty2 - ty1) / 16;
      var tx = tx1;
      var ty = ty1;

      for(var gx = 0; gx < 16; ++gx) {
        var x = A.x + gx;
        var y = A.y + gy;

        var rgb = fireColors(pxl[(w * Math.floor(ty) + Math.floor(tx)) << 2]);

        var boxOffset = ((gy * w) + x) << 2;
        pxlredbox[boxOffset] = (rgb >> 16) & 0xff;
        pxlredbox[boxOffset + 1] = (rgb >> 8) & 0xff;
        pxlredbox[boxOffset + 2] = rgb & 0xff;
        pxlredbox[boxOffset + 3]= 255;

        tx += hdx;
        ty += hdy;
      }

      tx1 += rlx;
      ty1 += rly;
      tx2 += rrx;
      ty2 += rry;
    }
    if ((offset % wgridwidth) == 0) {
      ctx.putImageData(redbox, A.x - overscan, A.y);

      var basex = A.x;
      var basey = (h << 1) - A.y - 16;
      for(var y = 0; y < 16; ++y) {
        var n = (basey - h + y);
        var prev = waves[n].prev;
        var next = waves[n].next;
        var size = next - prev;
        var ratio = Math.sin((n - prev) / size * 2 * Math.PI);
        var displace = ratio * size / 6;
        var lumi = 0.9 + 0.1 * (1 + ratio) / 2;
        for (var x = 0; x < w; ++x) {
          var o = ((y * w) + x) << 2;
          var m = (((15 - y) * w) + x + displace) << 2;
          pxlbluebox[o]     = (pxlredbox[m] * 0.8);
          pxlbluebox[o + 1] = (pxlredbox[m + 1] * 0.8);
          pxlbluebox[o + 2] = (pxlredbox[m + 2] * 0.8 + 50);
          pxlbluebox[o + 3] = pxlredbox[m + 3] * lumi;
        }
      }

      ctx.putImageData(bluebox, basex - overscan, basey);

      // Fire for all other lines
      var off   = widthOffset * (A.y) - 4;
      var off16 = widthOffset * (A.y - 16);
      for(; off >= off16; off -= 4) {
        pxl[off] = Math.abs(Math.floor(((pxl[off + widthOffset - 4] +
                                         pxl[off + widthOffset] +
                                         pxl[off + widthOffset] +
                                         pxl[off + widthOffset + 4]) >> 2
                                      ) ) % 256);
        pxl[off + 1] = 0;
        pxl[off + 2] = 0;
      }
    }
  }

  var diff = new Date() - startDate;
  timeArray[maxCount] = diff;
  var n = timeArray.length;
  debug("Draw time (" + (n - maxCount) + "/" + n + "): " + diff + " ms");
  if (maxCount > 0)
    setTimeout(singleThreadNext, timeout);
  else {
    var sum = 0;
    n = n - 1;
    var i = n;
    for(; i > 0; --i)
      for(var j = i - 1; j >= 0; --j) {
        if (timeArray[i] < timeArray[j]) {
          var tmp = timeArray[i];
          timeArray[i] = timeArray[j];
          timeArray[j] = tmp;
        }
      }
    for(i = n; i >= 0; i--)
      sum += timeArray[i];
      var med;
      if((n+1) % 2) {
        med = timeArray[n >> 1];
      } else {
        med = (timeArray[(n >> 1)] + timeArray[(n >> 1)+1]) / 2;
      }
      debug("Draw time median: " + med + " ms  shortest: " + timeArray[0] + " ms  longest: " + timeArray[n] + " ms");
      setTimeout(top.methanol_next,1);
  }
  --maxCount;
}


function methanolDemo()
{
  singleThread();
}
