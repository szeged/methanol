/*
 * Copyright (C) 2011-2012 University of Szeged
 * Copyright (C) 2011-2012 Gabor Loki <loki@inf.u-szeged.hu>
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


//////////////////////
// Original workers //
//////////////////////

function originalWorkersNext()
{
  // Clear screen
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0,0,width,height);

  startDate = new Date();
  redWorker.postMessage({cmd:11});
}

function originalWorkers()
{
  if (maxCount >= 0)
    debug("A demo is still running. Please wait a bit!");

  debug(" *** Original workers *** ");

  // Init
  commonInit();
  var initArray = initFireBase();

  maxCount = maxCountInit;
  redWorker = new Worker("worker.js");
  blueWorker = new Worker("worker.js");
  timeArray = new Array(maxCount+1);

  function messageHandler(e) {
    var res = e.data.res;
    switch(res) {
    case -1: {
        debug("ERROR: " + e.data.err);
        break;
      }
    case 0: {
        break;
      }
    case 1: {
        if (e.data.worker == 0) {
          blueWorker.postMessage({cmd:22});
        } else {
          var diff = new Date() - startDate;
          timeArray[maxCount] = diff;
          var n = timeArray.length;
          debug("Draw time (" + (n - maxCount) + "/" + n + "): " + diff + " ms");

          if (maxCount > 0)
            setTimeout(originalWorkersNext, timeout);
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
            methanol_next();
          }
          --maxCount;
        }
        break;
      }
    case 10: {
        var box = e.data.box;
        var x = e.data.x;
        var y = e.data.y;

        blueWorker.postMessage({cmd:21, x:x, y:y, box:box});

        ctx.putImageData(box, x - overscan, y);

        break;
      }
    case 20: {
        var box = e.data.box;
        var x = e.data.x;
        var y = e.data.y;

        ctx.putImageData(box, x - overscan, y);

        break;
      }
    }
  }

  redWorker.onmessage = messageHandler;
  blueWorker.onmessage = messageHandler;

  var redidata = ctx.createImageData(extraWidth, height >> 1);
  var redbox = ctx.createImageData(extraWidth, 16);
  var postMessageTime = new Date();
  redWorker.postMessage({cmd:10, width:extraWidth, height:(height >> 1), init:initArray, idata:redidata, box:redbox, postMessageTime:postMessageTime});

  var blueidata = ctx.createImageData(extraWidth, height >> 1);
  var bluebox = ctx.createImageData(extraWidth, 16);
  var postMessageTime = new Date();
  blueWorker.postMessage({cmd:20, width:extraWidth, height:(height >> 1), idata:blueidata, box:bluebox, postMessageTime:postMessageTime});

  setTimeout(originalWorkersNext, 1);
}

function methanolDemo()
{
  methanol_frame_start = new Date().getTime();
  originalWorkers();
}

function methanol_next()
{
  var date = new Date().getTime();
  var message = {
    start: methanol_frame_start,
    end:   date
  };
  window.parent.postMessage(JSON.stringify(message), "*");
  methanol_frame_start = new Date().getTime();
}
