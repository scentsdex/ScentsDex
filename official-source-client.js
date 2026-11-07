(function(){
 'use strict';const C=window.OfficialSourceCore,$=id=>document.getElementById(id);
 function create({db,getIdentity,notify,showLogin}){
  let result=null,key='',generation=0,lookupBusy=false;
  const identityKey=v=>JSON.stringify([C.normalize(v.brand),C.normalize(v.name),C.concentration(v.concentration)]);
  function reset(){generation++;result=null;key='';$('officialResult').hidden=true;$('officialStatus').textContent='Official lookups check the exact name and concentration. If no match is found, paste the official product-page URL.';$('officialUrl').value='';$('useOfficialImage').checked=true;$('officialImage').removeAttribute('src');}
  function value(base){if(!result||identityKey(base)!==key)return base;return {...base,top_notes:result.top_notes,heart_notes:result.heart_notes,base_notes:result.base_notes,main_notes:result.main_notes,source_url:result.source_url,source_name:result.source_name,image_source_url:$('useOfficialImage').checked?result.image_source_url:'',source_checked_at:result.source_checked_at,source_details:{...result.source_details,fields:result.source_details.fields.filter(f=>f!=='description'||base.description===result.description).filter(f=>!['concentration','fragrance_family'].includes(f)||base[f]===result[f]).filter(f=>f!=='image_url'||$('useOfficialImage').checked)},official_image_url:$('useOfficialImage').checked?result.image_url:'',use_official_image:$('useOfficialImage').checked&&!!result.image_url};}
  async function read(identity,manual=false){
   if(lookupBusy)return;if(!identity.brand||!identity.name){$('officialStatus').textContent='Confirm the brand and exact perfume name first.';return;}
   const auth=await db.auth.getSession();if(!auth.data?.session){$('officialStatus').textContent='Sign in with your admin account to fetch official brand details. Photo reading still works without signing in.';if(manual)showLogin();return;}
   const sourceUrl=$('officialUrl').value.trim();try{if(sourceUrl)C.sourceUrl(sourceUrl,identity.brand);}catch(error){$('officialStatus').textContent=error.message;return;}
   lookupBusy=true;$('fetchOfficial').disabled=true;$('officialStatus').textContent='Checking the brand’s official website…';const requestGeneration=++generation;
   try{const {data,error}=await db.functions.invoke('official-fragrance-source',{body:{brand:identity.brand,name:identity.name,concentration:identity.concentration,source_url:sourceUrl||undefined}});if(requestGeneration!==generation)return;if(error)throw Error('Official lookup could not run. Check your admin sign-in and try again.');if(!data?.matched){result=null;$('officialResult').hidden=true;$('officialStatus').textContent=data?.message||'No exact official match was found. Paste the official product-page URL.';return;}
    result=data;key=identityKey(identity);$('officialResult').hidden=false;$('officialLink').textContent=data.source_name;$('officialStatus').textContent='Exact product match found. Review the imported details below.';
    $('officialImage').hidden=!data.image_url;if(data.image_url)$('officialImage').src=data.image_url;$('officialImageChoice').hidden=!data.image_url;
    $('officialNotes').replaceChildren();for(const [label,field] of [['Top notes','top_notes'],['Heart notes','heart_notes'],['Base notes','base_notes'],['Main notes','main_notes']]){if(!data[field]?.length)continue;const p=document.createElement('p'),b=document.createElement('strong');b.textContent=label+': ';p.append(b,document.createTextNode(data[field].join(', ')));$('officialNotes').append(p);}
    if(!$('officialNotes').children.length)$('officialNotes').textContent='The brand did not publish a readable note list. Notes will stay blank.';
    for(const [id,field] of [['concentration','concentration'],['family','fragrance_family'],['description','description']])if(!$(id).value&&data[field])$(id).value=data[field];
    $('officialWarnings').textContent=(data.warnings||[]).join(' ');$('officialChecked').textContent='Source checked '+new Date(data.source_checked_at).toLocaleDateString()+'. Unpublished launch year, performance, season and occasion are not inferred.';
    $('description').dispatchEvent(new Event('input',{bubbles:true}));
   }catch(error){if(requestGeneration===generation)$('officialStatus').textContent=error.message;}
   finally{lookupBusy=false;$('fetchOfficial').disabled=false;}
  }
  $('fetchOfficial').onclick=()=>read(getIdentity(),true);
  $('officialImage').onerror=()=>{$('officialImage').hidden=true;$('useOfficialImage').checked=false;$('officialStatus').textContent='Official details were found, but the brand image could not load. Your selected photo will be used.';};
  for(const id of ['brand','perfumeName','concentration'])$(id).addEventListener('input',()=>{if(result&&identityKey(getIdentity())!==key){result=null;generation++;$('officialResult').hidden=true;$('officialStatus').textContent='The identity changed. Fetch the matching official page again before using its details.';}});
  return {read,reset,value,hasData:()=>!!result,busy:()=>lookupBusy};
 }
 window.OfficialPhotoSource={create};
})();
