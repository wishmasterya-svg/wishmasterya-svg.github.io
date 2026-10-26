'use strict';
(()=>{
 const $=s=>document.querySelector(s),choices=[...document.querySelectorAll('[data-platform]')];
 let platform=/android/i.test(navigator.userAgent)?'android':/iphone|ipad|macintosh/i.test(navigator.userAgent)?'apple':'windows',config;
 function update(){
  for(const b of choices)b.setAttribute('aria-pressed',String(b.dataset.platform===platform));
  const windows=platform==='windows',direct=windows&&!!config?.windows_download,link=$('#install-link');$('#install-windows').hidden=!windows||direct;link.hidden=windows&&!direct;
  $('#install-windows').disabled=!config?.enabled||!!$('#install-windows')._mitchDownloadBusy;link.removeAttribute('href');link.setAttribute('aria-disabled',String(!config?.enabled));
  if(config?.enabled){link.href=windows&&direct?config.windows_download:platform==='android'?(config.android_download||'Android/MITCH-CRM.apk'):config.login;if(platform==='android'||direct)link.setAttribute('download',direct?'MITCH-CRM-Windows-Setup.exe':'MITCH-CRM.apk');else link.removeAttribute('download');}
  $('#cloud-status').textContent=config?.enabled?'Войдите через Google-аккаунт, которому выдан доступ.':config?'Автоматическая установка готовится. Попробуйте позже.':'Проверяем доступность…';
  $('#device-hint').hidden=platform!=='apple';$('#device-hint').textContent='Откроется веб-версия. Её можно добавить в Dock или на экран iPhone.';
 }
 $('#next').addEventListener('click',()=>{$('#welcome').hidden=true;$('#choose').hidden=false;update();});
 $('#back').addEventListener('click',()=>{$('#welcome').hidden=false;$('#choose').hidden=true;});
 for(const b of choices)b.addEventListener('click',()=>{platform=b.dataset.platform;update();});
 $('#install-link').addEventListener('click',e=>{if(!config?.enabled)e.preventDefault();});
 fetch('cloud.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('cloud');return r.json();}).then(c=>{if(c.format!=='mitch-cloud-v1'||c.enabled&&(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(c.login)||!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(c.backend))||c.windows_download&&!/^https:\/\/github\.com\/wishmasterya-svg\/wishmasterya-svg\.github\.io\/releases\/download\/[A-Za-z0-9._-]+\/MITCH-CRM-Windows-Setup\.exe$/.test(c.windows_download)||c.android_download&&!/^https:\/\/github\.com\/wishmasterya-svg\/wishmasterya-svg\.github\.io\/releases\/(?:download\/[A-Za-z0-9._-]+|latest\/download)\/MITCH-CRM(?:-Test)?\.apk$/.test(c.android_download))throw Error('config');config=c;update();}).catch(()=>{config={enabled:false};update();});update();
})();
