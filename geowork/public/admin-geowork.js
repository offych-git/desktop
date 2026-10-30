/* GeoWork CMS — a first-party editor. No GitHub or external CMS auth. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  let articles = [];
  let current = null;
  let cover = null;
  let busy = false;
  let autoSlug = true;

  async function api(path, options = {}) {
    const response = await fetch(path, { credentials:'same-origin', cache:'no-store', ...options });
    let data;
    try { data=await response.json(); } catch { data={error:'Unexpected response from the server.'}; }
    if (!response.ok) throw new Error(data.error || ('Request failed: '+response.status));
    return data;
  }
  const json = (method, body) => ({ method, headers:{'content-type':'application/json'}, body:JSON.stringify(body) });
  function flash(message, error=false) {
    const panel=byId('notice');
    panel.textContent=message;
    panel.className='notice'+(error?' error':'');
    panel.hidden=false;
    clearTimeout(flash.timer);
    flash.timer=setTimeout(()=>{ panel.hidden=true; },6500);
  }
  function loginError(msg) {
    byId('loginError').textContent=msg;
    byId('loginError').hidden=false;
  }
  function setAuthenticated(yes) {
    byId('workspace').hidden=!yes;
    byId('loginView').hidden=yes;
  }
  function date(value) {
    if (!value) return 'Not published';
    const d=new Date(value);
    return Number.isNaN(d.valueOf())?'Unknown':new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric'}).format(d);
  }
  async function load() {
    const data=await api('/api/cms/posts');
    articles=data.articles||[];
    byId('articleCount').textContent=String(articles.length);
    renderList();
  }
  function renderList() {
    const q=byId('searchPosts').value.toLowerCase().trim();
    const filter=byId('filterStatus').value;
    const list=byId('postList');
    list.replaceChildren();
    const found=articles.filter(p => (!filter||p.status===filter)
      &&(!q||(p.title+' '+p.slug+' '+p.category).toLowerCase().includes(q)));
    if(!found.length){
      const empty=document.createElement('div');
      empty.className='post-row';
      empty.textContent=articles.length?'No matching articles.':'No articles yet. Create your first post using New article.';
      list.append(empty);
      return;
    }
    for(const post of found) {
      const button=document.createElement('button');
      button.className='post-row';
      button.type='button';
      const content=document.createElement('div');
      const h=document.createElement('h3');h.textContent=post.title;
      const p=document.createElement('p');p.textContent=post.category+' · /blog/'+post.slug;
      content.append(h,p);
      const meta=document.createElement('div');meta.className='meta';
      const label=document.createElement('span');label.className='pill '+post.status;
      label.textContent=post.status==='published'?'Published':'Draft';
      const small=document.createElement('div');
      small.textContent=post.status==='published'?date(post.published_at):'Last saved '+date(post.updated_at);
      meta.append(label,small);
      button.append(content,meta);
      button.addEventListener('click',()=>openEditor(post.id));
      list.append(button);
    }
  }
  function showList() {
    byId('listView').hidden=false;
    byId('editorView').hidden=true;
    byId('notice').hidden=true;
    current=null;
  }
  function slugify(v) {
    return v.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,110);
  }
  function setEditor(post=null) {
    current=post;
    byId('slug').readOnly=Boolean(post);
    byId('slug').title=post?'To change the URL, create a new article.':'Choose a clear permanent URL slug.';
    cover=post?.cover_image||null;
    autoSlug=!post;
    byId('listView').hidden=true;
    byId('editorView').hidden=false;
    byId('editorTitle').textContent=post?'Edit article':'New article';
    byId('title').value=post?.title||'';
    byId('slug').value=post?.slug||'';
    byId('description').value=post?.description||'';
    byId('category').value=post?.category||'AI Search';
    byId('bodyEditor').innerHTML=post?.body_html||'';
    byId('statusBadge').textContent=post?.status==='published'?'● Published':'● Draft';
    byId('statusBadge').className='status-pill'+(post?.status==='published'?' live':'');
    byId('updatedLabel').textContent=post?'Updated '+date(post.updated_at):'Not saved yet';
    byId('descCount').textContent=String((post?.description||'').length)+' / 400';
    byId('liveArticleLink').href=post?'/blog/'+post.slug:'#';
    byId('liveArticleLink').hidden=post?.status!=='published';
    byId('deleteArticle').hidden=!post;
    renderCover();
    byId('title').focus();
    window.scrollTo({top:0});
  }
  async function openEditor(id){
    try {
      const data=await api('/api/cms/posts?id='+encodeURIComponent(id));
      setEditor(data.article);
    }catch(e){flash(e.message,true);}
  }
  function renderCover(){
    const el=byId('coverPreview');el.replaceChildren();
    if(!cover){el.textContent='No image added';return;}
    const img=document.createElement('img');img.src=cover;img.alt='Selected cover image';
    el.append(img);
  }
  function gather(status) {
    const data={
      id:current?.id,
      updated_at:current?.updated_at,
      title:byId('title').value.trim(),
      slug:byId('slug').value.trim().toLowerCase(),
      description:byId('description').value.trim(),
      category:byId('category').value.trim(),
      cover_image:cover,
      body_html:byId('bodyEditor').innerHTML,
      status
    };
    if(!data.slug) data.slug=slugify(data.title);
    return data;
  }
  async function save(status) {
    if(busy)return;
    busy=true;
    for(const id of ['saveDraft','publishArticle'])byId(id).disabled=true;
    try{
      const payload=gather(status);
      const result=await api('/api/cms/posts',json(current?'PUT':'POST',payload));
      setEditor(result.article);
      await load();
      flash(status==='published'?'Article published. Public page is now available.':'Draft saved.');
    }catch(e){flash(e.message,true);}
    finally{busy=false;for(const id of ['saveDraft','publishArticle'])byId(id).disabled=false;}
  }
  function exec(command,value) {
    byId('bodyEditor').focus();
    document.execCommand(command,false,value||undefined);
  }
  function insertText(v) {
    exec('insertText',v);
  }
  function upload() {byId('imageFile').click();}
  async function uploadImage(file,asCover) {
    if(!file)return;
    if(file.size>4_000_000){flash('Image exceeds 4 MB.',true);return;}
    const form=new FormData();form.append('file',file);
    try{
      flash('Uploading image…');
      const {url}=await api('/api/cms/upload',{method:'POST',body:form});
      if(asCover){cover=url;renderCover();}
      else{
        byId('bodyEditor').focus();
        const alt=window.prompt('Describe this image for accessibility:','')||'';
        const img='<img src="'+url+'" alt="'+alt.replace(/[&<>"']/g,'')+'" loading="lazy">';
        exec('insertHTML',img);
      }
      flash('Image uploaded.');
    }catch(e){flash(e.message,true);}
  }
  async function start() {
    try{
      const state=await api('/api/cms/session');
      setAuthenticated(Boolean(state.authenticated));
      if(state.authenticated)await load();
    }catch(e){setAuthenticated(false);loginError('Site is not available. Try again later.');}
  }

  byId('loginForm').addEventListener('submit',async e=>{
    e.preventDefault();byId('loginError').hidden=true;
    const btn=e.currentTarget.querySelector('button[type=submit]');btn.disabled=true;
    try{
      await api('/api/cms/session',json('POST',{email:byId('loginEmail').value,password:byId('loginPassword').value}));
      byId('loginPassword').value='';
      setAuthenticated(true);await load();
    }catch(err){loginError(err.message);}
    finally{btn.disabled=false;}
  });
  byId('signOut').addEventListener('click',async()=>{
    try{await api('/api/cms/session',{method:'DELETE'});}catch{}
    articles=[];current=null;setAuthenticated(false);byId('loginPassword').value='';
  });
  byId('newPost').addEventListener('click',()=>setEditor());
  byId('newPostSidebar').addEventListener('click',()=>setEditor());
  byId('allPosts').addEventListener('click',showList);
  byId('backToList').addEventListener('click',showList);
  byId('searchPosts').addEventListener('input',renderList);
  byId('filterStatus').addEventListener('change',renderList);
  byId('title').addEventListener('input',()=>{if(autoSlug)byId('slug').value=slugify(byId('title').value);});
  byId('slug').addEventListener('input',()=>{autoSlug=false;});
  byId('description').addEventListener('input',()=>{byId('descCount').textContent=byId('description').value.length+' / 400';});
  byId('saveDraft').addEventListener('click',()=>save('draft'));
  byId('publishArticle').addEventListener('click',()=>save('published'));
  byId('removeCover').addEventListener('click',()=>{cover=null;renderCover();});
  byId('uploadCover').addEventListener('click',()=>{byId('imageFile').dataset.mode='cover';upload();});
  byId('insertImage').addEventListener('click',()=>{byId('imageFile').dataset.mode='inline';upload();});
  byId('imageFile').addEventListener('change',async e=>{
    await uploadImage(e.target.files[0],e.target.dataset.mode==='cover');e.target.value='';
  });
  for(const btn of document.querySelectorAll('[data-command]')){
    btn.addEventListener('click',()=>exec(btn.dataset.command));
  }
  for(const btn of document.querySelectorAll('[data-block]')){
    btn.addEventListener('click',()=>exec('formatBlock',btn.dataset.block));
  }
  byId('insertLink').addEventListener('click',()=>{
    const value=window.prompt('Paste an https:// URL:');
    if(value && /^https?:\/\//i.test(value))exec('createLink',value);
    else if(value)flash('Only http:// and https:// links are allowed.',true);
  });
  // Prevent arbitrary pasted HTML/scripts; maintain a predictable editor model.
  byId('bodyEditor').addEventListener('paste',e=>{
    e.preventDefault();
    insertText(e.clipboardData.getData('text/plain'));
  });
  byId('previewArticle').addEventListener('click',()=>{
    const content=byId('previewContent');content.replaceChildren();
    const title=document.createElement('h1');title.textContent=byId('title').value||'Untitled article';
    const body=document.createElement('div');
    body.innerHTML=byId('bodyEditor').innerHTML;
    content.append(title,body);
    byId('previewOverlay').hidden=false;
  });
  byId('closePreview').addEventListener('click',()=>{byId('previewOverlay').hidden=true;});
  byId('previewOverlay').addEventListener('click',e=>{if(e.target.id==='previewOverlay')e.target.hidden=true;});
  byId('deleteArticle').addEventListener('click',async()=>{
    if(!current||!window.confirm('Permanently delete this article? This cannot be undone.'))return;
    try{
      await api('/api/cms/posts?id='+encodeURIComponent(current.id),{method:'DELETE'});
      showList();await load();flash('Article deleted.');
    }catch(e){flash(e.message,true);}
  });
  start();
})();
