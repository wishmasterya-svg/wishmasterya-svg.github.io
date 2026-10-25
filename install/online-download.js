/* The browser saves one verified EXE; hosting assets stay within the per-file limit. */
(()=>{
 const button=document.querySelector('[data-windows-download]'),status=document.getElementById('windows-status'),progress=document.getElementById('windows-progress'),ready=document.getElementById('windows-ready');
 let objectURL,version='',busy=false;const cache=new Map();
 button.addEventListener('click',async()=>{
  if(busy)return;busy=true;button._mitchDownloadBusy=true;
  button.disabled=true;progress.hidden=false;progress.value=0;ready.hidden=true;status.textContent='Загружаем установщик… 0%';
  try{
   const response=await fetch('downloads/windows.json',{cache:'no-cache'});if(!response.ok)throw Error('manifest HTTP '+response.status);const manifest=await response.json();
   if(manifest.name!=='MITCH-CRM-Windows-Setup.exe'||!Array.isArray(manifest.parts)||manifest.parts.length<1||manifest.parts.length>64||manifest.bytes>250000000)throw Error('manifest');
   if(version!==manifest.sha256){cache.clear();version=manifest.sha256;}const parts=[];let loaded=0;
   const report=extra=>{progress.value=Math.min(100,Math.round((loaded+extra)/manifest.bytes*100));status.textContent='Загружаем установщик… '+progress.value+'%';};
   for(const part of manifest.parts){
    if(!/^downloads\/windows-[a-zA-Z0-9.-]+\.bin$/.test(part.url)||part.bytes>16777216||!part.bytes||!/^[a-f0-9]{64}$/.test(part.sha256))throw Error('part');
    const key=part.url+':'+part.sha256;let bytes=cache.get(key);
    if(!bytes)for(let attempt=0;attempt<3;attempt++){
     try{
      const result=await fetch(part.url,{cache:attempt?'reload':'default'});if(!result.ok)throw Error('part HTTP '+result.status);
      if(result.body?.getReader){const reader=result.body.getReader(),chunks=[];let size=0;while(true){const read=await reader.read();if(read.done)break;size+=read.value.byteLength;if(size>part.bytes){await reader.cancel();throw Error('part too large');}chunks.push(read.value);report(size);}const joined=new Uint8Array(size);let offset=0;for(const chunk of chunks){joined.set(chunk,offset);offset+=chunk.byteLength;}bytes=joined.buffer;}else bytes=await result.arrayBuffer();
      if(bytes.byteLength!==part.bytes)throw Error('part size '+bytes.byteLength+' expected '+part.bytes);
      const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');if(hash!==part.sha256)throw Error('part integrity');
      cache.set(key,bytes);break;
     }catch(error){bytes=null;report(0);if(attempt===2)throw error;await new Promise(resolve=>setTimeout(resolve,300*(attempt+1)));}
    }
    parts.push(bytes);loaded+=bytes.byteLength;report(0);
   }
   if(loaded!==manifest.bytes)throw Error('size');if(objectURL)URL.revokeObjectURL(objectURL);
   objectURL=URL.createObjectURL(new Blob(parts,{type:'application/octet-stream'}));ready.href=objectURL;ready.download=manifest.name;ready.hidden=false;
   status.textContent='Откройте скачанный файл. Если скачивание не началось — нажмите «Сохранить установщик».';button.textContent='Установить';ready.click();
  }catch(error){console.warn('MITCH installer download failed:',error.message);status.textContent='Не удалось закончить загрузку. Оставьте страницу открытой и нажмите «Продолжить загрузку».';button.textContent='Продолжить загрузку';}
  finally{busy=false;button._mitchDownloadBusy=false;button.disabled=false;}
 });
})();
