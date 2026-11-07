(()=>{'use strict';
const core=window.ScentsDexBatch,$=id=>document.getElementById(id),brand=$('batchBrand'),code=$('batchCode'),form=$('batchForm'),result=$('batchResult');
for(const name of core.brands){const option=document.createElement('option');option.value=name;$('brandList').append(option);}
function reset(){result.hidden=true;code.setCustomValidity('');code.disabled=!brand.value.trim();$('searchBatch').disabled=code.disabled;}
brand.addEventListener('input',reset);code.addEventListener('input',()=>{result.hidden=true;code.setCustomValidity('');});
brand.addEventListener('change',()=>{brand.value=core.resolveBrand(brand.value);});
form.addEventListener('submit',event=>{event.preventDefault();const data=core.decode(brand.value,code.value);if(data.status==='invalid'){code.setCustomValidity(data.message);code.reportValidity();return;}
 brand.value=data.brand;code.value=data.code;$('resultBrand').textContent=data.brand;$('resultCode').textContent=data.code;
 const estimated=data.status==='estimated';$('resultStatus').textContent=estimated?'Estimated date':'Date unavailable';result.dataset.state=data.status;
 $('resultDate').textContent=estimated?new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(data.date.year,data.date.month-1,1))):'We couldn’t date this batch.';
 $('resultMessage').textContent=data.message;$('resultScope').textContent=data.scope||'';$('resultScope').hidden=!data.scope;
 $('resultSource').hidden=!estimated;result.hidden=false;$('resultHeading').focus();
});
$('tryExample').addEventListener('click',()=>{brand.value='Yves Saint Laurent';reset();code.value='38Y100';form.requestSubmit();});reset();
})();