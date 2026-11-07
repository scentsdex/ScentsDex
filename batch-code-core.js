/* Public-convention estimates; never manufacturer-confirmed dates.
   Research and supported scope: batch-code-research.md. */
(function(root){'use strict';
const groups={loreal:['Azzaro','Giorgio Armani','Lancôme','Mugler','Prada','Ralph Lauren','Valentino','Yves Saint Laurent'],lvmh:['Dior','Guerlain']};
const unavailable=['Acqua di Parma','Burberry','Byredo','Calvin Klein','Chanel','Chloé','Creed','Dolce & Gabbana','Givenchy','Gucci','Hermès','Hugo Boss','Jean Paul Gaultier','Jo Malone London','Lattafa','Le Labo','Maison Francis Kurkdjian','Maison Margiela','Marc Jacobs','Narciso Rodriguez','Parfums de Marly','Rabanne','Tom Ford','Versace','Viktor & Rolf'];
const brands=[...groups.loreal,...groups.lvmh,...unavailable].sort((a,b)=>a.localeCompare(b));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const aliases={ysl:'Yves Saint Laurent',saintlaurent:'Yves Saint Laurent',armani:'Giorgio Armani',christiandior:'Dior',mfk:'Maison Francis Kurkdjian',pdm:'Parfums de Marly',replica:'Maison Margiela',pacorabanne:'Rabanne'};
function resolveBrand(value){const key=norm(value);return aliases[key]||brands.find(b=>norm(b)===key)||String(value||'').trim();}
function decode(brandInput,codeInput,now=new Date()){
 const brand=resolveBrand(brandInput),code=String(codeInput||'').trim().toUpperCase();
 const base={brand,code,status:'unavailable',date:null};
 if(!brand)return {...base,status:'invalid',message:'Choose a brand first.'};
 if(!/^[A-Z0-9]{2,20}$/.test(code))return {...base,status:'invalid',message:'Enter 2–20 letters or numbers. Use the short batch code, without spaces or symbols.'};
 if(/^\d{8,14}$/.test(code))return {...base,status:'invalid',message:'That looks like a barcode. Look for the shorter batch or lot code on the bottle or box.'};
 let year,month,format,scope;
 if(groups.loreal.includes(brand)){
  format='L’Oréal-style six- or seven-character code';
  if(!/^\d{2}[A-Z][1-9OND][A-Z0-9]{2,3}$/.test(code))return {...base,message:'This code does not match the supported format for '+brand+'. Check every character; older bottles may use another format.'};
  year=({T:2020,U:2021,W:2022,X:2023,Y:2024,Z:2025})[code[2]];
  if(!year)return {...base,message:'This year letter is outside our checked 2020–2025 range. We cannot estimate a date for this code.'};
  month=Number(code[3])||({O:10,N:11,D:12})[code[3]];
  scope='Checked year-letter range: 2020–2025. Older licenses and other factories can use different codes.';
 }else if(groups.lvmh.includes(brand)){
  format='Modern four-character Dior / Guerlain convention';
  if(!/^\d[ABCDEFGHJKLM][A-Z0-9]{2}$/.test(code))return {...base,message:'This code does not match the supported modern format for '+brand+'. Historical formats are not covered.'};
  const digit=Number(code[0]);year=digit>=8?2010+digit:2020+digit;month='ABCDEFGHJKLM'.indexOf(code[1])+1;
  scope='Modern format: 2018–2027. The same code can occur on much older bottles; this code alone cannot establish the decade.';
 }else{return {...base,message:'A checked decoding rule for '+brand+' is not available on ScentsDex yet. Ask the brand’s customer service to date this batch; include photos of the code and packaging.'};}
 if(year>now.getFullYear()||(year===now.getFullYear()&&month>now.getMonth()+1))return {...base,message:'The supported modern format points to a future month. We cannot give a past manufacture date for this code. Check the characters or ask the brand about an older format.'};
 return {...base,status:'estimated',date:{year,month},format,scope,message:'An estimate from a public coding convention. It is not a manufacturer-confirmed date. The day of manufacture is not encoded by this rule.'};
}
const api={brands,groups,resolveBrand,decode};if(typeof module==='object'&&module.exports)module.exports=api;else root.ScentsDexBatch=api;
})(typeof globalThis==='object'?globalThis:this);
