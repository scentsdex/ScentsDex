(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.PhotoImportCore=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const clean=v=>String(v||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const knownBrands=['Maison Francis Kurkdjian','Yves Saint Laurent','Parfums de Marly','Maison Margiela','Dolce & Gabbana','Giorgio Armani','Jean Paul Gaultier','Viktor & Rolf','Christian Dior','Creed','Chanel','Dior','Gucci','Prada','Versace','Burberry','Hermès','Tom Ford','Louis Vuitton','Givenchy','Guerlain','Valentino','Montblanc','Montale','Mancera','Amouage','Nishane','Xerjoff','Byredo','Diptyque','Jo Malone London','Le Labo','Azzaro','Bvlgari','Coach','Lattafa','Armaf','Rasasi','Afnan','Al Haramain','Carolina Herrera','Paco Rabanne','Rabanne','Hugo Boss','Calvin Klein','Issey Miyake','Davidoff'];
  function validBarcode(value){const digits=String(value||'').replace(/[\s-]/g,'');if(/^0+$/.test(digits)||!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(digits))return false;let total=0;for(let i=digits.length-2,weight=3;i>=0;i--,weight=weight===3?1:3)total+=Number(digits[i])*weight;return (10-total%10)%10===Number(digits.at(-1));}
  function barcodeCandidates(text){const raw=String(text||'').match(/(?:\d[ -]?){8,}/g)||[];return [...new Set(raw.map(x=>x.replace(/\D/g,'')).filter(validBarcode))];}
  function equivalents(a,b){const ca=String(a||'').replace(/\D/g,''),cb=String(b||'').replace(/\D/g,'');return validBarcode(ca)&&validBarcode(cb)&&ca.padStart(14,'0')===cb.padStart(14,'0');}
  function parse(texts,brands=[]){
    const text=texts.map(t=>typeof t==='string'?t:t.text||'').join('\n');
    const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),whole=clean(text);
    const all=[...new Set([...brands.map(b=>typeof b==='string'?b:b.name),...knownBrands].filter(Boolean))].sort((a,b)=>b.length-a.length);
    let brand=all.find(b=>(' '+whole+' ').includes(' '+clean(b)+' '))||'';
    if(!brand&&/\bYSL\b/.test(text))brand='Yves Saint Laurent';
    const noise=/(?:eau de|extrait|parfum|perfume|toilette|cologne|natural spray|vaporisateur|ingredients|alcohol|flammable|made in|distributed|www\.|copyright|batch|recycl|fl\.?\s*oz|\b\d+(?:[.,]\d+)?\s*ml\b|pour homme|pour femme|for men|for women|unisex)/i;
    const validName=line=>line.length>=2&&line.length<=65&&/[A-Za-z]/.test(line)&&!noise.test(line)&&!/^\W*\d[\d\s-]+$/.test(line)&&clean(line)!==clean(brand)&&!all.some(b=>clean(line)===clean(b))&&!/^(?:paris|london|new york|france|italy|usa|uk|spray|refillable|tester)$/i.test(line);
    let name='';
    if(brand){
      const index=lines.findIndex(l=>(' '+clean(l)+' ').includes(' '+clean(brand)+' ')||(brand==='Yves Saint Laurent'&&/\bYSL\b/.test(l)));
      if(index>=0){
        const brandLine=brand==='Yves Saint Laurent'?lines[index].replace(/\bYSL\b/ig,''):lines[index];
        const inline=brandLine.replace(new RegExp(brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'ig'),'').trim();
        if(validName(inline)&&!clean(inline).includes(clean(brand)))name=inline;
        if(!name)name=lines.slice(index+1,index+5).find(validName)||lines.slice(Math.max(0,index-2),index).reverse().find(validName)||'';
      }
    }
    const ml=text.match(/\b(\d{1,4}(?:[.,]\d{1,2})?)\s*m[lL]\b/i),oz=text.match(/\b(\d{1,2}(?:[.,]\d{1,2})?)\s*(?:fl[.\s]*)?oz\b/i);
    const number=m=>m?Number(m[1].replace(',','.')):null;
    const concentrations=[[/extrait\s+(?:de\s+)?parfum/i,'Extrait de Parfum'],[/eau\s+de\s+parfum|\bEDP\b/i,'Eau de Parfum (EDP)'],[/eau\s+de\s+toilette|\bEDT\b/i,'Eau de Toilette (EDT)'],[/eau\s+de\s+cologne|\bEDC\b/i,'Eau de Cologne (EDC)'],[/\bparfum\b/i,'Parfum']];
    const concentration=concentrations.find(([re])=>re.test(text))?.[1]||'';
    const male=/pour\s+homme|for\s+men\b|for\s+him\b/i.test(text),female=/pour\s+femme|for\s+women\b|for\s+her\b/i.test(text);
    const gender=/\bunisex\b/i.test(text)||(male&&female)?'Unisex':male?'Men':female?'Women':'';
    const codes=barcodeCandidates(text);
    return {brand,name,concentration,gender,size_ml:number(ml),size_oz:number(oz),barcode:codes.length===1?codes[0]:'',barcodes:codes,description:'',release_year:null,fragrance_family:'',text};
  }
  function missing(value){return [['Brand',value.brand],['Perfume name',value.name],['Concentration',value.concentration],['Size',value.size_ml||value.size_oz],['Barcode',value.barcode],['Gender',value.gender],['Release year',value.release_year],['Fragrance family',value.fragrance_family],['Fragrance notes',null],['Performance',null],['Description',value.description]].filter(([,v])=>v===null||v===undefined||v==='').map(([label])=>label);}
  function validate(value){if(!String(value.brand||'').trim()||!String(value.name||'').trim())throw Error('Confirm the brand and perfume name before adding.');if(value.brand.length>160||value.name.length>200)throw Error('Brand or perfume name is too long.');if(value.barcode&&!validBarcode(value.barcode))throw Error('The barcode check digit is invalid. Retake a clear barcode photo or clear the barcode field.');if(value.size_ml!==null&&value.size_ml!==''&&(!Number.isFinite(Number(value.size_ml))||Number(value.size_ml)<=0||Number(value.size_ml)>10000))throw Error('Enter a valid size in ml.');if(value.size_oz!==null&&value.size_oz!==''&&(!Number.isFinite(Number(value.size_oz))||Number(value.size_oz)<=0||Number(value.size_oz)>500))throw Error('Enter a valid size in fl oz.');return value;}
  const slug=value=>clean(value).replace(/ /g,'-')||'fragrance';
  return {clean,parse,validBarcode,barcodeCandidates,equivalents,missing,validate,slug};
});
