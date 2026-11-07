(function(root){'use strict';
const leaf='<path d="M49 67C21 60 20 32 24 24C48 25 64 42 49 67Z" fill="#658953"/><path d="M49 68L27 29" stroke="#345b37" stroke-width="2"/>';
const flower=(color,center)=>'<g transform="translate(50 45)">'+Array.from({length:5},(_,i)=>'<ellipse rx="11" ry="22" transform="rotate('+i*72+') translate(0 -13)" fill="'+color+'" stroke="#ffffff99"/>').join('')+'<circle r="7" fill="'+center+'"/></g><path d="M50 57L47 83" stroke="#5c7d4e" stroke-width="3"/>';
const wood='<g transform="rotate(-22 50 50)"><path d="M23 32H70V72H23Z" fill="#997044"/><ellipse cx="70" cy="52" rx="14" ry="20" fill="#d8b17d"/><ellipse cx="70" cy="52" rx="9" ry="14" fill="none" stroke="#af8557"/><ellipse cx="70" cy="52" rx="4" ry="7" fill="none" stroke="#af8557"/><path d="M24 41L56 41M25 52L53 52M24 63L56 63" stroke="#6d4c2e" stroke-width="2"/></g>';
const amber='<path d="M22 62L31 33L59 22L78 43L72 71L43 80Z" fill="#c18b37"/><path d="M31 33L52 49L59 22M52 49L78 43M52 49L43 80M52 49L22 62" fill="none" stroke="#f1c76b" stroke-width="3"/>';
function artwork(name){const n=String(name).toLowerCase();let art;
if(/bergamot|lemon|mandarin/.test(n)){const c=/lemon/.test(n)?'#e6c64c':/mandarin/.test(n)?'#e69b43':'#9dad54';art='<ellipse cx="47" cy="55" rx="26" ry="23" fill="'+c+'"/><path d="M47 32Q49 16 72 22Q67 38 47 32" fill="#648052"/><circle cx="64" cy="64" r="19" fill="#f2df9d" stroke="#fff1c8" stroke-width="3"/>'+Array.from({length:8},(_,i)=>'<path d="M64 64L64 47" stroke="'+c+'" stroke-width="2" transform="rotate('+i*45+' 64 64)"/>').join('');}
else if(/pineapple/.test(n))art='<path d="M40 35L29 11L45 24L50 7L56 25L75 14L63 37" fill="#668545"/><ellipse cx="51" cy="58" rx="23" ry="30" fill="#c4a34f"/>'+[-12,0,12].map(x=>'<path d="M'+(30+x)+' 35L'+(73+x)+' 80M'+(74+x)+' 35L'+(31+x)+' 80" stroke="#9c803b" fill="none"/>').join('');
else if(/apple/.test(n))art='<path d="M50 32C25 15 13 45 28 71Q40 89 50 78Q64 87 76 65C91 36 69 19 50 32Z" fill="#afba62"/><path d="M50 34Q47 21 55 15" stroke="#72583d" stroke-width="4"/><path d="M56 22Q60 9 77 17Q74 29 56 22" fill="#5e8048"/>';
else if(/berries|pepper/.test(n)){const color=/pepper/.test(n)?'#c67a76':'#65516d';art=leaf+'<g fill="'+color+'" stroke="#f1e5dd" stroke-width="1">'+[[38,50],[53,43],[67,54],[44,66],[61,71],[28,66]].map(([x,y])=>'<circle cx="'+x+'" cy="'+y+'" r="10"/>').join('')+'</g>';}
else if(/jasmine|blossom|violet|geranium/.test(n))art=flower(/violet/.test(n)?'#c1b1d1':/geranium/.test(n)?'#d7a1ac':'#fffdf2','#dcc06b');
else if(/mint|sage|patchouli|leaf/.test(n))art=leaf+'<g transform="translate(100 0) scale(-1 1)">'+leaf+'</g><path d="M50 46L50 83" stroke="#456543" stroke-width="3"/>';
else if(/vetiver/.test(n))art='<g stroke="#718557" stroke-width="3" fill="none"><path d="M50 66Q25 42 30 20M50 66L46 13M50 66Q70 33 72 21M50 66L63 14"/></g><g stroke="#ab8557" stroke-width="2" fill="none"><path d="M50 62L35 88M50 62L45 91M50 62L58 92M50 62L68 87"/></g>';
else if(/birch/.test(n))art='<g transform="rotate(18 50 50)"><path d="M32 16H64V86H32Z" fill="#e2ded1" stroke="#bdbaac"/><path d="M32 27L47 29M52 39L64 36M32 52L45 49M49 66L64 67M32 77L43 75" stroke="#686d61" stroke-width="4"/></g>';
else if(/vanilla/.test(n))art='<g stroke="#70523c" stroke-width="7" stroke-linecap="round"><path d="M28 80Q55 56 65 19M42 85Q67 59 74 31"/></g><g transform="translate(-14 -6) scale(.75)">'+flower('#f7e6b5','#d7ae59')+'</g>';
else if(/wood/.test(n))art=wood;
else if(/musk/.test(n))art='<path d="M20 61Q28 25 50 40Q74 17 81 47Q84 74 58 75Q30 88 20 61Z" fill="#e8dfcd"/><path d="M29 60Q44 44 65 53M35 72Q50 54 73 62" stroke="#c3b69e" fill="none" stroke-width="3"/>';
else art=amber;
return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="bg"><stop stop-color="#f9f8ef"/><stop offset="1" stop-color="#e7e8d9"/></radialGradient></defs><circle cx="50" cy="50" r="50" fill="url(#bg)"/><ellipse cx="50" cy="83" rx="27" ry="4" fill="#344c3220"/>'+art+'</svg>');}
root.NoteArtwork={image:artwork};if(typeof module==='object')module.exports=root.NoteArtwork;
})(typeof window==='undefined'?globalThis:window);
