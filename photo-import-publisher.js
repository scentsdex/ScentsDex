(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./photo-import-core.js'));else root.PhotoImportPublisher=factory(root.PhotoImportCore);})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
 'use strict';
 const check=result=>{if(result.error)throw result.error;return result.data;};
 const literal=s=>String(s).replace(/[\\%_]/g,c=>'\\'+c);
 async function duplicates(db,value){
  if(value.barcode){const b=value.barcode;const possible=[...new Set([b,b.padStart(13,'0'),b.padStart(14,'0'),b.replace(/^0+(?=\d)/,'')])];const variants=check(await db.from('variants').select('perfume_id,upc').in('upc',possible).limit(20))||[];const hits=variants.filter(v=>Core.equivalents(v.upc,b));if(hits.length){const hitIds=[...new Set(hits.map(v=>String(v.perfume_id)))];const rows=check(await db.from('perfumes').select('id,status,slug').in('id',hitIds))||[];if(rows.some(p=>p.status==='Draft'&&String(p.slug||'').startsWith('photo-import-')))throw Error('An interrupted photo import already uses this barcode. Finish that saved import before starting another.');return rows.map(p=>String(p.id));}}
  const brands=check(await db.from('brands').select('id,name').ilike('name',literal(value.brand)).limit(10))||[];
  const ids=brands.filter(b=>Core.clean(b.name)===Core.clean(value.brand)).map(b=>b.id);if(!ids.length)return [];
  const perfumes=check(await db.from('perfumes').select('id,name,concentration,slug,status').in('brand_id',ids).ilike('name',literal(value.name)).limit(20))||[];
  return perfumes.filter(p=>!(p.status==='Draft'&&String(p.slug||'').startsWith('photo-import-'))&&Core.clean(p.name)===Core.clean(value.name)&&(!value.concentration||!p.concentration||Core.clean(p.concentration)===Core.clean(value.concentration))).map(p=>String(p.id));
 }
 async function publish(db,job,photo,persist=()=>{},progress=()=>{}){
  Core.validate(job.value);
  const auth=await db.auth.getUser();if(auth.error||!auth.data?.user||auth.data.user.id!==job.userId)throw Error('Sign in to your admin account again before adding this perfume.');
  if(!job.perfumeId){const own=check(await db.from('perfumes').select('id,status,image_url').eq('slug','photo-import-'+job.id).maybeSingle());if(own){job.perfumeId=own.id;persist(job);}}
  if(!job.perfumeId){progress('Checking for an existing perfume…');const matches=await duplicates(db,job.value);if(matches.length)return {existing:true,id:matches[0],ambiguous:matches.length>1};}
  const bucket=db.storage.from('perfume-images');
  if(!job.imageUrl){
   if(!photo)throw Error('Select your bottle photo again to continue this interrupted upload.');
   progress('Uploading your prepared bottle photo…');
   job.imagePath=job.imagePath||('photo-'+job.id+'.jpg');persist(job);
   const upload=await bucket.upload(job.imagePath,photo,{contentType:'image/jpeg',upsert:false,cacheControl:'31536000'});
   if(upload.error){if(String(upload.error.statusCode||upload.error.status)!=='409'&&!/already exists|duplicate/i.test(upload.error.message||''))throw upload.error;const existing=await bucket.download(job.imagePath);check(existing);}
   job.imageUrl=bucket.getPublicUrl(job.imagePath).data.publicUrl;persist(job);
  }
  if(!job.brandId){
   progress('Matching the fragrance house…');
   let brands=check(await db.from('brands').select('id,name').ilike('name',literal(job.value.brand)).limit(10))||[];
   let brand=brands.find(b=>Core.clean(b.name)===Core.clean(job.value.brand));
   if(!brand){const inserted=await db.from('brands').insert({name:job.value.brand,slug:Core.slug(job.value.brand)}).select('id').single();if(inserted.error){brands=check(await db.from('brands').select('id,name').ilike('name',literal(job.value.brand)).limit(10))||[];brand=brands.find(b=>Core.clean(b.name)===Core.clean(job.value.brand));if(!brand)throw inserted.error;}else brand=inserted.data;}
   job.brandId=brand.id;persist(job);
  }
  if(!job.perfumeId){
   progress('Creating the perfume record…');
   const v=job.value;
   const perfume=check(await db.from('perfumes').insert({brand_id:job.brandId,name:v.name,slug:'photo-import-'+job.id,gender:v.gender||null,concentration:v.concentration||null,release_year:v.release_year||null,fragrance_family:v.fragrance_family||null,description:v.description||null,image_url:job.imageUrl,longevity:null,projection:null,status:'Draft'}).select('id').single());
   job.perfumeId=perfume.id;persist(job);
  }
  if(!job.variantDone){
   progress('Saving size and barcode…');
   const v=job.value;
   if(v.barcode||v.size_ml||v.size_oz){
    const all=check(await db.from('variants').select('id,upc,size_ml,size_oz').eq('perfume_id',job.perfumeId))||[];
    const found=all.find(x=>(x.upc||'')===(v.barcode||'')&&Number(x.size_ml||0)===Number(v.size_ml||0)&&Number(x.size_oz||0)===Number(v.size_oz||0));
    if(!found)check(await db.from('variants').insert({perfume_id:job.perfumeId,size_ml:v.size_ml||null,size_oz:v.size_oz||null,upc:v.barcode||null,image_url:job.imageUrl}));
   }
   job.variantDone=true;persist(job);
  }
  progress('Publishing to ScentsDex…');
  check(await db.from('perfumes').update({status:'Published'}).eq('id',job.perfumeId));
  job.complete=true;persist(job);
  return {existing:false,id:job.perfumeId};
 }
 return {publish,duplicates};
});
