var finalizer;

function nop(){}

window.addEventListener('popstate', function(e){

   (finalizer || nop)();

   var hash = shower.getSlideHash(shower.getCurrentSlideNumber()).substr(1), demo;

   if (hash.indexOf('demo-') === 0) {
      demo = hash.substr('demo-'.length);
      demos[demo](document.getElementById(hash).firstElementChild);
   }

}, false);

var demos = {
   geolocation: function(ctr) {
      navigator.geolocation.getCurrentPosition(function(pos){
         ctr.innerHTML = '';
         new ymaps.Map(ctr, {
            center: [pos.coords.latitude, pos.coords.longitude],
            zoom: 17
         });
      })
   },
   battery: function(ctr) {

      function setCharging(mgr) {
         var battery = ctr.getElementsByClassName('battery')[0];
         if (mgr.charging) {
            battery.classList.add('charging')
         } else {
            battery.classList.remove('charging');
         }
      }

      function chargingListener(e) {
         setCharging(e.target);
      }

      navigator.getBattery().then(function(mgr){

         ctr.getElementsByClassName('progress')[0].style.width = (mgr.level * 100) + '%';
         setCharging(mgr);

         mgr.addEventListener('chargingchange', chargingListener);

         finalizer = function() {
            mgr.removeEventListener('chargingchange', chargingListener);
         }

      });

   },
   gum: function(dom) {
      var frame = dom.querySelector('iframe');
      frame.src = 'http://idevelop.ro/ascii-camera/';
      finalizer = function() {
         frame.src = '';
      }
   },
   fileapi: function(dom) {
      dom.querySelector('input').addEventListener('change', function(e) {
         var file = this.files[0];
         if (file.type.indexOf('image/') === 0) {
            var reader = new FileReader();
            reader.onload = function(e) {
               var img = dom.querySelector('img');
               img.src = e.target.result;

               var canvas = dom.querySelector('canvas');

               canvas.style.width = img.width + 'px';
               canvas.style.height = img.height + 'px';

               var context = canvas.getContext('2d');
               var x = 0;
               var y = 0;

               context.drawImage(img, x, y);

               var imageData = context.getImageData(x, y, img.width, img.height);
               var data = imageData.data;

               for(var i = 0; i < data.length; i += 4) {
                  // red
                  data[i] = 255 - data[i];
                  // green
                  data[i + 1] = 255 - data[i + 1];
                  // blue
                  data[i + 2] = 255 - data[i + 2];
               }

               // overwrite original image
               context.putImageData(imageData, x, y);

            };
            reader.readAsDataURL(file);
         }
      }, false);
   }
};
