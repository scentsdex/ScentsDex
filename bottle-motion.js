(function(){'use strict';
window.addEventListener('scentsdex:profile-ready',({detail:{perfume,brand}})=>{
 if(String(perfume.id)!=='3'||!/^aventus$/i.test(perfume.name||'')||!/creed/i.test(brand))return;
 const image=document.getElementById('profileImage'),surface=image?.parentElement;if(!image||!surface)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 surface.classList.add('bottle-interaction');surface.setAttribute('role','button');surface.tabIndex=0;surface.setAttribute('aria-label','Tilt the Aventus bottle photograph');
 const hint=document.createElement('span');hint.className='bottle-hint';hint.textContent=matchMedia('(hover: hover)').matches?'Move over the bottle · click to tilt':'Tap the bottle to tilt';surface.append(hint);
 let animation=null;const reset=()=>{image.style.transform='';};
 const play=()=>{if(reduced.matches)return;animation?.cancel();reset();animation=image.animate([{transform:'perspective(850px) rotateY(0deg) rotateX(0deg) scale(1)'},{transform:'perspective(850px) rotateY(-9deg) rotateX(3deg) scale(1.035)',offset:.3},{transform:'perspective(850px) rotateY(8deg) rotateX(-2deg) scale(1.025)',offset:.68},{transform:'perspective(850px) rotateY(0deg) rotateX(0deg) scale(1)'}],{duration:1050,easing:'cubic-bezier(.22,.61,.36,1)'});};
 surface.addEventListener('pointermove',event=>{if(reduced.matches||event.pointerType==='touch'||animation?.playState==='running')return;const r=surface.getBoundingClientRect(),x=Math.max(-1,Math.min(1,2*(event.clientX-r.left)/r.width-1)),y=Math.max(-1,Math.min(1,2*(event.clientY-r.top)/r.height-1));image.style.transform='perspective(850px) rotateY('+(x*7).toFixed(2)+'deg) rotateX('+(-y*5).toFixed(2)+'deg) scale(1.035)';});
 surface.addEventListener('pointerleave',reset);surface.addEventListener('pointercancel',reset);surface.addEventListener('blur',reset);surface.addEventListener('click',play);surface.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();play();}});
 reduced.addEventListener('change',()=>{animation?.cancel();reset();});
});
})();
